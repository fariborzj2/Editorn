// import { BlockData } from '../types';
import { Editron } from './Editron';

export class HistoryManager {
  private editor: Editron;
  private stack: string[] = [];
  private position: number = -1;
  private limit: number = 50;
  private isUndoing: boolean = false;

  constructor(editor: Editron) {
    this.editor = editor;
  }

  public pushState() {
    if (this.isUndoing) return;

    const content = JSON.stringify(this.editor.blockManager.save());

    // If current state matches top of stack, don't push (avoid duplicates)
    if (this.position >= 0 && this.stack[this.position] === content) {
        return;
    }

    // Truncate redo history if we push a new state while in middle of stack
    if (this.position < this.stack.length - 1) {
        this.stack = this.stack.slice(0, this.position + 1);
    }

    this.stack.push(content);
    if (this.stack.length > this.limit) {
        this.stack.shift();
    } else {
        this.position++;
    }

    // console.log('History saved. Stack size:', this.stack.length, 'Position:', this.position);
  }

  public undo() {
    if (this.position > 0) {
        this.isUndoing = true;
        this.position--;
        const content = JSON.parse(this.stack[this.position]);
        this.editor.blockManager.renderBlocks(content);
        this.isUndoing = false;
        // console.log('Undo. Position:', this.position);
    }
  }

  public redo() {
    if (this.position < this.stack.length - 1) {
        this.isUndoing = true;
        this.position++;
        const content = JSON.parse(this.stack[this.position]);
        this.editor.blockManager.renderBlocks(content);
        this.isUndoing = false;
        // console.log('Redo. Position:', this.position);
    }
  }
}
