import { Sanitizer } from '../utils/Sanitizer.js';

export class Image {
  constructor({ data, api }) {
    this.data = data || { url: '', caption: '' };
    this.api = api;
    this.wrapper = undefined;
    this.imageEl = undefined;
    this.captionEl = undefined;
  }

  render() {
    this.wrapper = document.createElement('figure');
    this.wrapper.classList.add('editorn-block-image');
    this.wrapper.contentEditable = false; // The block itself is not editable, only the caption

    if (this.data.url) {
        this.renderImage();
    } else {
        this.renderUploader();
    }

    this.captionEl = document.createElement('figcaption');
    this.captionEl.classList.add('editorn-image-caption');
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

  renderImage() {
    // TODO: Phase 4 - Add support for resizing
    this.imageEl = document.createElement('img');
    this.imageEl.src = this.data.url;
    this.imageEl.alt = this.data.caption || 'Image';
    this.wrapper.insertBefore(this.imageEl, this.captionEl);
  }

  renderUploader() {
      // TODO: Phase 4 - Implement fully functioning drag & drop and file input UI using onImageUpload callback
      const uploaderUI = document.createElement('div');
      uploaderUI.classList.add('editorn-image-uploader');
      uploaderUI.textContent = 'Drag an image here or click to upload';
      uploaderUI.style.border = '2px dashed #ccc';
      uploaderUI.style.padding = '20px';
      uploaderUI.style.textAlign = 'center';
      uploaderUI.style.cursor = 'pointer';

      // Example stub interaction
      uploaderUI.addEventListener('click', () => {
          const url = prompt('Enter image URL (temporary stub for testing):');
          if (url) {
              this.data.url = url;
              this.wrapper.removeChild(uploaderUI);
              this.renderImage();
              this.api.triggerChange();
          }
      });

      this.wrapper.insertBefore(uploaderUI, this.captionEl);
  }

  save() {
    let captionHtml = this.captionEl.innerHTML;
    if (captionHtml === '<br>') captionHtml = '';

    return {
      url: this.data.url,
      caption: Sanitizer.sanitize(captionHtml)
    };
  }

  validate(savedData) {
    return !!savedData.url.trim(); // Block is valid if it has an image URL
  }
}
