import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class ImageBlock implements IBlock {
  public id: string;
  public type: string = 'image';
  private element: HTMLElement;
  private editor: Editron;
  private url: string = '';
  private caption: string = '';

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
      const inputWrapper = document.createElement('div');
      inputWrapper.classList.add('ce-image-input-wrapper');

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Paste an image URL...';
      input.classList.add('ce-image-input');

      input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              this.url = input.value;
              if (this.url) {
                  this.renderImage();
              }
          }
      });

      inputWrapper.appendChild(input);
      this.element.appendChild(inputWrapper);
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
