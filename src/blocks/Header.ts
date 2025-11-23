import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class Header implements IBlock {
  public id: string;
  public type: string = 'header';
  private element: HTMLElement;
  private editor: Editron;
  private level: number;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.level = data.level || 1;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const content = document.createElement(`h${this.level}`);
    content.classList.add('ce-header');
    content.contentEditable = 'true';
    content.innerHTML = data.text || '';
    content.dataset.placeholder = `Heading ${this.level}`;

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
    const contentEl = this.element.querySelector('.ce-header');
    return {
      id: this.id,
      type: this.type,
      content: {
        text: contentEl ? contentEl.innerHTML : '',
        level: this.level
      }
    };
  }

  focus(): void {
      const contentEl = this.element.querySelector('.ce-header') as HTMLElement;
      if (contentEl) {
          contentEl.focus();
      }
  }
}
