import { Sanitizer } from '../utils/Sanitizer.js';

export class Quote {
  constructor({ data, api }) {
    this.data = data || { text: '', caption: '' };
    this.api = api;
    this.wrapper = undefined;
    this.textEl = undefined;
    this.captionEl = undefined;
  }

  render() {
    this.wrapper = document.createElement('blockquote');
    this.wrapper.classList.add('editorn-block-quote');

    this.textEl = document.createElement('div');
    this.textEl.classList.add('editorn-quote-text');
    this.textEl.contentEditable = true;
    this.textEl.innerHTML = this.data.text ? Sanitizer.sanitize(this.data.text) : '<br>';
    this.textEl.dataset.placeholder = 'Quote...';

    this.textEl.addEventListener('input', () => {
      if (this.textEl.innerHTML === '') this.textEl.innerHTML = '<br>';
      this.api.triggerChange();
    });

    this.captionEl = document.createElement('div');
    this.captionEl.classList.add('editorn-quote-caption');
    this.captionEl.contentEditable = true;
    this.captionEl.innerHTML = this.data.caption ? Sanitizer.sanitize(this.data.caption) : '<br>';
    this.captionEl.dataset.placeholder = 'Caption...';

    this.captionEl.addEventListener('input', () => {
      if (this.captionEl.innerHTML === '') this.captionEl.innerHTML = '<br>';
      this.api.triggerChange();
    });

    this.wrapper.appendChild(this.textEl);
    this.wrapper.appendChild(this.captionEl);

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
