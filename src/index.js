import { GlobalRegistry } from './core/Registry.js';
import { ExtensionContext } from './core/ExtensionContext.js';
import { ToolbarParser } from './utils/ToolbarParser.js';
import { EditorCore } from './core/EditorCore.js';

// Pre-registering standard extensions to keep things simple for end users
import { Paragraph } from './blocks/Paragraph.js';
import { Header } from './blocks/Header.js';
import { List } from './blocks/List.js';
import { Quote } from './blocks/Quote.js';
import { Divider } from './blocks/Divider.js';
import { Image } from './blocks/Image.js';
import { Embed } from './blocks/Embed.js';
import { Table } from './blocks/Table.js';
import { Code } from './blocks/Code.js';

import { InlineToolbar } from './plugins/InlineToolbar.js';
import { FixedToolbar } from './plugins/FixedToolbar.js';
import { SlashMenu } from './plugins/SlashMenu.js';
import { BoldTool } from './plugins/inline-tools/BoldTool.js';
import { ItalicTool } from './plugins/inline-tools/ItalicTool.js';
import { UnderlineTool } from './plugins/inline-tools/UnderlineTool.js';
import { LinkTool } from './plugins/inline-tools/LinkTool.js';

GlobalRegistry.register('paragraph', Paragraph, { type: 'block' });
GlobalRegistry.register('header', Header, { type: 'block' });
GlobalRegistry.register('list', List, { type: 'block' });
GlobalRegistry.register('quote', Quote, { type: 'block' });
GlobalRegistry.register('divider', Divider, { type: 'block' });
GlobalRegistry.register('image', Image, { type: 'block' });
GlobalRegistry.register('embed', Embed, { type: 'block' });
GlobalRegistry.register('table', Table, { type: 'block' });
GlobalRegistry.register('code', Code, { type: 'block' });

GlobalRegistry.register('inline-toolbar', InlineToolbar, { type: 'plugin' });
GlobalRegistry.register('fixed-toolbar', FixedToolbar, { type: 'plugin' });
GlobalRegistry.register('slash-menu', SlashMenu, { type: 'plugin' });

GlobalRegistry.register('bold', BoldTool, { type: 'tool' });
GlobalRegistry.register('italic', ItalicTool, { type: 'tool' });
GlobalRegistry.register('underline', UnderlineTool, { type: 'tool' });
GlobalRegistry.register('link', LinkTool, { type: 'tool' });

export default class Editorn {
  /**
   * Register a new global extension.
   * @param {string} name
   * @param {Class | Function} implementation
   * @param {Object} metadata
   */
  static register(name, implementation, metadata) {
    GlobalRegistry.register(name, implementation, metadata);
  }

  /**
   * Main bootstrapper.
   * @param {Object} config
   */
  static async init(config) {
    const options = config.extensionOptions || {};

    // Auto-parse toolbar and inject into a generic format if specified
    const parsedToolbar = config.toolbar ? ToolbarParser.parse(config.toolbar) : null;

    // We collect all registered tools and blocks
    // without hardcoding the specific plugin names in the core
    const allRegisteredTools = [];
    const allRegisteredBlocks = [];

    const requestedExtensions = config.plugins || [];
    // To ensure paragraph block is available if we initialize with an empty state
    if (!requestedExtensions.includes('paragraph')) {
        requestedExtensions.push('paragraph');
    }

    const loadOrder = GlobalRegistry.resolveLoadOrder(requestedExtensions);

    for (const name of loadOrder) {
       const extData = GlobalRegistry.extensions.get(name);
       if (extData) {
          if (extData.type === 'tool') allRegisteredTools.push(extData.implementation);
          if (extData.type === 'block') allRegisteredBlocks.push(name);
       }
    }

    const elements = typeof config.selector === 'string'
      ? document.querySelectorAll(config.selector)
      : [config.selector];

    const instances = [];

    for (const el of elements) {
      if (!el) continue;

      if (config.height) el.style.minHeight = typeof config.height === 'number' ? `${config.height}px` : config.height;

      const editorCore = new EditorCore(el, { data: config.data, onChange: config.onChange });
      const context = new ExtensionContext(editorCore);

      // Pass context to BlockManager so blocks can use the secure context
      editorCore.blockManager.setContext(context);

      const activeInstances = [];

      for (const name of loadOrder) {
        const extData = GlobalRegistry.extensions.get(name);
        if (!extData) continue;

        const implementation = extData.implementation;

        let pluginConfig = options[name] || {};

        // Inject global generic config that plugins might need (layout, tools, blocks)
        pluginConfig.layout = pluginConfig.layout || parsedToolbar;
        pluginConfig.tools = pluginConfig.tools || allRegisteredTools;
        pluginConfig.blocks = pluginConfig.blocks || allRegisteredBlocks;

        if (extData.type === 'block') {
           // Provide the class to BlockManager
           editorCore.blockManager.register(name, implementation);
           continue; // Block instances are managed by BlockManager, not initialized here
        }

        let instance;
        // Inject the secure context to the plugin/tool
        // Provide an object that looks like the old `{ api, config }` signature but
        // uses the `context.api` bridge to avoid sending the raw EditorCore
        const injectedContext = Object.assign(Object.create(context), {
           api: context.api,
           config: pluginConfig
        });

        instance = new implementation(injectedContext, pluginConfig);

        if (extData.type === 'plugin') {
           // we only ADD the instance to the pluginManager so that it doesn't double init
           editorCore.pluginManager.addInstance(name, instance);
        }

        activeInstances.push(instance);

        if (typeof instance.init === 'function') {
          await instance.init();
        }
      }

      // Initial data render happens AFTER blocks are registered
      editorCore.renderInitialData();

      for (const instance of activeInstances) {
        if (typeof instance.mount === 'function') {
          await instance.mount();
        }
      }

      editorCore._activeExtensions = activeInstances;

      if (typeof config.onReady === 'function') {
        config.onReady(editorCore);
      }

      instances.push(editorCore);
    }

    return instances.length === 1 ? instances[0] : instances;
  }
}
