# Developer Guide (راهنمای توسعه‌دهندگان)

این مستند برای توسعه‌دهندگانی است که قصد دارند هسته ادیتور را بهبود ببخشند، پلاگین/بلوک جدیدی بسازند یا ادیتور را در پروژه خود ادغام کنند.

**نکته مهم:** این مستندات باید همواره به‌روز باشند. با اضافه شدن هر فیچر یا تغییر معماری، این فایل باید بلافاصله بروزرسانی شود.

## ۱. معماری کلی سیستم (Architecture Overview)

ادیتور جدید بر اساس معماری **بلوک-محور (Block-Based)** طراحی شده است. برخلاف ادیتورهای قدیمی که یک `contentEditable` بزرگ را مدیریت می‌کردند، این ادیتور محتوا را به عنوان مجموعه‌ای از آبجکت‌های مستقل (پاراگراف، تصویر، تیتر و ...) می‌بیند.

- **`EditorCore`**: مدیر اصلی سیستم که وابستگی‌ها، مدیریت وضعیت (State) و چرخه حیات (Lifecycle) را کنترل می‌کند.
- **`BlockManager`**: مسئول ایجاد، حذف، جابجایی و بروزرسانی بلوک‌ها در مدل داده (Data Model).
- **`Renderer`**: لایه‌ای که مدل داده (JSON) را به کدهای HTML قابل نمایش در DOM تبدیل می‌کند و بالعکس.
- **`PluginManager`**: مسئول ثبت و مدیریت افزونه‌ها و ابزارها (تولبار، منوی سریع و...). این کلاس در چرخه حیات `EditorCore` نمونه‌سازی شده و متد `register` برای افزودن ابزارهای جدید مورد استفاده قرار می‌گیرد.

*توجه بر روی مدیریت کیبورد (Keyboard Handling):*
در کلاس `EditorCore`، متد `handleGlobalKeydown` رویدادهای عمومی ویرایشگر (مانند فشردن کلیدهای Enter و Backspace) را مدیریت می‌کند.
- **Enter**: در هنگام فشردن این کلید، در صورتی که کرسر وسط متن یک بلوک قرار داشته باشد، با استفاده از `Selection API` متن بعد از کرسر استخراج شده و به یک بلوک پاراگراف جدید (در پایین بلوک فعلی) منتقل می‌شود.
- **Backspace**: اگر کرسر در ابتدای یک بلوک باشد (offset 0)، محتوای آن بلوک به انتهای بلوک قبلی متصل شده (Merge) و بلوک فعلی از بین می‌رود تا یکپارچگی ظاهری و داده‌ای حفظ شود.

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

## ۴. سیستم پلاگین و نوار ابزار درون‌خطی (Plugin System & Inline Toolbar)

ویرایشگر از یک `PluginManager` برای ثبت و مدیریت افزونه‌ها استفاده می‌کند.
برای فاز ۲، سیستم نوار ابزار درون‌خطی (`InlineToolbar`) و ابزارهای فرمتینگ پایه (`Bold`، `Italic`، `Underline`، `Link`) پیاده‌سازی شده‌اند. این ابزارها بر اساس `Selection API` کار می‌کنند و از `document.execCommand` استفاده **نمی‌کنند**.

برای ساخت ابزار فرمتینگ سفارشی، کلاس شما باید از `BaseInlineTool` ارث‌بری کند و متدهای زیر را پیاده‌سازی نماید:
- `getIcon()`: بازگرداندن HTML آیکون دکمه.
- `getTitle()`: بازگرداندن عنوان ابزار.
- `isActiveOnNode(node)`: بررسی اینکه آیا گره فعلی دارای استایل این ابزار است یا خیر.
- `createWrapper()`: ایجاد و بازگرداندن المان HTML (مثلاً `<mark>`) برای احاطه کردن متن انتخاب شده.

## ۵. بلوک‌های استاندارد و منوی اسلش (Phase 3)

در فاز ۳، بلوک‌های استاندارد شامل `Header`، `List`، `Quote` و `Divider` ایجاد شده‌اند. تمامی این بلوک‌ها از یک API یکسان مبتنی بر `render`، `save` و مدیریت محلی `contentEditable` پیروی می‌کنند و از کتابخانه `dompurify` جهت Sanitization بهره می‌برند.
همچنین پلاگین `SlashMenu` توسعه یافته است که در بلوک پاراگراف، با تایپ کردن کاراکتر `/` منویی جهت تبدیل سریع پاراگراف به سایر بلوک‌ها نمایش می‌دهد. این پلاگین از ناوبری با کیبورد (`ArrowUp`, `ArrowDown`, `Enter`) نیز پشتیبانی می‌کند.
بلوک `List` دارای منطق محلی برای مدیریت کلیدهای `Enter` و `Backspace` است، به طوری که در صورت خالی بودن یک آیتم لیست، فشردن `Enter` کاربر را از لیست خارج کرده و یک پاراگراف جدید ایجاد می‌کند.

## ۶. مدیریت رسانه و رویدادهای پیست (Phase 4)

فاز ۴ بر مدیریت رسانه‌ها و بهبود تجربه الصاق محتوا (Paste) تمرکز دارد:
- **`PasteManager`**: یک مدیر جدید در `EditorCore` که به منظور شنود و رهگیری ایمن رویداد `paste` در تمام ویرایشگر ایجاد شده است. این کلاس مسئول اعتبارسنجی، پاک‌سازی (Sanitization) و تبدیل HTML خارجی به بلوک‌های داخلی است.
- **بلوک‌های رسانه (`Image` و `Embed`)**: بلوک‌های جدیدی که برای مدیریت تصاویر و جاسازی ویدیوها اضافه شده‌اند. این بلوک‌ها داده‌های ساختاریافته (مانند URL رسانه و کپشن) را ذخیره کرده و به طور پیش‌فرض بدنه آن‌ها برای جلوگیری از تغییرات تصادفی با `contentEditable=false` رندر می‌شود، در حالی که فیلد کپشن قابل ویرایش می‌ماند.

## ۷. تجربه کاربری و قابلیت‌های پیشرفته (Phase 5)

این فاز شامل توسعه ویژگی‌هایی است که تجربه کاربری را به سطح استانداردهای جهانی نزدیک می‌کند:
- **`HistoryManager`**: کلاسی برای مدیریت تاریخچه وضعیت ادیتور (Undo/Redo). این کلاس تغییرات را با تاخیر (Debounce) ثبت کرده و از طریق کلیدهای ترکیبی `Ctrl+Z` و `Ctrl+Y` وضعیت‌ها را بازیابی می‌کند.
- **`DragDropManager`**: کلاسی جهت پشتیبانی از گرفتن و جابجاکردن (Drag and Drop) بلوک‌ها در ویرایشگر با ارائه نشانگرهای بصری موقعیت (Drop Indicator).
- **بلوک‌های جدید**:
  - **`Table`**: امکان ایجاد جداول با رابط کاربری داخلی جهت افزودن و حذف سطر و ستون و استفاده از `Sanitizer` برای جلوگیری از XSS در سلول‌ها.
  - **`Code`**: امکان درج قطعه کدهای خام با پشتیبانی از کلید `Tab` برای ایجاد فاصله به جای پرش فیلد.

## ۸. فاز ۷: نوار ابزار ثابت (Fixed Toolbar)

در فاز ۷، یک نوار ابزار ثابت (`FixedToolbar`) به ویرایشگر اضافه شده است که در بالای `container` ویرایشگر قرار می‌گیرد.
این نوار ابزار شامل دکمه‌هایی برای فرمتینگ درون‌خطی (Bold, Italic, و غیره) و همچنین دکمه‌هایی برای درج و تبدیل بلوک‌ها (Paragraph, Header, List و غیره) است.

### استفاده از FixedToolbar

پلاگین `FixedToolbar` در زمان ثبت در `PluginManager` می‌تواند تنظیماتی برای لیست ابزارهای درون‌خطی دریافت کند. برای ثبت آن در `EditorCore`:

```javascript
editor.pluginManager.register('fixedToolbar', EditornPlugins.FixedToolbar, {
  inlineTools: [
    EditornPlugins.BoldTool,
    EditornPlugins.ItalicTool,
    EditornPlugins.UnderlineTool,
    EditornPlugins.LinkTool
  ]
});
```

## ۹. استایل‌ها و تم (Styles & Theming)

- برای استایل‌دهی، از نام‌گذاری BEM (Block Element Modifier) استفاده کنید.
- وابستگی به فایل‌های CSS خارجی را به حداقل برسانید؛ در صورت امکان، ساختار هسته باید Minimal باشد تا توسعه‌دهندگان بتوانند تم اختصاصی خود را اعمال کنند.
- از متغیرهای CSS (CSS Variables) برای رنگ‌ها و اندازه‌های پایه استفاده کنید تا قابلیت تغییر تم (Light/Dark) آسان باشد.

## ۱۰. دستورالعمل‌های تست و توسعه محلی (Local Development)

این پروژه از ابزار **Vite** برای بیلد و از **Vitest** برای تست‌ها استفاده می‌کند.

### نصب وابستگی‌ها و اجرا
برای شروع توسعه محلی، ابتدا پکیج‌ها را نصب کرده و سرور توسعه را اجرا کنید:
```bash
npm install
npm run dev
```

### اجرای تست‌ها
تست‌های پروژه با استفاده از محیط `jsdom` در Vitest نوشته شده‌اند و به شکل خودکار کامپوننت‌های امنیتی (مانند `Sanitizer`) را بررسی می‌کنند:
```bash
npm test
```

### ساخت بیلد نهایی برای انتشار (Build)
برای تهیه نسخه قابل انتشار برای npm، از دستور زیر استفاده کنید که خروجی‌های UMD و ESM را در پوشه `dist` تولید می‌کند:
```bash
npm run build
```

## ۱۱. آداپتورهای فریم‌ورک (Framework Adapters)

در طول فاز ۶، آداپتورهای مخصوص React و Vue برای سهولت در استفاده از ادیتور توسعه داده شده‌اند که در پوشه `src/adapters/` در دسترس هستند.

### استفاده در React:
```jsx
import React, { useState } from 'react';
import EditornReact from './path/to/src/adapters/react/EditornReact';

const MyEditorComponent = () => {
  const [data, setData] = useState({ blocks: [] });

  const handleEditorChange = (newData) => {
    setData(newData);
  };

  return (
    <EditornReact
      data={data}
      onChange={handleEditorChange}
      plugins={[/* ... لیست پلاگین‌ها ... */]}
      config={{ /* ... سایر تنظیمات Editorn ... */ }}
    />
  );
};
```

### استفاده در Vue:
```vue
<template>
  <EditornVue
    :data="editorData"
    :plugins="editorPlugins"
    @change="handleEditorChange"
  />
</template>

<script setup>
import { ref } from 'vue';
import EditornVue from './path/to/src/adapters/vue/EditornVue';

const editorData = ref({ blocks: [] });
const editorPlugins = ref([/* ... لیست پلاگین‌ها ... */]);

const handleEditorChange = (newData) => {
  editorData.value = newData;
};
</script>
```
