with open('src/blocks/Quote.js', 'r') as f:
    content = f.read()

setup_i18n = """
    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
    this.wrapper = document.createElement('blockquote');
"""
content = content.replace("this.wrapper = document.createElement('blockquote');", setup_i18n)
content = content.replace("this.textEl.dataset.placeholder = 'Quote...';", "this.textEl.dataset.placeholder = i18n.t('quote.quotePlaceholder', 'Quote...');")
content = content.replace("this.captionEl.dataset.placeholder = 'Caption...';", "this.captionEl.dataset.placeholder = i18n.t('quote.captionPlaceholder', 'Caption...');")

with open('src/blocks/Quote.js', 'w') as f:
    f.write(content)
