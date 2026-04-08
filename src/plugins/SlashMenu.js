export class SlashMenu {
  constructor({ api, config }) {
    this.api = api;
    this.config = config || {};
    this.menu = null;
    this.isOpen = false;
    this.activeBlockIndex = -1;

    this.init();
  }

  init() {
    this.api.container.addEventListener('input', (e) => this.handleInput(e));
    this.api.container.addEventListener('keydown', (e) => this.handleKeydown(e), true);
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

    const items = [
      { label: 'Paragraph', type: 'paragraph' },
      { label: 'Header 1', type: 'header', data: { level: 1 } },
      { label: 'Header 2', type: 'header', data: { level: 2 } },
      { label: 'Header 3', type: 'header', data: { level: 3 } },
      { label: 'Bulleted List', type: 'list', data: { style: 'unordered' } },
      { label: 'Numbered List', type: 'list', data: { style: 'ordered' } },
      { label: 'Quote', type: 'quote' },
      { label: 'Divider', type: 'divider' }
    ];

    items.forEach(item => {
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

      btn.addEventListener('mouseover', () => btn.style.backgroundColor = '#f0f0f0');
      btn.addEventListener('mouseout', () => btn.style.backgroundColor = 'transparent');

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.convertBlock(item.type, item.data);
      });

      this.menu.appendChild(btn);
    });

    document.body.appendChild(this.menu);
  }

  handleInput(e) {
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

    // Replace ZERO WIDTH SPACE (used by contenteditable to maintain selection)
    const text = block.element.innerText.replace(/\u200B/g, '').trim();
    if (text === '/' || text.endsWith('/')) {
      this.open(block.element, blockIndex);
    } else {
      this.close();
    }
  }

  handleKeydown(e) {
    if (!this.isOpen) return;

    if (e.key === 'Escape') {
      this.close();
    } else if (e.key === 'Enter') {
        // Prevent default enter behavior when menu is open
        // Will implement full keyboard navigation later
    }
  }

  open(element, blockIndex) {
    if (!this.menu) {
      this.createMenu();
    }

    const rect = element.getBoundingClientRect();
    this.menu.style.top = `${rect.bottom + window.scrollY}px`;
    this.menu.style.left = `${rect.left + window.scrollX}px`;
    this.menu.style.display = 'block';
    this.isOpen = true;
    this.activeBlockIndex = blockIndex;
  }

  close() {
    if (this.menu) {
      this.menu.style.display = 'none';
    }
    this.isOpen = false;
    this.activeBlockIndex = -1;
  }

  convertBlock(type, data = {}) {
    if (this.activeBlockIndex !== -1) {
      const currentBlock = this.api.blockManager.getBlocks()[this.activeBlockIndex];
      // Note: we should replace the block, but currently BlockManager doesn't have an explicit replace method.
      // We will remove and insert instead.

      this.api.blockManager.removeBlock(this.activeBlockIndex);
      const newBlock = this.api.blockManager.insertBlock(type, data, this.activeBlockIndex);

      this.api.renderer.renderBlocks(this.api.blockManager.getBlocks());

      // Give the DOM a tiny bit of time to render before focusing
      setTimeout(() => {
        if (newBlock && newBlock.element) {
            if (newBlock.element.contentEditable === "true") {
                newBlock.element.focus();

                // Clear the default <br> if it exists to clean up
                if (newBlock.element.innerHTML === '<br>') {
                    newBlock.element.innerHTML = '';
                }
            } else {
                const editable = newBlock.element.querySelector('[contenteditable="true"]');
                if (editable) {
                    editable.focus();
                    if (editable.innerHTML === '<br>') {
                        editable.innerHTML = '';
                    }
                }
            }
        }
      }, 0);

      this.api.triggerChange();
    }
    this.close();
  }
}
