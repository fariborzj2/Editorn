import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class Code implements IBlock {
  public id: string;
  public type: string = 'code';
  private element: HTMLElement;
  // private editor: Editron; // Unused for now

  constructor(id: string, data: any, _editor: Editron) {
    this.id = id;
    // this.editor = editor;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const pre = document.createElement('pre');
    pre.classList.add('ce-code-wrapper');

    const code = document.createElement('code');
    code.classList.add('ce-code');
    code.contentEditable = 'true';
    code.innerHTML = data.code || '';
    code.spellcheck = false;
    code.dataset.placeholder = 'Type code...';

    // Handle Tab key
    code.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertText', false, '  ');
        }

        // Handle Enter to NOT create new block if Shift is not pressed?
        // Usually code blocks want Enter to be new line.
        // Shift+Enter or Ctrl+Enter to exit? Or just down arrow at end?
        // Standard block editor behavior: Enter creates new line IN code block.
        // Shift+Enter creates new line IN code block.
        // Command/Ctrl+Enter exits?
        // Let's stick to: Enter = new line.
        // We need a way to exit. Usually 3 enters? Or Down arrow.
        if (e.key === 'Enter') {
             e.stopPropagation(); // Prevent default block creation from bubbling if any
        }
    });

    // Paste handling to remove formatting?
    // Ideally we intercept paste and insert plain text.
    code.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
    });

    pre.appendChild(code);
    this.element.appendChild(pre);
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
    const codeEl = this.element.querySelector('.ce-code');
    return {
      id: this.id,
      type: this.type,
      content: {
        code: codeEl ? codeEl.innerHTML : '' // innerHTML might contain <br> or entities
        // Ideally we want textContent but we need to preserve newlines as \n or <br>
        // innerText is usually better for code
      }
    };
  }

  focus(): void {
      const codeEl = this.element.querySelector('.ce-code') as HTMLElement;
      if (codeEl) {
          codeEl.focus();
      }
  }
}
