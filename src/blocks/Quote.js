import { Sanitizer } from '../utils/Sanitizer.js';

export class Quote {
  constructor({ data, api }) {
    this.data = {
      text: data && data.text ? data.text : '',
      caption: data && data.caption ? data.caption : ''
    };
    this.api = api;
    this.wrapper = undefined;
    this.textEl = undefined;
    this.captionEl = undefined;
  }

  render() {

    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
    this.wrapper = document.createElement('blockquote');

    this.wrapper.classList.add('editorn-block-quote');

    this.textEl = document.createElement('div');
    this.textEl.classList.add('editorn-quote-text');
    this.textEl.contentEditable = true;
    this.textEl.innerHTML = this.data.text ? Sanitizer.sanitize(this.data.text) : '<br>';
    this.textEl.dataset.placeholder = i18n.t('quote.quotePlaceholder', 'Quote...');

    this.textEl.addEventListener('input', () => {
      if (this.textEl.innerHTML === '') this.textEl.innerHTML = '<br>';
      if (this.api && this.api.directionManager) {
        this.api.directionManager.applyToElement(this.textEl, this.textEl.innerText || this.textEl.textContent);
      }
      this.api.triggerChange();
    });

    this.captionEl = document.createElement('div');
    this.captionEl.classList.add('editorn-quote-caption');
    this.captionEl.contentEditable = true;
    this.captionEl.innerHTML = this.data.caption ? Sanitizer.sanitize(this.data.caption) : '<br>';
    this.captionEl.dataset.placeholder = i18n.t('quote.captionPlaceholder', 'Caption...');

    this.captionEl.addEventListener('input', () => {
      if (this.captionEl.innerHTML === '') this.captionEl.innerHTML = '<br>';
      if (this.api && this.api.directionManager) {
        this.api.directionManager.applyToElement(this.captionEl, this.captionEl.innerText || this.captionEl.textContent);
      }
      this.api.triggerChange();
    });

    this.wrapper.appendChild(this.textEl);
    this.wrapper.appendChild(this.captionEl);


    if (this.api && this.api.directionManager) {
      this.api.directionManager.applyToElement(this.textEl, this.textEl.innerText || this.textEl.textContent);
      this.api.directionManager.applyToElement(this.captionEl, this.captionEl.innerText || this.captionEl.textContent);
    }
    return this.wrapper;
  }

  save(blockContent) {
    let textHtml = this.textEl.innerHTML;
    if (textHtml === '<br>') textHtml = '';
    let captionHtml = this.captionEl.innerHTML;
    if (captionHtml === '<br>') captionHtml = '';

    return {
      text: Sanitizer.sanitize(textHtml),
      caption: Sanitizer.sanitize(captionHtml)
    };
  }

  validate(savedData) {
    return !!savedData.text.trim();
  }
}
