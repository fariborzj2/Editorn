export class Renderer {
  constructor(editorContainer) {
    this.container = editorContainer;
  }

  renderBlocks(blocks) {
    this.container.innerHTML = '';
    blocks.forEach(block => {
      this.container.appendChild(block.element);
    });
  }

  appendBlock(blockObj) {
    this.container.appendChild(blockObj.element);
  }
}
