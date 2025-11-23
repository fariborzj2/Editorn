import { IPlugin } from '../types';
import { Editron } from '../core/Editron';
import { AIAssistant } from './AIAssistant';

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
        <div class="menu-item" data-type="list" data-style="unordered">Bulleted List</div>
        <div class="menu-item" data-type="list" data-style="ordered">Ordered List</div>
        <div class="menu-item" data-type="quote">Quote</div>
        <div class="menu-item" data-type="image">Image</div>
        <div class="menu-item" data-type="divider">Divider</div>
        <div class="menu-item" data-type="code">Code Block</div>
        <div class="menu-item" data-type="table">Table</div>
        <div class="menu-item" data-type="video">Video Embed</div>
        <div class="menu-item" data-type="ai-generate">✨ Generate Text</div>
    `;

    this.menu.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing other menus immediately if listeners conflict
        const target = e.target as HTMLElement;
        if (target.classList.contains('menu-item') && this.activeBlockId && this.editor) {
            const type = target.dataset.type;
            const level = target.dataset.level ? parseInt(target.dataset.level) : undefined;

            if (type === 'ai-generate') {
                this.triggerAIGenerate(target);
                this.close();
                return;
            }

            if (type) {
                const style = target.dataset.style;
                this.editor.blockManager.replaceBlock(this.activeBlockId, type, {
                    text: '',
                    level: level,
                    style: style
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

  triggerAIGenerate(target: HTMLElement) {
      if (!this.editor) return;
      const aiPlugin = this.editor.pluginManager.get('ai-assistant') as AIAssistant;
      if (aiPlugin && this.activeBlockId) {
          // Select the slash text so AI knows what context or just show dialog
          // The dialog currently uses selection.
          // We should probably remove the "/" character first?
          // Ideally pass "Expand" action directly.
          // But current AI implementation relies on selection.
          // Let's manually set selection to the block content (minus slash?)
          // Actually slash menu triggers on "/" at start. content is "/".

          // Hack: Insert a placeholder or just open dialog
          // Let's open dialog near the menu item

          // We need to ensure there is a selection for AI to work or modify AI to accept explicit text.
          // Current AI mock uses `window.getSelection()`.
          // Let's select the block.
          // const block = this.editor.blockManager.getBlockById(this.activeBlockId);
          // renderBlocks? No, we need the DOM element.
          // BlockManager doesn't expose DOM element easily by ID.
          // We can querySelector.
          const blockEl = this.editor.holder.querySelector(`[data-block-id="${this.activeBlockId}"]`);
          if (blockEl) {
              const range = document.createRange();
              range.selectNodeContents(blockEl); // Selects whole block
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);

              const rect = target.getBoundingClientRect();
              aiPlugin.show(rect);
          }
      }
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
