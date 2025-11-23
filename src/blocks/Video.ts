import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class VideoBlock implements IBlock {
  public id: string;
  public type: string = 'video';
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
        this.renderVideo();
    } else {
        this.renderInput();
    }
  }

  renderInput() {
      this.element.innerHTML = '';
      const inputWrapper = document.createElement('div');
      inputWrapper.classList.add('ce-video-input-wrapper');

      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Paste YouTube/Vimeo URL...';
      input.classList.add('ce-video-input');

      input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
              e.preventDefault();
              this.url = input.value;
              if (this.url) {
                  this.renderVideo();
              }
          }
      });

      inputWrapper.appendChild(input);
      this.element.appendChild(inputWrapper);
  }

  renderVideo() {
      this.element.innerHTML = '';
      const container = document.createElement('div');
      container.classList.add('ce-video-container');

      const iframe = document.createElement('iframe');
      iframe.src = this.getEmbedUrl(this.url);
      iframe.width = '100%';
      iframe.height = '315';
      iframe.frameBorder = '0';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.classList.add('ce-video');

      const caption = document.createElement('div');
      caption.contentEditable = 'true';
      caption.classList.add('ce-video-caption');
      caption.innerHTML = this.caption;
      caption.dataset.placeholder = 'Type a caption...';

      caption.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              this.editor.blockManager.addBlock('paragraph', {}, true, this.id);
          }
      });

      container.appendChild(iframe);
      container.appendChild(caption);
      this.element.appendChild(container);
  }

  getEmbedUrl(url: string): string {
      // Simple YouTube regex
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const ytMatch = url.match(youtubeRegex);
      if (ytMatch) {
          return `https://www.youtube.com/embed/${ytMatch[1]}`;
      }

      // Simple Vimeo regex
      const vimeoRegex = /vimeo\.com\/(\d+)/;
      const vimeoMatch = url.match(vimeoRegex);
      if (vimeoMatch) {
          return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }

      return url; // Fallback (might not work in iframe if X-Frame-Options block)
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
      const captionEl = this.element.querySelector('.ce-video-caption');
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
          const caption = this.element.querySelector('.ce-video-caption') as HTMLElement;
          if (caption) caption.focus();
      }
  }
}
