# مستندات توسعه Editron (فاز ۱ تا ۴)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۴ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها
│   ├── Paragraph.ts # پاراگراف
│   ├── Header.ts    # تیتر
│   ├── List.ts      # لیست
│   ├── Quote.ts     # نقل قول (جدید)
│   └── Image.ts     # تصویر (جدید)
├── core/            # هسته اصلی
│   ├── BlockManager.ts
│   ├── Editron.ts
│   ├── PluginManager.ts
│   └── Renderer.ts
├── plugins/         # پلاگین‌ها
│   ├── SlashMenu.ts
│   └── InlineToolbar.ts
├── utils/           # ابزارها
│   └── Exporter.ts  # مبدل خروجی (Markdown)
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۴ (جدید)

### ۳.۱. بلاک نقل قول (Quote Block)
یک بلاک ساده برای نمایش نقل قول‌ها با استایل خاص.
- تبدیل از طریق منوی اسلش (`/quote`).
- استایل: `border-left` و متن ایتالیک.

### ۳.۲. بلاک تصویر (Image Block)
پشتیبانی از تصاویر با URL.
- **حالت اولیه:** نمایش اینپوت برای وارد کردن آدرس عکس.
- **حالت نمایش:** نمایش عکس به همراه کپشن قابل ویرایش.
- تبدیل از طریق منوی اسلش (`/image`).

### ۳.۳. خروجی مارک‌داون (Markdown Exporter)
یک ابزار کاربردی (`utils/Exporter.ts`) که خروجی JSON ویرایشگر را به فرمت استاندارد Markdown تبدیل می‌کند.
پشتیبانی از:
- پاراگراف
- تیترها (`#`, `##`, ...)
- لیست‌ها (`-`, `1.`)
- نقل قول (`>`)
- تصاویر (`![caption](url)`)

---

## ۴. قابلیت‌های قبلی (فاز ۱-۳)
- **Inline Toolbar:** منوی فرمت‌دهی سریع (Bold, Italic).
- **Slash Menu:** منوی تغییر نوع بلاک.
- **Core Engine:** مدیریت بلاک‌ها و رندرینگ.

---

## ۵. راهنما برای توسعه‌دهندگان
### افزودن خروجی جدید (Exporter)
برای اضافه کردن فرمت خروجی جدید (مثلاً HTML)، کافیست یک متد استاتیک در کلاس `Exporter` اضافه کنید که آرایه `BlockData` را پیمایش کرده و رشته نهایی را تولید کند.

---

## ۶. وضعیت فعلی
- ✅ Core Engine
- ✅ Blocks: Paragraph, Header, List, Quote, Image
- ✅ Plugins: Slash Menu, Inline Toolbar
- ✅ Exporters: JSON, Markdown
- ⏳ Collaboration Layer (Next)
- ⏳ AI Integration (Next)
