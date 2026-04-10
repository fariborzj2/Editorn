import { I18n } from '../utils/I18n.js';
import { DirectionManager } from '../utils/DirectionManager.js';
import { BlockManager } from './BlockManager.js';
// Replace Renderer with new DOMRenderer
import { DOMRenderer } from './engine/DOMRenderer.js';
import { PluginManager } from './PluginManager.js';
import { PasteManager } from './PasteManager.js';
import { HistoryManager } from './HistoryManager.js';
import { DragDropManager } from './DragDropManager.js';

// Engine imports
import { EditorEngine } from './engine/index.js';
import { Transaction, TransactionTypes } from './engine/Transaction.js';
import { InputPipeline } from './engine/InputPipeline.js';

export class EditorCore {
  constructor(el, config = {}) {
    this.config = Object.assign({
      data: { blocks: [] },
      direction: 'auto',
      lang: 'en',
      onChange: null
    }, config);

    this.el = typeof el === 'string' ? document.querySelector(el) : el;

    if (!this.el) {
      console.error('EditorCore: Target element not found');
      return;
    }

    this._activeExtensions = [];
    this.pluginManager = new PluginManager(this);

    this.init();
  }

  init() {
    this.el.innerHTML = '';
    this.container = document.createElement('div');
    this.container.className = 'editorn-container';
    this.el.appendChild(this.container);

    this.blockManager = new BlockManager(this);
    this.pasteManager = new PasteManager(this);
    this.historyManager = new HistoryManager(this);
    this.dragDropManager = new DragDropManager(this);
    this.directionManager = new DirectionManager(this.config.direction);
    this.i18n = new I18n(this.config.lang);

    // Initialize the new Engine
    this.engine = new EditorEngine(this.config.data, (state) => {
       this.renderer.render(state);
       this.triggerChange();
    });

  }

  renderInitialData() {
    // We pass blockClasses so the renderer knows what to instantiate
    this.renderer = new DOMRenderer(this.container, this.blockManager.blockClasses);

    // Bind the input pipeline now that renderer is ready

    this.inputPipeline = new InputPipeline(this.container, this.engine);

    // Initial render
    this.renderer.render(this.engine.getState());
  }

  // The following methods are adapted for the new architecture, or stubbed to prevent old behavior
  handleGlobalKeydown(e) {
      // Disabled. Handled by InputPipeline.
  }

  findActiveBlockIndex() {
      // Stub for legacy plugins
      const state = this.engine.getState();
      if (!state.selection) return -1;
      return state.blocks.findIndex(b => b.id === state.selection.anchorBlock);
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
    // Pull from engine state, not DOM
    const state = this.engine.getState();
    return {
      time: Date.now(),
      version: '1.0.0',
      blocks: state.blocks.map(b => ({ type: b.type, data: b.data }))
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
