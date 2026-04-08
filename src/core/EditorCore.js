import { BlockManager } from './BlockManager.js';
import { Renderer } from './Renderer.js';

export class EditorCore {
  constructor(config) {
    this.config = Object.assign({
      el: null,
      data: { blocks: [] },
      onChange: null
    }, config);

    this.el = typeof this.config.el === 'string' ? document.querySelector(this.config.el) : this.config.el;

    if (!this.el) {
      console.error('EditorCore: Target element not found');
      return;
    }

    this.init();
  }

  init() {
    this.el.innerHTML = '';
    this.container = document.createElement('div');
    this.container.className = 'editorn-container';
    this.el.appendChild(this.container);

    this.renderer = new Renderer(this.container);
    this.blockManager = new BlockManager(this);

    this.renderInitialData();

    // Listen to container events to handle block creation (Enter key)
    this.container.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
  }

  renderInitialData() {
    const blocks = this.config.data.blocks;
    if (blocks && blocks.length > 0) {
      blocks.forEach(blockData => {
        this.blockManager.insertBlock(blockData.type, blockData.data);
      });
    } else {
      // Create an empty paragraph block by default
      this.blockManager.insertBlock('paragraph');
    }

    this.renderer.renderBlocks(this.blockManager.getBlocks());
  }

  handleGlobalKeydown(e) {
    if (e.key === 'Enter') {
      // Find the current active block
      // This is a simplified version; a full implementation requires Selection API management.
      e.preventDefault();
      const currentBlockIndex = this.findActiveBlockIndex();

      const newBlock = this.blockManager.insertBlock('paragraph', {}, currentBlockIndex + 1);

      // Re-render blocks
      this.renderer.renderBlocks(this.blockManager.getBlocks());

      // Focus the new block
      if (newBlock && newBlock.element) {
        newBlock.element.focus();
      }

      this.triggerChange();
    } else if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection.isCollapsed && selection.focusOffset === 0) {
         // Prevent deleting the first character from acting like a block delete if not at start of block
         // Real logic requires more advanced DOM selection check.
      }
    }
  }

  findActiveBlockIndex() {
    const activeElement = document.activeElement;
    const blocks = this.blockManager.getBlocks();
    return blocks.findIndex(b => b.element === activeElement || b.element.contains(activeElement));
  }

  triggerChange() {
    if (this.config.onChange) {
      this.config.onChange(this.save());
    }
  }

  save() {
    return {
      time: Date.now(),
      version: '1.0.0',
      blocks: this.blockManager.save()
    };
  }
}
