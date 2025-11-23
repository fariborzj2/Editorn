import { IPlugin } from '../types';
import { Editron } from '../core/Editron';

export class InlineToolbar implements IPlugin {
  public name: string = 'inline-toolbar';
  private editor: Editron | null = null;
  private toolbar: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('editron-inline-toolbar');
    this.toolbar.style.display = 'none';
    this.toolbar.innerHTML = `
        <button class="toolbar-btn" data-cmd="bold"><b>B</b></button>
        <button class="toolbar-btn" data-cmd="italic"><i>I</i></button>
        <button class="toolbar-btn" data-cmd="underline"><u>U</u></button>
    `;

    // Prevent loss of focus when clicking buttons
    this.toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    this.toolbar.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('.toolbar-btn') as HTMLElement;
        if (target) {
            const cmd = target.dataset.cmd;
            if (cmd) {
                document.execCommand(cmd, false);
                this.updatePosition(); // Re-calculate position if needed
            }
        }
    });

    document.body.appendChild(this.toolbar);
  }

  init(editor: Editron): void {
    this.editor = editor;

    document.addEventListener('selectionchange', () => {
        this.handleSelectionChange();
    });

    // Also update on mouseup to be sure
    document.addEventListener('mouseup', () => {
        setTimeout(() => this.handleSelectionChange(), 0);
    });
  }

  handleSelectionChange() {
      if (!this.editor) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
          this.hide();
          return;
      }

      const range = selection.getRangeAt(0);
      const text = selection.toString();

      // Check if selection is within editor
      if (!this.editor.holder.contains(range.commonAncestorContainer)) {
          this.hide();
          return;
      }

      // Check if text is selected
      if (text.length === 0) {
          this.hide();
          return;
      }

      this.show(range);
  }

  show(range: Range) {
      this.isVisible = true;
      const rect = range.getBoundingClientRect();

      this.toolbar.style.display = 'flex';

      // Position above the selection
      const toolbarHeight = this.toolbar.offsetHeight || 40; // Approx if not rendered yet
      const top = rect.top + window.scrollY - toolbarHeight - 8;
      const left = rect.left + window.scrollX + (rect.width / 2) - (this.toolbar.offsetWidth / 2);

      this.toolbar.style.top = `${top}px`;
      this.toolbar.style.left = `${left}px`;
  }

  updatePosition() {
      if (this.isVisible) {
          this.handleSelectionChange();
      }
  }

  hide() {
      this.isVisible = false;
      this.toolbar.style.display = 'none';
  }

  destroy() {
      this.toolbar.remove();
  }
}
