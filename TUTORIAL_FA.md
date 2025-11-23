# مستندات توسعه Editron (فاز ۱ تا ۵)

این مستندات مراحل توسعه ویرایشگر متن **Editron** را شرح می‌دهد.

---

## ۱. مقدمه (Introduction)
Editron یک ویرایشگر متن مدرن و بلاک‌بیس است. تا کنون ۵ فاز توسعه تکمیل شده است.

---

## ۲. ساختار پروژه (Project Structure)
```bash
src/
├── blocks/          # بلاک‌ها
│   ├── Paragraph.ts # پاراگراف
│   ├── Header.ts    # تیتر
│   ├── List.ts      # لیست
│   ├── Quote.ts     # نقل قول
│   ├── Image.ts     # تصویر
│   ├── Divider.ts   # جداکننده (جدید)
│   └── Code.ts      # کد بلاک (جدید)
├── core/            # هسته اصلی
│   ├── BlockManager.ts
│   ├── Editron.ts
│   ├── PluginManager.ts
│   └── Renderer.ts
├── plugins/         # پلاگین‌ها
│   ├── SlashMenu.ts
│   └── InlineToolbar.ts
├── utils/           # ابزارها
│   └── Exporter.ts  # مبدل خروجی (Markdown / HTML)
└── index.ts
```

---

## ۳. قابلیت‌های فاز ۵ (جدید)

### ۳.۱. جداکننده (Divider Block)
یک خط افقی (`<hr>`) برای جداسازی محتوا.
- تبدیل از طریق منوی اسلش (`/divider`).

### ۳.۲. بلاک کد (Code Block)
برای نمایش کدهای برنامه‌نویسی.
- تبدیل از طریق منوی اسلش (`/code`).
- پشتیبانی از دکمه `Tab` برای ایندنت (۲ فاصله).
- خروجی Markdown به صورت ` ``` ` و HTML به صورت `<pre><code>`.

### ۳.۳. خروجی HTML (HTML Exporter)
اکنون علاوه بر JSON و Markdown، امکان دریافت خروجی HTML تمیز نیز وجود دارد.

```typescript
// Example Output
<p>Hello World</p>
<hr />
<pre><code>console.log('Test');</code></pre>
```

---

## ۴. قابلیت‌های قبلی (فاز ۱-۴)
- **Media Blocks:** Quote, Image.
- **Lists:** Ordered, Unordered.
- **Tools:** Slash Menu, Inline Toolbar.
- **Exporters:** JSON, Markdown.

---

## ۵. راهنما برای توسعه‌دهندگان
### استفاده از Exporter
```typescript
import { Exporter } from './utils/Exporter';

const json = await editor.save();
const html = Exporter.toHTML(json);
const markdown = Exporter.toMarkdown(json);
```

---

## ۶. وضعیت فعلی
- ✅ Core Engine
- ✅ All Basic Blocks (Paragraph, Header, List, Quote, Image, Divider, Code)
- ✅ Plugins (Slash Menu, Inline Toolbar)
- ✅ Exporters (JSON, Markdown, HTML)
- ⏳ Collaboration Layer (Future)
- ⏳ AI Integration (Future)
