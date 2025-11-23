import { Editron } from './Editron';
import { IBlock, BlockData } from '../types';
import { Paragraph } from '../blocks/Paragraph';

export class BlockManager {
  private editor: Editron;
  private blocks: IBlock[] = [];
  private registry: Map<string, any> = new Map();

  constructor(editor: Editron) {
    this.editor = editor;

    // Register default blocks
    this.register('paragraph', Paragraph);
  }

  register(type: string, blockClass: any) {
    this.registry.set(type, blockClass);
  }

  addBlock(type: string, data: any = {}, focus: boolean = true): IBlock | null {
    const BlockClass = this.registry.get(type);
    if (!BlockClass) {
      console.error(`Block type ${type} not registered`);
      return null;
    }

    const id = crypto.randomUUID();
    const blockInstance: IBlock = new BlockClass(id, data, this.editor);

    this.blocks.push(blockInstance);
    this.editor.renderer.appendBlock(blockInstance);

    if (focus) {
        blockInstance.focus();
    }

    return blockInstance;
  }

  renderBlocks(data: BlockData[]) {
    this.editor.renderer.clear();
    this.blocks = [];
    data.forEach(blockData => {
        this.addBlock(blockData.type, blockData.content, false);
    });
  }

  save(): BlockData[] {
    return this.blocks.map(block => block.save());
  }
}
