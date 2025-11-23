# مستندات توسعه Editron (فاز ۱ تا ۸)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۸ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها
├── core/            # هسته اصلی
│   ├── BlockManager.ts
│   ├── Editron.ts
│   ├── PluginManager.ts
│   └── Renderer.ts
├── plugins/         # پلاگین‌ها
│   ├── SlashMenu.ts
│   ├── InlineToolbar.ts
│   ├── Autosave.ts
│   └── Collaboration.ts # همکاری بلادرنگ (جدید)
├── utils/           # ابزارها
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۸ (جدید)

### ۳.۱. همکاری بلادرنگ (Real-time Collaboration)
قابلیت همگام‌سازی تغییرات بین تب‌های مختلف مرورگر با استفاده از `BroadcastChannel` API.
- **مکانیزم:** هر تغییری (افزودن، ویرایش، حذف) به عنوان یک رویداد (`block:add`, `block:change`, ...) پخش می‌شود.
- **دریافت:** سایر تب‌ها پیام را دریافت کرده و تغییرات را روی `BlockManager` خود اعمال می‌کنند.
- **حذف:** دکمه حذف (`×`) به هر بلاک اضافه شده تا امکان تست حذف همگام فراهم شود.

> **نکته:** این پیاده‌سازی برای نمایش مفهوم (Proof of Concept) است و برای محیط تولید نیاز به سرور WebSocket و الگوریتم‌هایی مثل CRDT (مثلاً Yjs) دارد.

### ۳.۲. بهبود سیستم رویدادها
سیستم رویدادها برای ارسال جزئیات دقیق‌تر تغییرات (`granular updates`) بازنویسی شد تا پلاگین‌ها بدانند دقیقاً چه چیزی تغییر کرده است.

---

## ۴. قابلیت‌های قبلی (فاز ۱-۷)
- **Blocks:** Standard set + Table.
- **UI:** Drag & Drop, Theming, Floating Tools.
- **Core:** Event System, Autosave.

---

## ۶. وضعیت فعلی
- ✅ Core Engine (Enhanced)
- ✅ Collaboration (BroadcastChannel)
- ✅ All Standard Blocks & Tools
- ⏳ AI Integration (Next Step)
