export class PluginManager {
  constructor(editor) {
    this.editor = editor;
    this.plugins = new Map();
  }

  /**
   * Register a new plugin
   * @param {string} name - The name of the plugin
   * @param {class} PluginClass - The class of the plugin
   * @param {object} config - Configuration options for the plugin
   */
  register(name, PluginClass, config = {}) {
    if (!PluginClass) {
       console.warn(`PluginClass for ${name} is invalid.`);
       return;
    }
    const pluginInstance = new PluginClass({ api: this.editor, config });
    this.plugins.set(name, pluginInstance);

    // Call init if the plugin has it
    if (typeof pluginInstance.init === 'function') {
      pluginInstance.init();
    }
  }

  /**
   * Get a registered plugin by name
   * @param {string} name
   * @returns {object|undefined}
   */
  get(name) {
    return this.plugins.get(name);
  }

  /**
   * Destroy all plugins
   */
  destroy() {
    this.plugins.forEach(plugin => {
      if (typeof plugin.destroy === 'function') {
        plugin.destroy();
      }
    });
    this.plugins.clear();
  }
}
