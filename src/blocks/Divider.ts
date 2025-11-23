import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class Divider implements IBlock {
  public id: string;
  public type: string = 'divider';
  private element: HTMLElement;
  // private editor: Editron; // Unused for now

  constructor(id: string, _data: any, _editor: Editron) {
    this.id = id;
    // this.editor = editor;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const hr = document.createElement('hr');
    hr.classList.add('ce-divider');

    // Add a way to delete or move focus?
    // Usually dividers are not focusable in contenteditable in the same way,
    // but we wrap them in a block.
    // Let's make the wrapper focusable to handle Backspace/Enter.
    this.element.contentEditable = 'false'; // The HR itself isn't editable

    // We need a way to detect focus or clicks to "select" the divider.
    // For simplicity, we just render it. Deletion might rely on Backspace from next block
    // or selection across blocks.

    // However, to be consistent with block navigation, maybe we handle click?
    this.element.addEventListener('click', () => {
        this.focus();
    });

    this.element.appendChild(hr);
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
    return {
      id: this.id,
      type: this.type,
      content: {}
    };
  }

  focus(): void {
      // highlighting the divider to show selection could be done here
      this.element.classList.add('ce-block--focused');
      // Remove focus from others? The Renderer/BlockManager usually doesn't handle global focus state yet.
      // For now, let's just accept it exists.
  }
}
