import { SlashMenuState } from '../core/engine/SlashMenuState.js';
import { Transaction, TransactionTypes } from '../core/engine/Transaction.js';

export class SlashMenu {
  constructor({ api, config }) {
    this.api = api;
    this.config = config || {};
    this.menu = null;
    this.isOpen = false;
    this.selectedIndex = 0;
    this.currentQuery = '';
    this.activeBlockId = null;

    // Use a generic mechanism if engine available, fallback to api
    this.engine = this.api.engine;

    this.init();
  }

  init() {
     if (this.engine) {
         // Subscribe to state changes if using engine model
         const originalOnChange = this.engine.onStateChange;
         this.engine.onStateChange = (state) => {
             if (originalOnChange) originalOnChange(state);
             this.handleStateChange(state);
         };

         this.api.container.addEventListener('keydown', (e) => this.handleKeydown(e), true);
     } else {
         // Fallback legacy support just in case
         this.api.container.addEventListener('input', (e) => this.legacyHandleInput(e));
         this.api.container.addEventListener('keydown', (e) => this.handleKeydown(e), true);
     }
  }

  handleStateChange(state) {
      const derived = SlashMenuState.derive(state);

      if (derived.active) {
          this.currentQuery = derived.query;
          this.activeBlockId = derived.position.blockId;

          // Render items based on query (filtering not fully implemented, but framework is here)
          this.renderItems(this.currentQuery);

          // Try to find the block element to anchor the menu
          if (!this.isOpen) {
              const renderedBlocks = this.api.renderer.renderedBlocks;
              if (renderedBlocks) {
                  const blockEl = renderedBlocks.get(this.activeBlockId)?.el;
                  if (blockEl) this.open(blockEl);
              }
          }
      } else {
          this.close();
      }
  }

  createMenu() {
    this.menu = document.createElement('div');
    this.menu.classList.add('editorn-slash-menu');
    this.menu.style.position = 'absolute';
    this.menu.style.display = 'none';
    this.menu.style.backgroundColor = 'white';
    this.menu.style.border = '1px solid #ccc';
    this.menu.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
    this.menu.style.zIndex = '100';
    this.menu.style.padding = '5px 0';
    this.menu.style.borderRadius = '4px';
    this.menu.style.maxHeight = '250px';
    this.menu.style.overflowY = 'auto';

    this.itemsList = document.createElement('div');
    this.menu.appendChild(this.itemsList);

    document.body.appendChild(this.menu);
  }

  renderItems(query) {
      if (!this.menu) this.createMenu();

      this.itemsList.innerHTML = '';

      const allItems = [
        { label: 'Paragraph', type: 'paragraph' },
        { label: 'Header 1', type: 'header', data: { level: 1 } },
        { label: 'Header 2', type: 'header', data: { level: 2 } },
        { label: 'Header 3', type: 'header', data: { level: 3 } },
        { label: 'Bulleted List', type: 'list', data: { style: 'unordered' } },
        { label: 'Numbered List', type: 'list', data: { style: 'ordered' } },
        { label: 'Quote', type: 'quote' },
        { label: 'Divider', type: 'divider' },
        { label: 'Code', type: 'code' }
      ];

      const filteredItems = query
        ? allItems.filter(i => i.label.toLowerCase().includes(query.toLowerCase()) || i.type.includes(query.toLowerCase()))
        : allItems;

      if (filteredItems.length === 0) {
          this.close();
          return;
      }

      filteredItems.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.innerText = item.label;
        btn.style.display = 'block';
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.style.border = 'none';
        btn.style.background = 'none';
        btn.style.padding = '8px 15px';
        btn.style.cursor = 'pointer';

        btn.addEventListener('mouseover', () => {
            this.setSelectedIndex(index);
        });

        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.convertBlock(item.type, item.data);
        });

        this.itemsList.appendChild(btn);
      });

      this.setSelectedIndex(0);
  }

  setSelectedIndex(index) {
    if (!this.itemsList) return;
    const items = this.itemsList.querySelectorAll('button');
    if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
      items[this.selectedIndex].style.backgroundColor = 'transparent';
    }
    this.selectedIndex = index;
    if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
      items[this.selectedIndex].style.backgroundColor = '#f0f0f0';
      items[this.selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  handleKeydown(e) {
    if (!this.isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const items = this.itemsList.querySelectorAll('button');
      this.setSelectedIndex((this.selectedIndex + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const items = this.itemsList.querySelectorAll('button');
      this.setSelectedIndex((this.selectedIndex - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation(); // prevent input pipeline from handling enter
      const items = this.itemsList.querySelectorAll('button');
      if (this.selectedIndex >= 0 && this.selectedIndex < items.length) {
          items[this.selectedIndex].click();
      }
    }
  }

  open(element) {
    if (!this.menu) {
      this.createMenu();
    }

    const rect = element.getBoundingClientRect();
    this.menu.style.top = `${rect.bottom + window.scrollY}px`;
    this.menu.style.left = `${rect.left + window.scrollX}px`;
    this.menu.style.display = 'block';
    this.isOpen = true;
  }

  close() {
    if (this.menu) {
      this.menu.style.display = 'none';
    }
    this.isOpen = false;
    this.activeBlockId = null;
  }

  convertBlock(type, data = {}) {
    if (this.engine && this.activeBlockId) {
        // Find how many characters to delete based on currentQuery + the slash
        // We dispatch a delete to remove the trigger string, then a replace block.
        // Actually simpler: just replace block directly, text is reset.
        this.engine.dispatch(new Transaction(TransactionTypes.REPLACE_BLOCK, {
            blockId: this.activeBlockId,
            newType: type,
            newData: data
        }));
    } else {
        // Legacy fallback
        const index = this.api.findActiveBlockIndex();
        if (index !== -1) {
            this.api.blockManager.removeBlock(index);
            this.api.blockManager.insertBlock(type, data, index);
            this.api.renderer.renderBlocks(this.api.blockManager.getBlocks());
            this.api.triggerChange();
        }
    }
    this.close();
  }

  legacyHandleInput(e) {
      // Retained for backward compatibility if engine is not used
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const blockIndex = this.api.findActiveBlockIndex();
      if (blockIndex === -1) {
          this.close();
          return;
      }

      const block = this.api.blockManager.getBlocks()[blockIndex];

      // Only trigger in paragraph blocks
      if (block.type !== 'paragraph') {
          this.close();
          return;
      }

      // Refine the trigger condition to ensure the `/` is at the exact current cursor position and preceded by a space or start-of-line
      const range = selection.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(block.element);
      preRange.setEnd(range.startContainer, range.startOffset);

      // Get text immediately before cursor
      const textBeforeCursor = preRange.toString().replace(/\u200B/g, '');

      if (textBeforeCursor === '/' || textBeforeCursor.endsWith(' /') || textBeforeCursor.endsWith('\n/')) {
        this.open(block.element);
        this.activeBlockId = block.id; // simulate engine property
      } else {
        this.close();
      }
  }
}
