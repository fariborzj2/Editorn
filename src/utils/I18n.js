export const translations = {
  en: {
    'toolbar.bold': 'Bold',
    'toolbar.italic': 'Italic',
    'toolbar.underline': 'Underline',
    'toolbar.link': 'Link',
    'toolbar.paragraph': 'Paragraph',
    'toolbar.header': 'Header',
    'toolbar.list': 'List',
    'toolbar.quote': 'Quote',
    'toolbar.divider': 'Divider',
    'toolbar.image': 'Image',
    'toolbar.embed': 'Embed',
    'toolbar.table': 'Table',
    'toolbar.code': 'Code',
    'block.placeholder': 'Type something...',
    'table.addRow': 'Add Row',
    'table.addColumn': 'Add Column',
    'table.removeRow': 'Remove Row',
    'table.removeColumn': 'Remove Column',
    'image.captionPlaceholder': 'Caption...',
    'quote.quotePlaceholder': 'Quote...',
    'quote.captionPlaceholder': 'Caption...',
    'embed.placeholder': 'Enter video URL (YouTube, Vimeo, etc.) and press Enter'
  },
  fa: {
    'toolbar.bold': 'ضخیم',
    'toolbar.italic': 'کج',
    'toolbar.underline': 'زیرخط',
    'toolbar.link': 'لینک',
    'toolbar.paragraph': 'پاراگراف',
    'toolbar.header': 'تیتر',
    'toolbar.list': 'لیست',
    'toolbar.quote': 'نقل‌قول',
    'toolbar.divider': 'جداکننده',
    'toolbar.image': 'تصویر',
    'toolbar.embed': 'ویدیو',
    'toolbar.table': 'جدول',
    'toolbar.code': 'کد',
    'block.placeholder': 'چیزی بنویسید...',
    'table.addRow': 'افزودن سطر',
    'table.addColumn': 'افزودن ستون',
    'table.removeRow': 'حذف سطر',
    'table.removeColumn': 'حذف ستون',
    'image.captionPlaceholder': 'توضیح تصویر...',
    'quote.quotePlaceholder': 'نقل‌قول...',
    'quote.captionPlaceholder': 'منبع...',
    'embed.placeholder': 'آدرس ویدیو را وارد کنید و اینتر بزنید'
  }
};

export class I18n {
  constructor(lang = 'en') {
    this.lang = lang;
  }

  setLang(lang) {
    if (translations[lang]) {
      this.lang = lang;
    }
  }

  t(key, fallback = null) {
    if (translations[this.lang] && translations[this.lang][key]) {
      return translations[this.lang][key];
    }
    // Fallback to English if translation is missing in the target language
    if (this.lang !== 'en' && translations['en'] && translations['en'][key]) {
       return translations['en'][key];
    }
    return fallback !== null ? fallback : key;
  }
}
