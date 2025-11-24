import { IPlugin } from '../types';
import { Editron } from '../core/Editron';
import { AIAssistant } from './AIAssistant';

export class SlashMenu implements IPlugin {
  public name: string = 'slash-menu';
  private editor: Editron | null = null;
  private menu: HTMLElement;
  private activeBlockId: string | null = null;
  private isOpen: boolean = false;
  private selectedIndex: number = 0;

  constructor() {
    this.menu = document.createElement('div');
    this.menu.classList.add('editron-slash-menu');
    this.menu.style.display = 'none';
    // Content will be rendered in init() when editor (and i18n) is available
    document.body.appendChild(this.menu);
  }

  init(editor: Editron): void {
    this.editor = editor;
    this.renderMenu();

    this.editor.holder.addEventListener('keyup', (e) => {
        this.handleKeyUp(e);
    });

    this.editor.holder.addEventListener('keydown', (e) => {
        if (this.isOpen) {
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'Enter') {
                e.preventDefault();
                this.handleNavigation(e);
            }
        }
    });

    this.menu.addEventListener('click', (e) => {
        e.stopPropagation();
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

    document.addEventListener('click', (e) => {
        if (!this.menu.contains(e.target as Node)) {
            this.close();
        }
    });
  }

  renderMenu() {
      if (!this.editor) return;
      const t = (k: string) => this.editor!.t(k);

      this.menu.innerHTML = `
        <div class="menu-item" data-type="header" data-level="1">${t('slash_menu.heading1')}</div>
        <div class="menu-item" data-type="header" data-level="2">${t('slash_menu.heading2')}</div>
        <div class="menu-item" data-type="header" data-level="3">${t('slash_menu.heading3')}</div>
        <div class="menu-item" data-type="paragraph">${t('slash_menu.paragraph')}</div>
        <div class="menu-item" data-type="list" data-style="unordered">${t('slash_menu.list_unordered')}</div>
        <div class="menu-item" data-type="list" data-style="ordered">${t('slash_menu.list_ordered')}</div>
        <div class="menu-item" data-type="checklist">${t('slash_menu.checklist')}</div>
        <div class="menu-item" data-type="quote">${t('slash_menu.quote')}</div>
        <div class="menu-item" data-type="image">${t('slash_menu.image')}</div>
        <div class="menu-item" data-type="divider">${t('slash_menu.divider')}</div>
        <div class="menu-item" data-type="code">${t('slash_menu.code')}</div>
        <div class="menu-item" data-type="table">${t('slash_menu.table')}</div>
        <div class="menu-item" data-type="video">${t('slash_menu.video')}</div>
        <div class="menu-item" data-type="ai-generate">${t('slash_menu.ai_generate')}</div>
      `;
  }

  handleNavigation(e: KeyboardEvent) {
      const items = this.menu.querySelectorAll('.menu-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowUp') {
          this.selectedIndex = (this.selectedIndex - 1 + items.length) % items.length;
          this.updateSelection();
      } else if (e.key === 'ArrowDown') {
          this.selectedIndex = (this.selectedIndex + 1) % items.length;
          this.updateSelection();
      } else if (e.key === 'Enter') {
          const selectedItem = items[this.selectedIndex] as HTMLElement;
          if (selectedItem) {
              selectedItem.click();
          }
      }
  }

  updateSelection() {
      const items = this.menu.querySelectorAll('.menu-item');
      items.forEach((item, index) => {
          if (index === this.selectedIndex) {
              item.classList.add('selected');
              item.scrollIntoView({ block: 'nearest' });
          } else {
              item.classList.remove('selected');
          }
      });
  }

  handleKeyUp(_e: KeyboardEvent) {
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
      this.selectedIndex = 0;
      const rect = blockEl.getBoundingClientRect();
      this.menu.style.display = 'block';
      this.menu.style.top = `${rect.bottom + window.scrollY}px`;

      // RTL Support for Menu Positioning
      if (this.editor?.i18n.isRTL()) {
           this.menu.style.left = 'auto';
           this.menu.style.right = `${window.innerWidth - rect.right + window.scrollX}px`;
           this.menu.classList.add('editron-rtl');
      } else {
           this.menu.style.left = `${rect.left + window.scrollX}px`;
           this.menu.style.right = 'auto';
           this.menu.classList.remove('editron-rtl');
      }

      this.updateSelection();
  }

  triggerAIGenerate(target: HTMLElement) {
      if (!this.editor) return;
      const aiPlugin = this.editor.pluginManager.get('ai-assistant') as AIAssistant;
      if (aiPlugin && this.activeBlockId) {
          const blockEl = this.editor.holder.querySelector(`[data-block-id="${this.activeBlockId}"]`);
          if (blockEl) {
              const range = document.createRange();
              range.selectNodeContents(blockEl);
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
