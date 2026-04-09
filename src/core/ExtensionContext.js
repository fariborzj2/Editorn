export class ExtensionContext {
  /**
   *
   * @param {import('./EditorCore.js').EditorCore} editorCore
   */
  constructor(editorCore) {
    this.ui = {
      container: editorCore.container,
    };

    this.model = {
      insertBlock: editorCore.blockManager.insertBlock.bind(editorCore.blockManager),
      removeBlock: editorCore.blockManager.removeBlock.bind(editorCore.blockManager),
      moveBlock: editorCore.blockManager.moveBlock.bind(editorCore.blockManager),
      getBlocks: editorCore.blockManager.getBlocks.bind(editorCore.blockManager),
      // Since selection manager isn't present, we'll keep it simple for now
    };

    // Make `this.api` an alias to `this` instead of the raw `editorCore`
    // However, some legacy plugins directly access `api.container` which expects
    // the raw editorCore or we need to bridge it.
    this.api = {
       container: editorCore.container,
       triggerChange: editorCore.triggerChange.bind(editorCore),
       blockManager: editorCore.blockManager,
       pluginManager: editorCore.pluginManager,
       el: editorCore.el,
       historyManager: editorCore.historyManager,
    };

    // To prevent legacy tools from failing on `this.api = context`
    this.config = {};
  }
}
