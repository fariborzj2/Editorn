# مستندات توسعه Editron (فاز ۱ تا ۷)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۷ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها (Paragraph, Header, List, Quote, Image, Divider, Code, Table)
├── core/            # هسته اصلی
│   ├── BlockManager.ts
│   ├── Editron.ts
│   ├── PluginManager.ts
│   └── Renderer.ts
├── plugins/         # پلاگین‌ها (Slash Menu, Inline Toolbar, Autosave)
├── utils/           # ابزارها (Exporter)
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۷ (جدید)

### ۳.۱. سیستم Drag & Drop
قابلیت جابجایی بلاک‌ها با کشیدن و رها کردن.
- **Handle:** هر بلاک دارای یک دستگیره (⋮⋮) در سمت چپ است که با هاور ظاهر می‌شود.
- **مکانیزم:** استفاده از HTML5 Drag and Drop API.
- **همگام‌سازی:** پس از جابجایی، ترتیب بلاک‌ها در `BlockManager` بروزرسانی می‌شود و رویداد `change` ارسال می‌گردد (که باعث ذخیره خودکار می‌شود).

### ۳.۲. سیستم تم (Theming System)
پشتیبانی از حالت تاریک (Dark Mode) و روشن (Light Mode).
- **پیاده‌سازی:** استفاده از CSS Variables (`--bg-color`, `--text-color`, ...) برای مدیریت رنگ‌ها.
- **ذخیره‌سازی:** وضعیت تم در `localStorage` ذخیره می‌شود.
- **سوییچ:** دکمه تغییر تم در بالای صفحه دمو اضافه شد.

```css
/* نمونه متغیرها */
[data-theme="dark"] {
  --bg-color: #0f172a;
  --text-color: #e2e8f0;
}
```

---

## ۴. قابلیت‌های قبلی (فاز ۱-۶)
- **Blocks:** Paragraph, Header, List, Quote, Image, Divider, Code, Table.
- **Tools:** Slash Menu, Inline Toolbar, Autosave.
- **Exporters:** JSON, Markdown, HTML.
- **Core:** Event System, Plugin System, Block Manager.

---

## ۵. راهنما برای توسعه‌دهندگان
### افزودن استایل جدید
برای پشتیبانی از تم تاریک، حتماً از متغیرهای CSS تعریف شده در `:root` و `[data-theme="dark"]` استفاده کنید. از رنگ‌های ثابت (Hardcoded) بپرهیزید.

---

## ۶. وضعیت فعلی
- ✅ Core Engine & Event System
- ✅ All Standard Blocks
- ✅ Advanced UI (Drag & Drop, Theming)
- ✅ Plugins & Exporters
- ⏳ Collaboration Layer (Future)
- ⏳ AI Integration (Future)
