import { Sanitizer } from '../utils/Sanitizer.js';

export class Image {
  constructor({ data, api }) {
    this.data = {
      url: data && data.url ? data.url : '',
      caption: data && data.caption ? data.caption : ''
    };
    this.api = api;
    this.isMergeable = false;
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
    this.imageEl = document.createElement('img');
    this.imageEl.src = this.data.url;
    this.imageEl.alt = this.data.caption || 'Image';
    this.imageEl.style.maxWidth = '100%';
    this.imageEl.style.display = 'block';
    this.wrapper.insertBefore(this.imageEl, this.captionEl);
  }

  renderUploader() {
      const uploaderUI = document.createElement('div');
      uploaderUI.classList.add('editorn-image-uploader');
      uploaderUI.textContent = 'Drag an image here or click to upload';
      uploaderUI.style.border = '2px dashed #ccc';
      uploaderUI.style.padding = '20px';
      uploaderUI.style.textAlign = 'center';
      uploaderUI.style.cursor = 'pointer';
      uploaderUI.style.backgroundColor = '#fafafa';

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';
      uploaderUI.appendChild(fileInput);

      const handleUpload = (file) => {
          if (!file) return;
          uploaderUI.textContent = 'Uploading...';

          const onImageUpload = this.api.config.onImageUpload;
          if (onImageUpload && typeof onImageUpload === 'function') {
              onImageUpload(file).then(url => {
                  if (url) {
                      this.data.url = url;
                      this.wrapper.removeChild(uploaderUI);
                      this.renderImage();
                      this.api.triggerChange();
                  } else {
                      uploaderUI.textContent = 'Upload failed. Try again.';
                  }
              }).catch(() => {
                  uploaderUI.textContent = 'Upload failed. Try again.';
              });
          } else {
              // Fallback: Read as Data URL
              const reader = new FileReader();
              reader.onload = (e) => {
                  this.data.url = e.target.result;
                  this.wrapper.removeChild(uploaderUI);
                  this.renderImage();
                  this.api.triggerChange();
              };
              reader.readAsDataURL(file);
          }
      };

      uploaderUI.addEventListener('click', () => fileInput.click());

      fileInput.addEventListener('change', (e) => {
          if (e.target.files && e.target.files[0]) {
              handleUpload(e.target.files[0]);
          }
      });

      uploaderUI.addEventListener('dragover', (e) => {
          e.preventDefault();
          uploaderUI.style.backgroundColor = '#eef';
      });

      uploaderUI.addEventListener('dragleave', (e) => {
          e.preventDefault();
          uploaderUI.style.backgroundColor = '#fafafa';
      });

      uploaderUI.addEventListener('drop', (e) => {
          e.preventDefault();
          uploaderUI.style.backgroundColor = '#fafafa';
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleUpload(e.dataTransfer.files[0]);
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
