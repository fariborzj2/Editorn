# Editorn (Modern Block-Based Rich Text Editor)

ویرایشگر متنی (Rich Text Editor) مدرن، قدرتمند و مبتنی بر بلوک (Block-Based). این پروژه یک ادیتور توسعه‌پذیر و کاملاً مستقل (Zero External Dependencies) با ساختاری شبیه به Notion و Editor.js است که خروجی استاندارد JSON تولید می‌کند.

## ویژگی‌های کلیدی 🌟
- **معماری بلوک‌محور:** هر پاراگراف، تیتر، تصویر یا لیست یک بلوک مستقل با داده‌های مختص به خود است.
- **خروجی JSON ساختاریافته:** خروجی به شکل JSON استاندارد تولید می‌شود، نه HTML درهم‌ریخته.
- **بدون وابستگی اضافی:** هسته اصلی با جاوا اسکریپت خالص (Vanilla JS) نوشته شده و تنها برای پاک‌سازی داده‌ها (Sanitization) از کتابخانه امنیتی DOMPurify استفاده می‌کند.
- **پشتیبانی قطعی زبان‌های راست‌به‌چپ (RTL):** سیستم Direction مستقل از مرورگر با حل کامل مشکل پرش کرسر در متون ترکیبی (Mixed Content).
- **چندزبانه (I18n):** امکان تغییر آنی زبان محیط ویرایشگر (فارسی، انگلیسی و...).
- **منوی سریع (Slash Menu):** با فشردن کلید `/` به سرعت بلوک‌های مختلف ایجاد کنید.
- **نوار ابزار شناور (Inline Toolbar):** برای استایل‌دهی (Bold, Italic, Link, ...) نیازی به دکمه‌های ثابت ندارید.
- **مدیریت هوشمند Paste:** چسباندن محتوا از وب و ابزارهای دیگر به صورت خودکار به بلوک‌های تمیز تبدیل می‌شود.
- **رسانه‌های یکپارچه:** پشتیبانی از آپلود/Drag & Drop تصاویر و جاسازی (Embed) ویدیوهای آپارات، یوتیوب و غیره.

---

## 🚀 راهنمای توسعه محلی (Local Development)

اگر قصد توسعه ادیتور، افزودن بلوک‌های جدید و یا مشارکت در پروژه را دارید:

### پیش‌نیازها
- Node.js (نسخه ۱۸ یا بالاتر)
- npm

### نصب و اجرا

۱. ابتدا مخزن را کلون کنید:
```bash
git clone https://github.com/fariborzj2/Editorn.git
cd Editorn
```

۲. وابستگی‌ها را نصب کنید:
```bash
npm install
```

۳. سرور توسعه محلی (Vite) را اجرا کنید:
```bash
npm run dev
# یا
npx vite
```
اکنون با مراجعه به آدرس `http://localhost:3000` (یا پورت اعلام شده در ترمینال) می‌توانید دمو زنده ویرایشگر را مشاهده و تغییرات خود را آزمایش کنید.

---

## 📦 نحوه استفاده در پروژه‌ها

ویرایشگر Editorn به گونه‌ای طراحی شده که بتوانید هم از طریق ماژول‌های جاوا اسکریپت (ES Modules) و هم از طریق اضافه کردن مستقیم فایل به صفحه از آن استفاده کنید.

### ۱. استفاده به صورت ماژول (ESM)
ابتدا فایل‌های مربوطه (`src`) را به پروژه خود کپی کنید و یا در صورت انتشار پکیج، آن را نصب کنید. سپس:

```html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link rel="stylesheet" href="path/to/inline-toolbar.css">
</head>
<body>
  <!-- Container for the editor -->
  <div id="editor-container"></div>
  <button id="save-btn">ذخیره محتوا</button>

  <script type="module">
    // وارد کردن هسته ادیتور و افزونه‌ها
    import Editorn from './src/index.js';

    // راه‌اندازی ادیتور
    const editor = new Editorn({
      el: '#editor-container',
      direction: 'auto', // 'rtl' | 'ltr' | 'auto'
      lang: 'fa', // 'fa' | 'en'
      data: {
        blocks: [
          { type: 'paragraph', data: { text: 'سلام! به ویرایشگر Editorn خوش آمدید.' } }
        ]
      },
      onChange: (data) => {
        console.log('محتوا تغییر کرد!', data);
      },
      // هندل کردن آپلود تصویر (بازگرداندن آدرس تصویر)
      onImageUpload: (file) => {
          return new Promise((resolve) => {
              // شبیه‌سازی آپلود
              setTimeout(() => {
                  resolve(URL.createObjectURL(file));
              }, 1000);
          });
      }
    });

    // ثبت پلاگین‌ها و ابزارهای مورد نیاز
    editor.pluginManager.register('inlineToolbar', window.EditornPlugins.InlineToolbar, {
      tools: [
        window.EditornPlugins.BoldTool,
        window.EditornPlugins.ItalicTool,
        window.EditornPlugins.UnderlineTool,
        window.EditornPlugins.LinkTool
      ]
    });
    editor.pluginManager.register('slashMenu', window.EditornPlugins.SlashMenu, {});

    // ذخیره محتوا
    document.getElementById('save-btn').addEventListener('click', () => {
      const data = editor.save();
      console.log("خروجی JSON: ", data);
    });
  </script>
</body>
</html>
```

### ۲. استفاده به روش سنتی (CDN/Script Tag)
پس از Build گرفتن از پروژه (توسط ابزارهایی مانند Vite یا Webpack)، می‌توانید فایل نهایی جاوااسکریپت را مستقیماً در صفحه قرار دهید:

*(نکته: در فازهای بعدی، لینک‌های CDN رسمی پکیج اضافه خواهد شد. در حال حاضر می‌توانید فایل‌های Build شده را در هاست خود قرار دهید.)*

```html
<script src="path/to/editorn.bundle.js"></script>
<script>
    const editor = new Editorn({
        el: '#editor-container'
    });
    // ادامه مراحل مانند روش قبلی
</script>
```

---

## 🛠 ساختار خروجی داده‌ها (JSON Model)

با فراخوانی متد `editor.save()` خروجی به شکل زیر بازگردانده می‌شود:

```json
{
  "time": 1716000000000,
  "version": "1.0.0",
  "blocks": [
    {
      "id": "abc123xy",
      "type": "header",
      "data": {
        "text": "عنوان بخش",
        "level": 2
      }
    },
    {
      "id": "def456uv",
      "type": "paragraph",
      "data": {
        "text": "این یک پاراگراف نمونه است."
      }
    }
  ]
}
```

---

## 📚 مستندات تکمیلی
برای آشنایی بیشتر با معماری، نحوه نوشتن بلوک‌های اختصاصی و قوانین توسعه سیستم، حتماً فایل‌های زیر را مطالعه کنید:
- `PROJECT_BRIEF.md`: چشم‌انداز کلی و اهداف پروژه
- `ROADMAP.md`: نقشه راه و فازهای اجرایی
- `DEVELOPER.md`: راهنمای توسعه‌دهندگان و معماری سیستم

## مجوز (License)
این پروژه تحت مجوز MIT منتشر شده است.