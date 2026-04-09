export class BaseExtension {
  /**
   * @param {import('./ExtensionContext.js').ExtensionContext} context
   * @param {Object} options Configuration options for this extension
   */
  constructor(context, options = {}) {
    this.context = context;
    this.options = options;

    // For backward compatibility with existing blocks/tools
    this.api = context.api || context;
    this.config = options;
  }

  /**
   * Initialize extension. Called before mounting. No DOM rendering yet.
   */
  async init() {}

  /**
   * Mount the extension to the UI.
   */
  async mount() {}

  /**
   * Update configuration dynamically.
   * @param {Object} newOptions
   */
  update(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.config = this.options;
  }

  /**
   * Cleanup when extension is destroyed.
   */
  destroy() {}
}
