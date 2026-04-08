# Developer Guide (راهنمای توسعه‌دهندگان)

این مستند برای توسعه‌دهندگانی است که قصد دارند هسته ادیتور را بهبود ببخشند، پلاگین/بلوک جدیدی بسازند یا ادیتور را در پروژه خود ادغام کنند.

**نکته مهم:** این مستندات باید همواره به‌روز باشند. با اضافه شدن هر فیچر یا تغییر معماری، این فایل باید بلافاصله بروزرسانی شود.

## ۱. معماری کلی سیستم (Architecture Overview)

ادیتور جدید بر اساس معماری **بلوک-محور (Block-Based)** طراحی شده است. برخلاف ادیتورهای قدیمی که یک `contentEditable` بزرگ را مدیریت می‌کردند، این ادیتور محتوا را به عنوان مجموعه‌ای از آبجکت‌های مستقل (پاراگراف، تصویر، تیتر و ...) می‌بیند.

- **`EditorCore`**: مدیر اصلی سیستم که وابستگی‌ها، مدیریت وضعیت (State) و چرخه حیات (Lifecycle) را کنترل می‌کند.
- **`BlockManager`**: مسئول ایجاد، حذف، جابجایی و بروزرسانی بلوک‌ها در مدل داده (Data Model).
- **`Renderer`**: لایه‌ای که مدل داده (JSON) را به کدهای HTML قابل نمایش در DOM تبدیل می‌کند و بالعکس.
- **`PluginManager`**: مسئول ثبت و مدیریت افزونه‌ها و ابزارها (تولبار، منوی سریع و...).

## ۲. مدل داده (Data Model)

خروجی و ورودی استاندارد این ویرایشگر به شکل JSON زیر است:

```json
{
  "time": 1716000000000,
  "version": "1.0.0",
  "blocks": [
    {
      "id": "abc123xy",
      "type": "paragraph",
      "data": {
        "text": "سلام! این یک پاراگراف نمونه است."
      }
    },
    {
      "id": "def456uv",
      "type": "header",
      "data": {
        "text": "عنوان بخش",
        "level": 2
      }
    }
  ]
}
```

## ۳. ایجاد بلوک سفارشی (Creating a Custom Block)

برای اضافه کردن یک بلوک جدید، باید یک کلاس ایجاد کنید که ساختار استاندارد زیر را دنبال کند. این کلاس توسط `BlockManager` فراخوانی می‌شود.

*(توجه: این API در فاز توسعه اولیه است و ممکن است تغییر کند)*

```javascript
class MyCustomBlock {
  // ۱. دریافت داده‌های اولیه
  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.wrapper = undefined;
  }

  // ۲. رندر کردن المان در صفحه
  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('my-custom-block');
    this.wrapper.innerHTML = this.data.text || 'متن پیش‌فرض';
    this.wrapper.contentEditable = true;
    return this.wrapper;
  }

  // ۳. استخراج داده‌ها از المان برای ذخیره در JSON
  save(blockContent) {
    return {
      text: blockContent.innerHTML
    };
  }

  // ۴. اعتبارسنجی (اختیاری)
  validate(savedData) {
    if (!savedData.text.trim()) {
      return false; // ذخیره نمی‌شود
    }
    return true;
  }
}
```

## ۴. استایل‌ها و تم (Styles & Theming)

- برای استایل‌دهی، از نام‌گذاری BEM (Block Element Modifier) استفاده کنید.
- وابستگی به فایل‌های CSS خارجی را به حداقل برسانید؛ در صورت امکان، ساختار هسته باید Minimal باشد تا توسعه‌دهندگان بتوانند تم اختصاصی خود را اعمال کنند.
- از متغیرهای CSS (CSS Variables) برای رنگ‌ها و اندازه‌های پایه استفاده کنید تا قابلیت تغییر تم (Light/Dark) آسان باشد.

## ۵. دستورالعمل‌های تست و توسعه محلی (Local Development)

*(این بخش پس از پیاده‌سازی ابزارهای بیلد مانند Webpack یا Vite تکمیل خواهد شد)*
