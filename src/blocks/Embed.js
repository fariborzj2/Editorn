import { Sanitizer } from '../utils/Sanitizer.js';

export class Embed {
  constructor({ data, api }) {
    this.data = {
      url: data && data.url ? data.url : '',
      service: data && data.service ? data.service : '',
      caption: data && data.caption ? data.caption : ''
    };
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

  parseUrl(url) {
    // YouTube
    const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return { service: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
    }

    // Aparat
    const aparatMatch = url.match(/(?:https?:\/\/)?(?:www\.)?aparat\.com\/v\/([a-zA-Z0-9]+)/);
    if (aparatMatch && aparatMatch[1]) {
      return { service: 'aparat', embedUrl: `https://www.aparat.com/video/video/embed/videohash/${aparatMatch[1]}/vt/frame` };
    }

    return null;
  }

  renderEmbed() {
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
      const inputUI = document.createElement('div');
      inputUI.classList.add('editorn-embed-input');

      const inputEl = document.createElement('input');
      inputEl.type = 'url';
      inputEl.placeholder = 'Enter video URL (YouTube, Aparat...) and press Enter';
      inputEl.style.width = '100%';
      inputEl.style.padding = '10px';
      inputEl.style.border = '1px solid #ccc';
      inputEl.style.borderRadius = '4px';

      const errorEl = document.createElement('div');
      errorEl.style.color = 'red';
      errorEl.style.fontSize = '0.8em';
      errorEl.style.marginTop = '5px';
      errorEl.style.display = 'none';

      inputEl.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              if (inputEl.value) {
                  const parsed = this.parseUrl(inputEl.value);
                  if (parsed) {
                      this.data.url = parsed.embedUrl;
                      this.data.service = parsed.service;
                      this.wrapper.removeChild(inputUI);
                      this.renderEmbed();
                      this.api.triggerChange();
                  } else {
                      errorEl.textContent = 'Invalid or unsupported URL. Please use YouTube or Aparat.';
                      errorEl.style.display = 'block';
                  }
              }
          }
      });

      inputUI.appendChild(inputEl);
      inputUI.appendChild(errorEl);
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
