import { EventEmitter } from './EventEmitter';
import { PluginManager } from './PluginManager';
import { BlockManager } from './BlockManager'; // Will create in next step
import { Renderer } from './Renderer'; // Will create in next step
import { PasteManager } from './PasteManager';
import { HistoryManager } from './HistoryManager';
import { EditronConfig, BlockData } from '../types';
import { I18n } from './I18n';
import { en } from '../locales/en';
import { fa } from '../locales/fa';

export class Editron extends EventEmitter {
  public config: EditronConfig;
  public pluginManager: PluginManager;
  public blockManager: BlockManager;
  public renderer: Renderer;
  public historyManager: HistoryManager;
  public holder: HTMLElement;
  public i18n: I18n;

  constructor(config: EditronConfig) {
    super();
    this.config = config;

    // Initialize I18n
    this.i18n = new I18n({
        locale: config.locale || 'en',
        messages: {
            en: en,
            fa: fa,
            ...config.i18n
        }
    });

    if (typeof config.holder === 'string') {
      const el = document.getElementById(config.holder);
      if (!el) throw new Error(`Element with id ${config.holder} not found`);
      this.holder = el;
    } else {
      this.holder = config.holder;
    }

    this.holder.classList.add('editron-editor');

    // Set text direction
    if (this.i18n.isRTL()) {
        this.holder.setAttribute('dir', 'rtl');
        this.holder.classList.add('editron-rtl');
    }

    // Capture input events to detect content changes
    this.holder.addEventListener('input', (e) => {
        this.emit('change');

        // Try to identify which block changed
        const target = e.target as HTMLElement;
        const blockWrapper = target.closest('.ce-block-wrapper') as HTMLElement;
        if (blockWrapper && blockWrapper.dataset.blockId) {
            const blockId = blockWrapper.dataset.blockId;
            // We need to get the new content.
            // This is expensive to save() everything.
            // For granular sync, we might need the block instance to save just itself.
            const block = this.blockManager.getBlockById(blockId);
            if (block) {
                this.emit('block:change', {
                    id: blockId,
                    content: block.save().content
                });
            }
        }
    });

    // Initialize sub-systems
    this.pluginManager = new PluginManager(this);
    this.blockManager = new BlockManager(this);
    this.renderer = new Renderer(this);
    this.historyManager = new HistoryManager(this);
    new PasteManager(this);

    this.setupShortcuts();
  }

  private setupShortcuts() {
      document.addEventListener('keydown', (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
              e.preventDefault();
              if (e.shiftKey) {
                  this.historyManager.redo();
              } else {
                  this.historyManager.undo();
              }
          }
          // Standard Redo (Ctrl+Y)
          if ((e.ctrlKey || e.metaKey) && e.key === 'y' && !e.shiftKey) {
              e.preventDefault();
              this.historyManager.redo();
          }
      });
  }

  public init(): void {
    this.emit('init');

    // If blocks are already present (e.g. from Autosave plugin), don't overwrite with initial data
    const currentBlocks = this.blockManager.save();
    if (currentBlocks.length > 0) {
        this.emit('ready');
        return;
    }

    // Render initial data or default block
    if (this.config.data && this.config.data.length > 0) {
        this.blockManager.renderBlocks(this.config.data);
    } else {
        this.blockManager.addBlock('paragraph', {}, false);
    }

    this.emit('ready');

    // Initial history state
    this.historyManager.pushState();

    // Listen for changes to update history (debounced)
    let debounceTimer: number;
    this.on('change', () => {
        clearTimeout(debounceTimer);
        debounceTimer = window.setTimeout(() => {
            this.historyManager.pushState();
        }, 500);
    });
  }

  public save(): Promise<BlockData[]> {
    return Promise.resolve(this.blockManager.save());
  }

  public t(key: string): string {
      return this.i18n.t(key);
  }
}
