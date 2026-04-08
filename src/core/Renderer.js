export class Renderer {
  constructor(editorContainer) {
    this.container = editorContainer;
  }

  renderBlocks(blocks) {
    this.container.innerHTML = '';
    blocks.forEach(block => {
      // Create a wrapper to hold both the drag handle and the block element
      const wrapper = document.createElement('div');
      wrapper.classList.add('editorn-block-wrapper');
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'flex-start';
      wrapper.style.gap = '8px';
      wrapper.style.marginBottom = '10px';

      // Create drag handle
      const dragHandle = document.createElement('div');
      dragHandle.classList.add('editorn-drag-handle');
      dragHandle.draggable = true;
      dragHandle.innerHTML = '⋮⋮'; // Simple icon for grip
      dragHandle.style.cursor = 'grab';
      dragHandle.style.padding = '4px';
      dragHandle.style.color = '#ccc';
      dragHandle.style.userSelect = 'none';

      // Add handle to block element so DragDropManager can find the parent
      // Note: we assign the original block instance element's parent property for reference later
      block.wrapperElement = wrapper;

      wrapper.appendChild(dragHandle);

      // Flex the block element to take remaining space
      block.element.style.flex = '1';
      wrapper.appendChild(block.element);

      this.container.appendChild(wrapper);
    });
  }

  appendBlock(blockObj) {
    this.container.appendChild(blockObj.element);
  }
}
