# مستندات توسعه Editron (فاز ۱ تا ۹)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۹ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها
├── core/            # هسته اصلی
├── plugins/         # پلاگین‌ها
│   ├── SlashMenu.ts
│   ├── InlineToolbar.ts
│   ├── Autosave.ts
│   ├── Collaboration.ts
│   └── AIAssistant.ts # دستیار هوشمند (جدید)
├── utils/           # ابزارها
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۹ (جدید)

### ۳.۱. دستیار هوشمند (AI Assistant Plugin)
یک پلاگین قدرتمند برای انجام عملیات هوشمند روی متن.
- **دسترسی:**
  1. **Inline Toolbar:** با انتخاب متن و کلیک روی دکمه `✨ AI`.
  2. **Slash Menu:** با تایپ `/` و انتخاب گزینه `Generate Text`.
- **قابلیت‌ها:**
  - **Summarize:** خلاصه‌سازی متن انتخاب شده.
  - **Expand:** گسترش متن و افزودن جزئیات.
  - **Fix Grammar:** اصلاح گرامری (Mock).
  - **Make Funny:** بازنویسی متن به صورت طنز.
- **پیاده‌سازی:** فعلاً از یک سرویس Mock استفاده می‌کند که با `setTimeout` تاخیر شبکه را شبیه‌سازی کرده و تغییرات ساده‌ای روی رشته ورودی اعمال می‌کند.

---

## ۴. قابلیت‌های قبلی (فاز ۱-۸)
- **Core:** Event System, Collaboration (BroadcastChannel), Drag & Drop.
- **Blocks:** Paragraph, Header, List, Quote, Image, Divider, Code, Table.
- **Tools:** Slash Menu, Inline Toolbar, Autosave, Theming.
- **Exporters:** Markdown, HTML.

---

## ۶. وضعیت فعلی
- ✅ Core Engine (Enhanced)
- ✅ Collaboration
- ✅ AI Integration (Mock)
- ✅ All Standard Blocks
- ⏳ Framework Adapters (Future)
