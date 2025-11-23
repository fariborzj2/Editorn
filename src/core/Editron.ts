import { EventEmitter } from './EventEmitter';
import { PluginManager } from './PluginManager';
import { BlockManager } from './BlockManager'; // Will create in next step
import { Renderer } from './Renderer'; // Will create in next step
import { PasteManager } from './PasteManager';
import { EditronConfig, BlockData } from '../types';

export class Editron extends EventEmitter {
  public config: EditronConfig;
  public pluginManager: PluginManager;
  public blockManager: BlockManager;
  public renderer: Renderer;
  public holder: HTMLElement;

  constructor(config: EditronConfig) {
    super();
    this.config = config;

    if (typeof config.holder === 'string') {
      const el = document.getElementById(config.holder);
      if (!el) throw new Error(`Element with id ${config.holder} not found`);
      this.holder = el;
    } else {
      this.holder = config.holder;
    }

    this.holder.classList.add('editron-editor');

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
    new PasteManager(this);
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
  }

  public save(): Promise<BlockData[]> {
    return Promise.resolve(this.blockManager.save());
  }
}
