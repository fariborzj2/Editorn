# مستندات توسعه Editron (فاز ۱ تا ۶)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۶ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها
│   ├── Paragraph.ts
│   ├── Header.ts
│   ├── List.ts
│   ├── Quote.ts
│   ├── Image.ts
│   ├── Divider.ts
│   ├── Code.ts
│   └── Table.ts     # جدول (جدید)
├── core/            # هسته اصلی
│   ├── BlockManager.ts
│   ├── Editron.ts
│   ├── PluginManager.ts
│   └── Renderer.ts
├── plugins/         # پلاگین‌ها
│   ├── SlashMenu.ts
│   ├── InlineToolbar.ts
│   └── Autosave.ts  # ذخیره خودکار (جدید)
├── utils/           # ابزارها
│   └── Exporter.ts
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۶ (جدید)

### ۳.۱. سیستم ذخیره خودکار (Autosave Plugin)
پلاگینی که تغییرات ادیتور را به صورت خودکار در `localStorage` ذخیره می‌کند.
- **تشخیص تغییرات:** سیستم رویدادهای `Editron` بهبود یافت تا هرگونه تغییر (تایپ کردن، افزودن بلاک و...) را با رویداد `change` مخابره کند.
- **بازیابی:** در هنگام بارگذاری، اگر دیتایی ذخیره شده باشد، به صورت خودکار بازیابی می‌شود.
- **دکمه پاکسازی:** دکمه‌ای برای حذف دیتای ذخیره شده اضافه شد.

### ۳.۲. بلاک جدول (Table Block)
پشتیبانی از جداول ساده با قابلیت ویرایش سلول‌ها.
- **ایجاد:** از طریق منوی اسلش (`/table`).
- **کنترل‌ها:** دکمه‌های `+ Row` و `+ Col` در زیر جدول برای افزودن سطر و ستون.
- **خروجی:** پشتیبانی کامل در Markdown و HTML.

```html
<!-- Table Output HTML -->
<table>
  <tr><td>Cell 1</td><td>Cell 2</td></tr>
</table>
```

---

## ۴. قابلیت‌های قبلی (فاز ۱-۵)
- **Blocks:** Paragraph, Header, List, Quote, Image, Divider, Code.
- **Tools:** Slash Menu, Inline Toolbar.
- **Core:** Event System, Plugin System, Block Manager.
- **Exporters:** JSON, Markdown, HTML.

---

## ۵. راهنما برای توسعه‌دهندگان
### استفاده از Event System
برای گوش دادن به تغییرات محتوا:
```typescript
editor.on('change', () => {
  console.log('Content changed!');
});
```

---

## ۶. وضعیت فعلی
- ✅ Core Engine & Event System
- ✅ All Standard Blocks (including Table)
- ✅ Plugins (Slash Menu, Inline Toolbar, Autosave)
- ✅ Exporters
- ⏳ Collaboration Layer (Future)
- ⏳ AI Integration (Future)
