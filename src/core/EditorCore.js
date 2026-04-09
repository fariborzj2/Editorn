import { DirectionManager } from '../utils/DirectionManager.js';
import { BlockManager } from './BlockManager.js';
import { Renderer } from './Renderer.js';
import { PluginManager } from './PluginManager.js';
import { PasteManager } from './PasteManager.js';
import { HistoryManager } from './HistoryManager.js';
import { DragDropManager } from './DragDropManager.js';

export class EditorCore {
  constructor(el, config = {}) {
    this.config = Object.assign({
      data: { blocks: [] },
      direction: 'auto',
      onChange: null
    }, config);

    this.el = typeof el === 'string' ? document.querySelector(el) : el;

    if (!this.el) {
      console.error('EditorCore: Target element not found');
      return;
    }

    // Storage for new extension instances
    this._activeExtensions = [];

    // We will leave the plugin manager for backward compatibility if needed,
    // but its role is significantly reduced.
    this.pluginManager = new PluginManager(this);

    this.init();
  }

  init() {
    this.el.innerHTML = '';
    this.container = document.createElement('div');
    this.container.className = 'editorn-container';
    this.el.appendChild(this.container);

    this.renderer = new Renderer(this.container);
    this.blockManager = new BlockManager(this);
    this.pasteManager = new PasteManager(this);
    this.historyManager = new HistoryManager(this);
    this.dragDropManager = new DragDropManager(this);
    this.directionManager = new DirectionManager(this.config.direction);

    // Initial data rendering is deferred until extensions are loaded.
    // It should be explicitly called.

    // Listen to container events to handle block creation (Enter key)
    this.container.addEventListener('keydown', (e) => this.handleGlobalKeydown(e));
  }

  renderInitialData() {
    const blocks = this.config.data && this.config.data.blocks ? this.config.data.blocks : [];
    if (blocks && blocks.length > 0) {
      blocks.forEach(blockData => {
        this.blockManager.insertBlock(blockData.type, blockData.data);
      });
    } else {
      // Create an empty paragraph block by default
      if (this.blockManager.blockClasses && this.blockManager.blockClasses['paragraph']) {
          this.blockManager.insertBlock('paragraph');
      }
    }

    this.renderer.renderBlocks(this.blockManager.getBlocks());
  }

  handleGlobalKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentBlockIndex = this.findActiveBlockIndex();
      if (currentBlockIndex === -1) return;

      const currentBlock = this.blockManager.getBlocks()[currentBlockIndex];
      const selection = window.getSelection();

      let textAfterCursor = '';
      let textBeforeCursor = currentBlock.element.innerHTML;

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        if (currentBlock.element.contains(range.startContainer)) {
          const preRange = range.cloneRange();
          preRange.selectNodeContents(currentBlock.element);
          preRange.setEnd(range.startContainer, range.startOffset);

          const postRange = range.cloneRange();
          postRange.selectNodeContents(currentBlock.element);
          postRange.setStart(range.endContainer, range.endOffset);

          const postFragment = postRange.cloneContents();
          const tempDiv = document.createElement('div');
          tempDiv.appendChild(postFragment);
          textAfterCursor = tempDiv.innerHTML;

          const preFragment = preRange.cloneContents();
          const tempDiv2 = document.createElement('div');
          tempDiv2.appendChild(preFragment);
          textBeforeCursor = tempDiv2.innerHTML;
        }
      }

      currentBlock.element.innerHTML = textBeforeCursor || '<br>';
      if (currentBlock.instance.data) {
          currentBlock.instance.data.text = textBeforeCursor;
      }

      const newBlock = this.blockManager.insertBlock('paragraph', { text: textAfterCursor }, currentBlockIndex + 1);

      this.renderer.renderBlocks(this.blockManager.getBlocks());

      if (newBlock && newBlock.element) {
        newBlock.element.focus();
        const newSelection = window.getSelection();
        const newRange = document.createRange();
        newRange.selectNodeContents(newBlock.element);
        newRange.collapse(true);
        newSelection.removeAllRanges();
        newSelection.addRange(newRange);
      }

      this.triggerChange();
    } else if (e.key === 'Backspace') {
      const currentBlockIndex = this.findActiveBlockIndex();
      if (currentBlockIndex <= 0) return;

      const selection = window.getSelection();
      if (selection.rangeCount > 0 && selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const currentBlock = this.blockManager.getBlocks()[currentBlockIndex];

        const preRange = range.cloneRange();
        preRange.selectNodeContents(currentBlock.element);
        preRange.setEnd(range.startContainer, range.startOffset);

        const textBeforeCursor = preRange.toString();

        if (textBeforeCursor.length === 0) {
          e.preventDefault();
          const previousBlock = this.blockManager.getBlocks()[currentBlockIndex - 1];

          const markerId = 'cursor-marker-' + Date.now();
          const marker = `<span id="${markerId}"></span>`;

          const prevHtml = previousBlock.element.innerHTML === '<br>' ? '' : previousBlock.element.innerHTML;
          const currHtml = currentBlock.element.innerHTML === '<br>' ? '' : currentBlock.element.innerHTML;

          previousBlock.element.innerHTML = prevHtml + marker + currHtml;

          if (previousBlock.element.innerHTML === '') {
              previousBlock.element.innerHTML = '<br>';
          }

          this.blockManager.removeBlock(currentBlockIndex);

          this.renderer.renderBlocks(this.blockManager.getBlocks());

          const markerEl = document.getElementById(markerId);
          if (markerEl) {
            const newSelection = window.getSelection();
            const newRange = document.createRange();
            newRange.setStartBefore(markerEl);
            newRange.collapse(true);
            newSelection.removeAllRanges();
            newSelection.addRange(newRange);
            markerEl.remove();
          } else {
             previousBlock.element.focus();
          }

          if (previousBlock.instance.data) {
              previousBlock.instance.data.text = previousBlock.element.innerHTML;
          }

          this.triggerChange();
        }
      }
    }
  }

  findActiveBlockIndex() {
    const activeElement = document.activeElement;
    const blocks = this.blockManager.getBlocks();
    return blocks.findIndex(b => b.element === activeElement || b.element.contains(activeElement));
  }

  triggerChange() {
    if (this.historyManager) {
        this.historyManager.record();
    }
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

  destroy() {
    this._activeExtensions.forEach(ext => {
      if (typeof ext.destroy === 'function') {
        ext.destroy();
      }
    });
    this.el.innerHTML = '';
  }
}
