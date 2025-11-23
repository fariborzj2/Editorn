import { describe, it, expect, beforeEach } from 'vitest';
import { Editron } from '../src/core/Editron';
import { BlockManager } from '../src/core/BlockManager';

describe('BlockManager', () => {
  let editor: Editron;
  let blockManager: BlockManager;

  beforeEach(() => {
    // Mock document elements
    document.body.innerHTML = '<div id="editor"></div>';
    editor = new Editron({ holder: 'editor' });
    blockManager = editor.blockManager;
  });

  it('should register default blocks', () => {
    // We don't have a getRegistry method exposed, but we can try to add blocks
    const block = blockManager.addBlock('paragraph');
    expect(block).toBeDefined();
    expect(block?.type).toBe('paragraph');
  });

  it('should add a block', () => {
    const block = blockManager.addBlock('header', { text: 'Test Header' });
    expect(block).toBeDefined();
    expect(block?.save().content.text).toBe('Test Header');
    expect(blockManager.save()).toHaveLength(1);
  });

  it('should remove a block', () => {
    const block = blockManager.addBlock('paragraph');
    expect(blockManager.save()).toHaveLength(1);

    if (block) {
        blockManager.removeBlock(block.id);
        expect(blockManager.save()).toHaveLength(0);
    }
  });

  it('should move a block', () => {
    const b1 = blockManager.addBlock('paragraph', { text: '1' });
    const b2 = blockManager.addBlock('paragraph', { text: '2' });
    const b3 = blockManager.addBlock('paragraph', { text: '3' });

    if (b1 && b2 && b3) {
        // Move b1 to position of b2 (index 1)
        // moveBlock(draggedId, targetId)

        // Current order: 1, 2, 3
        // Drag 1 to 2. Expected: 2, 1, 3 (or similar depending on insertion logic)
        // My logic: insert AFTER if moving down.
        // index(1)=0, index(2)=1. 0 < 1. newTarget = 1+1=2.
        // Splice 1 out. [2, 3]. Insert at 2. [2, 3, 1].

        blockManager.moveBlock(b1.id, b2.id);

        const saved = blockManager.save();
        // Initial: 1, 2, 3
        // Move 1 to 2 (index 0 to 1).
        // Logic: Insert AFTER if moving down.
        // Result: 2, 1, 3
        expect(saved[0].content.text).toBe('2');
        expect(saved[1].content.text).toBe('1');
        expect(saved[2].content.text).toBe('3');
    }
  });
});
