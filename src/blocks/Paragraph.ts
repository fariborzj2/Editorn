import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class Paragraph implements IBlock {
  public id: string;
  public type: string = 'paragraph';
  private element: HTMLElement;
  private editor: Editron;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const content = document.createElement('div');
    content.classList.add('ce-paragraph');
    content.contentEditable = 'true';
    content.innerHTML = data.text || '';

    // Basic event handling
    content.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.editor.blockManager.addBlock('paragraph');
        }
    });

    this.element.appendChild(content);
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
    const contentEl = this.element.querySelector('.ce-paragraph');
    return {
      id: this.id,
      type: this.type,
      content: {
        text: contentEl ? contentEl.innerHTML : ''
      }
    };
  }

  focus(): void {
      const contentEl = this.element.querySelector('.ce-paragraph') as HTMLElement;
      if (contentEl) {
          contentEl.focus();
      }
  }
}
