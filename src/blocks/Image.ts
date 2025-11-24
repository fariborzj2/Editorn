import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class ImageBlock implements IBlock {
  public id: string;
  public type: string = 'image';
  private element: HTMLElement;
  private editor: Editron;
  private url: string = '';
  private caption: string = '';
  private loading: boolean = false;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.url = data.url || '';
    this.caption = data.caption || '';

    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    if (this.url) {
        this.renderImage();
    } else {
        this.renderInput();
    }
  }

  renderInput() {
      this.element.innerHTML = '';
      const container = document.createElement('div');
      container.classList.add('ce-image-upload-area');
      container.style.border = '2px dashed #ddd';
      container.style.padding = '20px';
      container.style.textAlign = 'center';
      container.style.cursor = 'pointer';
      container.style.borderRadius = '8px';
      container.style.backgroundColor = '#f9f9f9';

      const placeholder = document.createElement('div');
      placeholder.innerHTML = '📁 ' + (this.editor.t('ui.upload_image') || 'Click to Upload or Paste URL');

      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = 'image/*';
      fileInput.style.display = 'none';

      const urlInput = document.createElement('input');
      urlInput.type = 'text';
      urlInput.placeholder = 'Or paste image URL...';
      urlInput.classList.add('ce-image-input');
      urlInput.style.marginTop = '10px';
      urlInput.style.width = '100%';
      urlInput.style.padding = '8px';

      // Events
      container.addEventListener('click', (e) => {
          if (e.target !== urlInput) {
              fileInput.click();
          }
      });

      container.addEventListener('dragover', (e) => {
          e.preventDefault();
          container.style.borderColor = '#3388ff';
      });

      container.addEventListener('dragleave', () => {
          container.style.borderColor = '#ddd';
      });

      container.addEventListener('drop', (e) => {
          e.preventDefault();
          container.style.borderColor = '#ddd';
          if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
              this.handleUpload(e.dataTransfer.files[0]);
          }
      });

      fileInput.addEventListener('change', () => {
          if (fileInput.files && fileInput.files.length > 0) {
              this.handleUpload(fileInput.files[0]);
          }
      });

      urlInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              this.url = urlInput.value;
              if (this.url) {
                  this.renderImage();
              }
          }
      });

      container.appendChild(placeholder);
      container.appendChild(fileInput);
      container.appendChild(urlInput);
      this.element.appendChild(container);
  }

  async handleUpload(file: File) {
      if (this.loading) return;
      this.loading = true;
      this.element.innerHTML = '<div class="ce-image-loading">Uploading...</div>';

      try {
          let url = '';
          if (this.editor.config.onImageUpload) {
              url = await this.editor.config.onImageUpload(file);
          } else {
              // Mock upload
              url = await this.mockUpload(file);
          }
          this.url = url;
          this.loading = false;
          this.renderImage();
      } catch (e) {
          console.error('Upload failed', e);
          this.loading = false;
          this.renderInput();
          alert('Upload failed');
      }
  }

  mockUpload(file: File): Promise<string> {
      return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
              setTimeout(() => {
                  resolve(e.target?.result as string);
              }, 1000);
          };
          reader.readAsDataURL(file);
      });
  }

  renderImage() {
      this.element.innerHTML = '';
      const container = document.createElement('div');
      container.classList.add('ce-image-container');

      const img = document.createElement('img');
      img.src = this.url;
      img.classList.add('ce-image');

      const caption = document.createElement('div');
      caption.contentEditable = 'true';
      caption.classList.add('ce-image-caption');
      caption.innerHTML = this.caption;
      caption.dataset.placeholder = 'Type a caption...';

      caption.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              this.editor.blockManager.addBlock('paragraph', {}, true, this.id);
          }
      });

      container.appendChild(img);
      container.appendChild(caption);
      this.element.appendChild(container);
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
      const captionEl = this.element.querySelector('.ce-image-caption');
      return {
          id: this.id,
          type: this.type,
          content: {
              url: this.url,
              caption: captionEl ? captionEl.innerHTML : ''
          }
      };
  }

  focus(): void {
      const input = this.element.querySelector('input');
      if (input) {
          input.focus();
      } else {
          const caption = this.element.querySelector('.ce-image-caption') as HTMLElement;
          if (caption) caption.focus();
      }
  }
}
