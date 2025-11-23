import { Editron } from './Editron';
import { IBlock, BlockData } from '../types';
import { Paragraph } from '../blocks/Paragraph';
import { Header } from '../blocks/Header';
import { List } from '../blocks/List';
import { Quote } from '../blocks/Quote';
import { ImageBlock } from '../blocks/Image';
import { Divider } from '../blocks/Divider';
import { Code } from '../blocks/Code';
import { Table } from '../blocks/Table';

export class BlockManager {
  private editor: Editron;
  private blocks: IBlock[] = [];
  private registry: Map<string, any> = new Map();

  constructor(editor: Editron) {
    this.editor = editor;

    // Register default blocks
    this.register('paragraph', Paragraph);
    this.register('header', Header);
    this.register('list', List);
    this.register('quote', Quote);
    this.register('image', ImageBlock);
    this.register('divider', Divider);
    this.register('code', Code);
    this.register('table', Table);
  }

  register(type: string, blockClass: any) {
    this.registry.set(type, blockClass);
  }

  addBlock(type: string, data: any = {}, focus: boolean = true, afterBlockId?: string, id?: string): IBlock | null {
    const BlockClass = this.registry.get(type);
    if (!BlockClass) {
      console.error(`Block type ${type} not registered`);
      return null;
    }

    const blockId = id || crypto.randomUUID();
    const blockInstance: IBlock = new BlockClass(blockId, data, this.editor);

    if (afterBlockId) {
        const index = this.blocks.findIndex(b => b.id === afterBlockId);
        if (index !== -1) {
            this.blocks.splice(index + 1, 0, blockInstance);
            const prevBlock = this.blocks[index];
            this.editor.renderer.insertBlockAfter(prevBlock, blockInstance);
        } else {
            // Fallback to end
            this.blocks.push(blockInstance);
            this.editor.renderer.appendBlock(blockInstance);
        }
    } else {
        this.blocks.push(blockInstance);
        this.editor.renderer.appendBlock(blockInstance);
    }

    if (focus) {
        blockInstance.focus();
    }

    this.editor.emit('change');
    this.editor.emit('block:add', blockInstance.save());
    return blockInstance;
  }

  replaceBlock(blockId: string, type: string, data: any = {}): IBlock | null {
      const index = this.blocks.findIndex(b => b.id === blockId);
      if (index === -1) {
          console.error(`Block with id ${blockId} not found`);
          return null;
      }

      const BlockClass = this.registry.get(type);
      if (!BlockClass) {
        console.error(`Block type ${type} not registered`);
        return null;
      }

      // Preserve ID for continuity if needed, OR generate new one.
      // Usually, changing type keeps the position but technically is a new block.
      // Let's keep the ID for now if we want to simulate "morphing",
      // but usually replacing means new ID or same ID.
      // Let's use the SAME ID to keep it stable in lists if external references existed.
      const oldBlock = this.blocks[index];
      const newBlockInstance: IBlock = new BlockClass(blockId, data, this.editor);

      this.blocks[index] = newBlockInstance;
      this.editor.renderer.replaceBlock(oldBlock, newBlockInstance);
      newBlockInstance.focus();

      this.editor.emit('change');
      this.editor.emit('block:change', { id: blockId, content: newBlockInstance.save().content });
      return newBlockInstance;
  }

  getBlockById(id: string): IBlock | undefined {
      return this.blocks.find(b => b.id === id);
  }

  getBlockIndex(id: string): number {
      return this.blocks.findIndex(b => b.id === id);
  }

  getBlockByIndex(index: number): IBlock | undefined {
      return this.blocks[index];
  }

  renderBlocks(data: BlockData[]) {
    console.log('BlockManager: rendering blocks', data.length);
    this.editor.renderer.clear();
    this.blocks = [];
    data.forEach(blockData => {
        // Pass existing ID if available
        const added = this.addBlock(blockData.type, blockData.content, false, undefined, blockData.id);
        if (!added) console.error('Failed to add block', blockData.type);
    });
    console.log('BlockManager: blocks after render', this.blocks.length);
  }

  moveBlock(draggedId: string, targetId: string) {
      const draggedIndex = this.blocks.findIndex(b => b.id === draggedId);
      const targetIndex = this.blocks.findIndex(b => b.id === targetId);

      if (draggedIndex !== -1 && targetIndex !== -1) {
          // If we drag from top to bottom (draggedIndex < targetIndex),
          // removing the dragged block shifts the target index down by 1.
          // We want to insert AFTER the target in this case (usually).
          // But if we use drop-on-target logic, it usually means "put before target"
          // or "put after target" depending on mouse Y relative to center.
          // Assuming drop is "place here", let's check direction.

          const [draggedBlock] = this.blocks.splice(draggedIndex, 1);
          let newTargetIndex = this.blocks.findIndex(b => b.id === targetId);

          if (draggedIndex < targetIndex) {
              // Moving down. Insert AFTER the target (which shifted up).
              newTargetIndex = newTargetIndex + 1;
          } else {
              // Moving up. Insert BEFORE the target.
              // newTargetIndex is correct.
          }

          this.blocks.splice(newTargetIndex, 0, draggedBlock);

          this.renderBlocks(this.save());
          this.editor.emit('change');
          this.editor.emit('block:move', { id: draggedId, index: newTargetIndex });
      }
  }

  removeBlock(id: string) {
      const index = this.blocks.findIndex(b => b.id === id);
      if (index !== -1) {
          // const block = this.blocks[index];
          this.blocks.splice(index, 1);

          // We need a removeBlock method in Renderer to avoid full re-render
          // For now, full re-render is safe
          this.renderBlocks(this.save());

          this.editor.emit('change');
          this.editor.emit('block:remove', { id });
      }
  }

  save(): BlockData[] {
    return this.blocks.map(block => block.save());
  }
}
