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

  clear() {
      this.container.innerHTML = '';
  }
}
