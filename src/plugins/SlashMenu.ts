import { IPlugin } from '../types';
import { Editron } from '../core/Editron';

export class SlashMenu implements IPlugin {
  public name: string = 'slash-menu';
  private editor: Editron | null = null;
  private menu: HTMLElement;
  private activeBlockId: string | null = null;
  private isOpen: boolean = false;

  constructor() {
    this.menu = document.createElement('div');
    this.menu.classList.add('editron-slash-menu');
    this.menu.style.display = 'none';
    this.menu.innerHTML = `
        <div class="menu-item" data-type="header" data-level="1">Heading 1</div>
        <div class="menu-item" data-type="header" data-level="2">Heading 2</div>
        <div class="menu-item" data-type="header" data-level="3">Heading 3</div>
        <div class="menu-item" data-type="paragraph">Paragraph</div>
    `;

    this.menu.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains('menu-item') && this.activeBlockId && this.editor) {
            const type = target.dataset.type;
            const level = target.dataset.level ? parseInt(target.dataset.level) : undefined;

            if (type) {
                this.editor.blockManager.replaceBlock(this.activeBlockId, type, {
                    text: '',
                    level: level
                });
            }
            this.close();
        }
    });

    document.body.appendChild(this.menu);
  }

  init(editor: Editron): void {
    this.editor = editor;

    this.editor.holder.addEventListener('keyup', (e) => {
        this.handleKeyUp(e);
    });

    document.addEventListener('click', (e) => {
        if (!this.menu.contains(e.target as Node)) {
            this.close();
        }
    });
  }

  handleKeyUp(_e: KeyboardEvent) { // Renamed e to _e to suppress unused warning if that was it
      if (!this.editor) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const node = range.startContainer;

      // Check if we are in a block
      // @ts-ignore
      const blockEl = node.nodeType === Node.TEXT_NODE ? node.parentElement.closest('.ce-block') : (node as HTMLElement).closest('.ce-block');

      if (blockEl) {
          const text = blockEl.textContent || '';
          if (text.trim() === '/' && !this.isOpen) {
              this.activeBlockId = (blockEl as HTMLElement).dataset.id || null;
              this.open(blockEl as HTMLElement);
          } else if (text.trim() !== '/' && this.isOpen) {
              this.close();
          }
      }
  }

  open(blockEl: HTMLElement) {
      this.isOpen = true;
      const rect = blockEl.getBoundingClientRect();
      this.menu.style.display = 'block';
      this.menu.style.top = `${rect.bottom + window.scrollY}px`;
      this.menu.style.left = `${rect.left + window.scrollX}px`;
  }

  close() {
      this.isOpen = false;
      this.menu.style.display = 'none';
      this.activeBlockId = null;
  }

  destroy() {
      this.menu.remove();
  }
}
