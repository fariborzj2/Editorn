import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class Quote implements IBlock {
  public id: string;
  public type: string = 'quote';
  private element: HTMLElement;
  private editor: Editron;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const content = document.createElement('blockquote');
    content.classList.add('ce-quote');
    content.contentEditable = 'true';
    content.innerHTML = data.text || '';
    content.dataset.placeholder = 'Enter a quote...';

    // Event handling
    content.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.editor.blockManager.addBlock('paragraph', {}, true, this.id);
        }
    });

    this.element.appendChild(content);
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
    const contentEl = this.element.querySelector('.ce-quote');
    return {
      id: this.id,
      type: this.type,
      content: {
        text: contentEl ? contentEl.innerHTML : ''
      }
    };
  }

  focus(): void {
      const contentEl = this.element.querySelector('.ce-quote') as HTMLElement;
      if (contentEl) {
          contentEl.focus();
      }
  }
}
