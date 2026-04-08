import { EditorCore } from './core/EditorCore.js';
import { PluginManager } from './core/PluginManager.js';
import { InlineToolbar } from './plugins/InlineToolbar.js';
import { BoldTool } from './plugins/inline-tools/BoldTool.js';
import { ItalicTool } from './plugins/inline-tools/ItalicTool.js';
import { UnderlineTool } from './plugins/inline-tools/UnderlineTool.js';
import { LinkTool } from './plugins/inline-tools/LinkTool.js';

// Phase 3 Blocks & Plugins
import { Header } from './blocks/Header.js';
import { List } from './blocks/List.js';
import { Quote } from './blocks/Quote.js';
import { Divider } from './blocks/Divider.js';
import { SlashMenu } from './plugins/SlashMenu.js';

// Phase 4 Blocks
import { Image } from './blocks/Image.js';
import { Embed } from './blocks/Embed.js';

// Phase 5 Blocks
import { Table } from './blocks/Table.js';
import { Code } from './blocks/Code.js';

// Export the core and tools for global usage
window.Editorn = EditorCore;
window.EditornPlugins = {
    InlineToolbar,
    BoldTool,
    ItalicTool,
    UnderlineTool,
    LinkTool,
    SlashMenu
};
window.EditornBlocks = {
    Header,
    List,
    Quote,
    Divider,
    Image,
    Embed,
    Table,
    Code
};

export default EditorCore;
