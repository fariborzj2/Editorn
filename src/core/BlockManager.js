import { IdGenerator } from '../utils/IdGenerator.js';

export class BlockManager {
  constructor(editor) {
    this.editor = editor;
    this.blocks = [];
    this.blockClasses = {};
    // Store the context once passed
    this.context = null;
  }

  register(name, implementation) {
    this.blockClasses[name] = implementation;
  }

  setContext(context) {
    this.context = context;
  }

  insertBlock(type = 'paragraph', data = {}, index = this.blocks.length) {
    const BlockClass = this.blockClasses[type];
    if (!BlockClass) {
      console.warn(`Block type "${type}" not found.`);
      return null;
    }

    // Support both the old API and the new Context API
    // We pass the injected context instead of the raw editor
    const blockInstance = new BlockClass(this.context || { data, api: this.editor }, data);

    // Legacy blocks might need `data` on the instance itself
    if (!blockInstance.data) blockInstance.data = data;

    // Some blocks might override the wrapper property during render.
    const blockElement = blockInstance.render();

    const blockObj = {
      id: IdGenerator.generate(),
      type: type,
      data: data,
      instance: blockInstance,
      element: blockElement
    };

    this.blocks.splice(index, 0, blockObj);
    return blockObj;
  }

  removeBlock(index) {
    if (index >= 0 && index < this.blocks.length) {
      this.blocks.splice(index, 1);
      return true;
    }
    return false;
  }

  moveBlock(fromIndex, toIndex) {
      if (fromIndex >= 0 && fromIndex < this.blocks.length && toIndex >= 0 && toIndex <= this.blocks.length) {
          const [block] = this.blocks.splice(fromIndex, 1);
          this.blocks.splice(toIndex, 0, block);
          return true;
      }
      return false;
  }

  getBlocks() {
    return this.blocks;
  }

  save() {
    return this.blocks.map(block => ({
      id: block.id,
      type: block.type,
      data: block.instance.save(block.element)
    }));
  }
}
