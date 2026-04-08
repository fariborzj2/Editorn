import { IdGenerator } from '../utils/IdGenerator.js';
import { Paragraph } from '../blocks/Paragraph.js';

export class BlockManager {
  constructor(editor) {
    this.editor = editor;
    this.blocks = [];
    this.blockClasses = {
      paragraph: Paragraph
    };
  }

  insertBlock(type = 'paragraph', data = {}, index = this.blocks.length) {
    const BlockClass = this.blockClasses[type];
    if (!BlockClass) {
      console.error(`Block type "${type}" not found.`);
      return null;
    }

    const blockInstance = new BlockClass({ data, api: this.editor });
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
