# مستندات توسعه Editron (فاز ۱ تا ۳)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۳ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها
│   ├── Paragraph.ts # پاراگراف ساده
│   ├── Header.ts    # تیتر (H1-H6)
│   └── List.ts      # لیست (مرتب و نامرتب) - جدید
├── core/            # هسته اصلی
│   ├── BlockManager.ts
│   ├── Editron.ts
│   ├── PluginManager.ts
│   └── Renderer.ts
├── plugins/         # پلاگین‌ها
│   ├── SlashMenu.ts     # منوی اسلش (/)
│   └── InlineToolbar.ts # تولبار شناور (Bold/Italic) - جدید
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۳ (جدید)

### ۳.۱. تولبار شناور (Inline Toolbar)
وقتی کاربر بخشی از متن را انتخاب می‌کند، یک تولبار کوچک بالای آن ظاهر می‌شود که امکانات زیر را دارد:
- **Bold**
- *Italic*
- <u>Underline</u>

این پلاگین (`src/plugins/InlineToolbar.ts`) با استفاده از رویداد `selectionchange` موقعیت خود را محاسبه و نمایش می‌دهد.

### ۳.۲. بلاک لیست (List Block)
پشتیبانی از لیست‌های Bullet و Numbered اضافه شد.
- **ایجاد لیست:** از طریق Slash Menu (`/`).
- **آیتم جدید:** با زدن `Enter`.
- **حذف آیتم:** با زدن `Backspace`.
- **خروج از لیست:** با زدن `Enter` روی آیتم خالی (اگر تنها باشد به پاراگراف تبدیل می‌شود).

```typescript
// List Block Data Structure
{
  type: 'list',
  content: {
    style: 'unordered', // or 'ordered'
    items: ['Item 1', 'Item 2']
  }
}
```

---

## ۴. قابلیت‌های قبلی

### ۴.۱. Slash Menu
با تایپ `/` منویی باز می‌شود که اجازه می‌دهد پاراگراف را به **Header** یا **List** تبدیل کنید.

### ۴.۲. Core Engine
سیستم مدیریت بلاک و رندرینگ که پایه و اساس ادیتور است.

---

## ۵. راهنما برای توسعه‌دهندگان
برای اضافه کردن یک بلاک جدید:
1. یک کلاس بسازید که `IBlock` را پیاده‌سازی کند.
2. آن را در `BlockManager` ثبت کنید.
3. (اختیاری) آن را به `SlashMenu` اضافه کنید.

---

## ۶. وضعیت فعلی
- ✅ Core Engine
- ✅ Paragraph, Header, List Blocks
- ✅ Slash Menu Plugin
- ✅ Inline Toolbar Plugin
- ⏳ Image Block (Next Steps)
- ⏳ Table Block (Next Steps)
