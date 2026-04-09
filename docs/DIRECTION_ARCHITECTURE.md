# معماری سیستم Direction (RTL / LTR / Auto)

این سند توصیف‌کننده معماری قطعی (Deterministic) و بدون ابهام برای پشتیبانی کامل از زبان‌های راست‌به‌چپ (RTL) و چپ‌به‌راست (LTR) در ویرایشگر Editorn است.

## ۱. معماری کامل سیستم Direction
سیستم بر اساس یک `DirectionManager` مرکزی کار می‌کند که به عنوان تنها منبع حقیقت (Single Source of Truth) برای تعیین جهت هر بلوک عمل می‌کند. هر بلوک متنی به طور مستقل جهت خود را مدیریت می‌کند اما از تنظیمات سراسری ادیتور (`rtl`, `ltr`, `auto`) پیروی می‌کند. هیچ استایل یا صفت `dir` غیرمتمرکزی مجاز نیست.

در حالت `rtl` یا `ltr` مطلق، مقدار مستقیماً به صفت `dir` عنصر بلوک (`<div class="editorn-block">`) اعمال می‌شود.
در حالت `auto`، `DirectionManager` در هر رویداد `input` محتوای متنی بلوک را آنالیز کرده و صفت `dir` را در سطح بلوک به‌روزرسانی می‌کند.

## ۲. الگوریتم دقیق Auto-Detect (First Strong Character)
برای حالت `auto`، از الگوریتم قطعی زیر (بر اساس استانداردهای Unicode) برای پیدا کردن اولین کاراکتر قوی استفاده می‌کنیم. تمام کاراکترهای خنثی (اعداد، فاصله‌ها، علائم نگارشی) نادیده گرفته می‌شوند.

```javascript
const RTL_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
const LTR_REGEX = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF]/;

function detectDirection(text) {
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (RTL_REGEX.test(char)) return 'rtl';
    if (LTR_REGEX.test(char)) return 'ltr';
  }
  // Fallback برای متن‌های کاملاً خنثی (مثلاً فقط اعداد یا علائم)
  return 'ltr';
}
```

## ۳. مدیریت Cursor (Low-Level) و چالش‌های contenteditable
مرورگرها در `contenteditable` هنگام رسیدن به مرزهای متون Mixed (مثلاً کلمه انگلیسی در وسط جمله فارسی) رفتار بصری غیرقابل پیش‌بینی دارند (پرش کرسر).
برای رفع این مشکل به صورت **قطعی**:
- ما از ویژگی‌های `unicode-bidi: isolate` استفاده می‌کنیم تا هر گره متنی یا تگ inline به عنوان یک محیط ایزوله در نظر گرفته شود.
- **استراتژی کیبورد:** مرورگر به صورت پیش‌فرض Arrow Keys را به صورت *بصری* (Visual) مدیریت می‌کند، نه منطقی. با ایزوله کردن بافت متنی (`isolate`)، رفتار بصری مرورگرها استانداردتر می‌شود.
- در حالت انتهای خط (End of Line) در متن RTL، کرسر تمایل دارد به سمت دیگر بپرد. با قرار دادن یک `Zero-Width Space (\u200B)` پنهان در انتهای بلوک‌ها، کرسر به درستی مهار می‌شود (Anchor stabilization).

## ۴. آیا contenteditable کافی است؟ (جایگزین)
**پاسخ صریح: خیر.**
`contenteditable` در مدیریت Selection ترکیبی و Caret Jump در مرزهای Bidi کاملاً Deterministic نیست (تفاوت بین کروم، سافاری و فایرفاکس غیرقابل اجتناب است).
**طراحی جایگزین (Virtual Selection Model):**
در صورتی که ایزوله‌سازی CSS مشکل پرش کرسر را کاملاً حل نکند، باید از معماری **Hidden Textarea + Custom Caret** (شبیه Google Docs) استفاده کرد:
1. کاربر درون یک `textarea` نامرئی تایپ می‌کند.
2. ادیتور رویدادهای کیبورد را دریافت کرده و یک مدل مجازی از موقعیت کرسر می‌سازد.
3. DOM فقط برای رندر کردن است (هیچ `contenteditable` ای وجود ندارد).
4. یک `<div class="custom-caret">` با موقعیت‌دهی `absolute` بر اساس مختصات محاسبه‌شده کاراکترها روی صفحه رسم می‌شود.

*در فاز فعلی، ما از `contenteditable` با Strict CSS Constraints استفاده می‌کنیم، اما در صورت بروز خطای Bidi، این جایگزین پیاده‌سازی خواهد شد.*

## ۵. استراتژی Paste
هر رویداد Paste باید **کاملاً استریلیزه** شود:
1. ورودی HTML از کلیپ‌بورد در `DOMPurify` پردازش می‌شود.
2. تمام صفات `dir`، `style` و `align` از کدهای کپی‌شده **حذف (Strip)** می‌شوند.
3. متن به بلوک‌های مجزا تقسیم می‌شود.
4. بر اساس `config.direction` (نظیر `rtl`, `ltr`, `auto`)، مجدداً از صفر جهت هر بلوک محاسبه و اعمال می‌شود.
هیچ استایل یا جهتی از منبع کپی به ارث برده نمی‌شود.

## ۶. نحوه مدیریت Selection
به دلیل مشکلات `contenteditable`، Selection باید از نظر منطقی پایدار باشد:
- هنگام اعمال Format (مثلاً Bold)، ما از Selection API بومی استفاده می‌کنیم، اما تگ‌های تولید شده (`<strong>`) الزاماً کلاس `editorn-inline-isolate` می‌گیرند.
- این کار تضمین می‌کند که انتخاب بصری کاربر و درخت DOM یکپارچه بماند و مرورگر درخت انتخاب (Range) را در دو جهت معکوس نشکند.

## ۷. CSS دقیق
این استایل‌ها غیرقابل نقض هستند و در `editorn.css` قرار می‌گیرند:

```css
/* کلاس‌های پایه بلوک */
.editorn-block[dir="rtl"] {
  direction: rtl;
  text-align: right;
  unicode-bidi: isolate-override;
  white-space: pre-wrap;
}

.editorn-block[dir="ltr"] {
  direction: ltr;
  text-align: left;
  unicode-bidi: isolate-override;
  white-space: pre-wrap;
}

/* ایزوله‌سازی المان‌های درون‌خطی در محتوای ترکیبی */
.editorn-block[dir="rtl"] strong,
.editorn-block[dir="rtl"] em,
.editorn-block[dir="rtl"] a,
.editorn-block[dir="ltr"] strong,
.editorn-block[dir="ltr"] em,
.editorn-block[dir="ltr"] a {
  unicode-bidi: isolate;
}

/* رنگ دقیق کرسر */
.editorn-block {
  caret-color: var(--color-primary, #000);
}
```
**چرا `isolate-override`؟** برای اینکه مرورگر مجبور شود دقیقاً direction مشخص شده برای بلوک را بپذیرد و الگوریتم پیش‌فرض بافت والد را نادیده بگیرد.
**چرا `isolate` در inline؟** برای جلوگیری از به هم ریختگی اعداد یا کاراکترهای خنثی مجاور تگ‌های فرمت شده در متن‌های Mixed.

## ۸. نقاط Failure و Edge Caseها
- **Edge Case 1:** شروع پاراگراف با علامت خنثی (مثل `@` یا `+`) در حالت `auto`.
  - **راه‌حل قطعی:** این کاراکترها در تشخیص نادیده گرفته می‌شوند تا اولین کاراکتر قوی (حرف) پیدا شود. اگر تا انتها پیدا نشود، LTR اعمال می‌شود.
- **Edge Case 2:** قرار گرفتن מספר یا نماد در انتهای خط فارسی. مرورگرها معمولاً عدد را سمت راست می‌برند.
  - **راه‌حل:** `unicode-bidi: isolate` روی تگ بلوک مشکل را حل می‌کند و ترتیب فیزیکی DOM با ترتیب نمایشی یکسان می‌ماند.

## ۹. API نهایی
طبق درخواست، API اولیه به شکل زیر توسعه می‌یابد (بدون هیچ گزینه پنهان):

```javascript
Editorn.init({
  selector: '#editor',
  direction: 'rtl', // یا 'ltr' یا 'auto'
  toolbar: "bold italic | link"
});
```
