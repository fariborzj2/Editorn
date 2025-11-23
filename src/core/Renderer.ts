import { Editron } from './Editron';
import { IBlock } from '../types';

export class Renderer {
  private editor: Editron;
  private container: HTMLElement;

  constructor(editor: Editron) {
    this.editor = editor;
    this.container = document.createElement('div');
    this.container.classList.add('editron-wrapper');
    this.editor.holder.appendChild(this.container);
  }

  appendBlock(block: IBlock) {
    const element = block.render();
    this.container.appendChild(element);
  }

  replaceBlock(oldBlock: IBlock, newBlock: IBlock) {
      const oldElement = this.container.querySelector(`[data-id="${oldBlock.id}"]`);
      if (oldElement) {
          const newElement = newBlock.render();
          this.container.replaceChild(newElement, oldElement);
      }
  }

  insertBlockAfter(prevBlock: IBlock, newBlock: IBlock) {
      const prevElement = this.container.querySelector(`[data-id="${prevBlock.id}"]`);
      const newElement = newBlock.render();
      if (prevElement && prevElement.nextSibling) {
          this.container.insertBefore(newElement, prevElement.nextSibling);
      } else {
          this.container.appendChild(newElement);
      }
  }

  clear() {
      this.container.innerHTML = '';
  }
}
