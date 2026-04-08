import { EditorCore } from './core/EditorCore.js';
import { PluginManager } from './core/PluginManager.js';
import { InlineToolbar } from './plugins/InlineToolbar.js';
import { BoldTool } from './plugins/inline-tools/BoldTool.js';
import { ItalicTool } from './plugins/inline-tools/ItalicTool.js';
import { UnderlineTool } from './plugins/inline-tools/UnderlineTool.js';
import { LinkTool } from './plugins/inline-tools/LinkTool.js';

// Export the core and tools for global usage (e.g., in a browser environment)
window.Editorn = EditorCore;
window.EditornPlugins = {
    InlineToolbar,
    BoldTool,
    ItalicTool,
    UnderlineTool,
    LinkTool
};

export default EditorCore;
