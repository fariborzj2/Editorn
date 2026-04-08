import { IdGenerator } from '../utils/IdGenerator.js';
import { Paragraph } from '../blocks/Paragraph.js';
import { Header } from '../blocks/Header.js';
import { List } from '../blocks/List.js';
import { Quote } from '../blocks/Quote.js';
import { Divider } from '../blocks/Divider.js';
import { Image } from '../blocks/Image.js';
import { Embed } from '../blocks/Embed.js';

export class BlockManager {
  constructor(editor) {
    this.editor = editor;
    this.blocks = [];
    this.blockClasses = {
      paragraph: Paragraph,
      header: Header,
      list: List,
      quote: Quote,
      divider: Divider,
      image: Image,
      embed: Embed
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
