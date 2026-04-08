import { Sanitizer } from '../utils/Sanitizer.js';

export class Embed {
  constructor({ data, api }) {
    this.data = data || { url: '', service: '', caption: '' };
    this.api = api;
    this.wrapper = undefined;
    this.iframeEl = undefined;
    this.captionEl = undefined;
  }

  render() {
    this.wrapper = document.createElement('figure');
    this.wrapper.classList.add('editorn-block-embed');
    this.wrapper.contentEditable = false;

    if (this.data.url) {
        this.renderEmbed();
    } else {
        this.renderInput();
    }

    this.captionEl = document.createElement('figcaption');
    this.captionEl.classList.add('editorn-embed-caption');
    this.captionEl.contentEditable = true;
    this.captionEl.dataset.placeholder = 'Caption...';
    this.captionEl.innerHTML = this.data.caption ? Sanitizer.sanitize(this.data.caption) : '<br>';

    this.captionEl.addEventListener('input', () => {
      if (this.captionEl.innerHTML === '') this.captionEl.innerHTML = '<br>';
      this.api.triggerChange();
    });

    this.wrapper.appendChild(this.captionEl);

    return this.wrapper;
  }

  renderEmbed() {
      // TODO: Phase 4 - Real implementation should parse the URL and map it to a specific service template (e.g. YouTube, Aparat)
      this.iframeEl = document.createElement('iframe');
      this.iframeEl.src = this.data.url;
      this.iframeEl.width = '100%';
      this.iframeEl.height = '315';
      this.iframeEl.frameBorder = '0';
      this.iframeEl.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      this.iframeEl.allowFullscreen = true;
      this.wrapper.insertBefore(this.iframeEl, this.captionEl);
  }

  renderInput() {
      // TODO: Phase 4 - Add proper UI for URL input
      const inputUI = document.createElement('div');
      inputUI.classList.add('editorn-embed-input');

      const inputEl = document.createElement('input');
      inputEl.type = 'url';
      inputEl.placeholder = 'Enter embed URL (e.g. YouTube)';
      inputEl.style.width = '100%';
      inputEl.style.padding = '10px';

      inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              if (inputEl.value) {
                  this.data.url = inputEl.value; // TODO: parse to get embeddable URL
                  this.wrapper.removeChild(inputUI);
                  this.renderEmbed();
                  this.api.triggerChange();
              }
          }
      });

      inputUI.appendChild(inputEl);
      this.wrapper.insertBefore(inputUI, this.captionEl);
  }

  save() {
    let captionHtml = this.captionEl.innerHTML;
    if (captionHtml === '<br>') captionHtml = '';

    return {
      url: this.data.url,
      service: this.data.service, // Determine during parsing
      caption: Sanitizer.sanitize(captionHtml)
    };
  }

  validate(savedData) {
    return !!savedData.url.trim();
  }
}
