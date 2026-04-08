export class DragDropManager {
  constructor(editor) {
    this.editor = editor;
    this.draggedBlockIndex = null;
    this.indicator = null;

    this.boundDragStart = this.handleDragStart.bind(this);
    this.boundDragOver = this.handleDragOver.bind(this);
    this.boundDrop = this.handleDrop.bind(this);
    this.boundDragEnd = this.handleDragEnd.bind(this);

    this.init();
  }

  init() {
    this.editor.container.addEventListener('dragstart', this.boundDragStart);
    this.editor.container.addEventListener('dragover', this.boundDragOver);
    this.editor.container.addEventListener('drop', this.boundDrop);
    this.editor.container.addEventListener('dragend', this.boundDragEnd);

    this.createIndicator();
  }

  createIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.classList.add('editorn-drop-indicator');
    this.indicator.style.height = '2px';
    this.indicator.style.backgroundColor = '#007bff';
    this.indicator.style.margin = '5px 0';
    this.indicator.style.display = 'none';
    this.indicator.style.pointerEvents = 'none';
  }

  makeBlocksDraggable() {
     // This method should be called by the Renderer, but for decoupling,
     // we assume the block wrappers have a draggable handle or the block itself is draggable.
     // For this boilerplate implementation, we will add draggable dynamically.
  }

  getClosestBlockElement(target) {
      const blocks = this.editor.blockManager.getBlocks();
      for (let i = 0; i < blocks.length; i++) {
          // Check if target is inside the wrapperElement created by Renderer
          if (blocks[i].wrapperElement && (blocks[i].wrapperElement === target || blocks[i].wrapperElement.contains(target))) {
              return { block: blocks[i], index: i };
          }
      }
      return null;
  }

  handleDragStart(e) {
    // Only allow drag if the target was the drag handle
    if (!e.target.classList.contains('editorn-drag-handle')) {
        e.preventDefault();
        return;
    }

    const blockInfo = this.getClosestBlockElement(e.target);
    if (blockInfo) {
        this.draggedBlockIndex = blockInfo.index;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', blockInfo.index);

        // Add visual cue
        setTimeout(() => {
            if (blockInfo.block.wrapperElement) {
                blockInfo.block.wrapperElement.style.opacity = '0.5';
            }
        }, 0);
    }
  }

  handleDragOver(e) {
    if (this.draggedBlockIndex === null) return;

    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';

    const targetBlockInfo = this.getClosestBlockElement(e.target);

    if (targetBlockInfo && targetBlockInfo.index !== this.draggedBlockIndex) {
        const targetEl = targetBlockInfo.block.wrapperElement;
        const rect = targetEl.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;

        if (e.clientY < midY) {
            targetEl.parentNode.insertBefore(this.indicator, targetEl);
            this.indicator.dataset.position = targetBlockInfo.index;
        } else {
            targetEl.parentNode.insertBefore(this.indicator, targetEl.nextSibling);
            this.indicator.dataset.position = targetBlockInfo.index + 1;
        }
        this.indicator.style.display = 'block';
    } else {
        this.indicator.style.display = 'none';
    }
  }

  handleDrop(e) {
    if (this.draggedBlockIndex === null) return;
    e.preventDefault();

    this.indicator.style.display = 'none';

    if (this.indicator.dataset.position !== undefined) {
        let insertIndex = parseInt(this.indicator.dataset.position, 10);

        // Adjust index if we are moving the block downwards
        if (insertIndex > this.draggedBlockIndex) {
            insertIndex--;
        }

        if (insertIndex !== this.draggedBlockIndex) {
            this.editor.blockManager.moveBlock(this.draggedBlockIndex, insertIndex);
            this.editor.renderer.renderBlocks(this.editor.blockManager.getBlocks());
            this.editor.triggerChange();
        }
    }

    this.draggedBlockIndex = null;
    delete this.indicator.dataset.position;
  }

  handleDragEnd(e) {
     this.indicator.style.display = 'none';
     this.draggedBlockIndex = null;

     const blocks = this.editor.blockManager.getBlocks();
     blocks.forEach(b => {
         if (b.wrapperElement) {
             b.wrapperElement.style.opacity = '1';
         }
     });
  }

  destroy() {
    this.editor.container.removeEventListener('dragstart', this.boundDragStart);
    this.editor.container.removeEventListener('dragover', this.boundDragOver);
    this.editor.container.removeEventListener('drop', this.boundDrop);
    this.editor.container.removeEventListener('dragend', this.boundDragEnd);
    if (this.indicator && this.indicator.parentNode) {
        this.indicator.parentNode.removeChild(this.indicator);
    }
  }
}
