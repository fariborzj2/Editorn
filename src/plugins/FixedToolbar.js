import { Type, Heading, List, Quote, Minus, Image, Video, Table, Code } from 'lucide';
import { renderLucideIcon } from '../utils/iconUtils.js';

export class FixedToolbar {
    constructor({ api, config }) {
        this.api = api;
        this.config = config;
        this.tools = [];
        this.toolbarElement = null;
        this.blockButtons = [];
    }

    init() {
        this.createToolbar();

        if (this.config.layout && Array.isArray(this.config.layout)) {
            this.renderParsedLayout();
        } else {
            // Legacy rendering
            this.registerInlineTools();
            this.registerBlockTools();
        }

        this.bindEvents();
    }

    createToolbar() {
        this.toolbarElement = document.createElement('div');
        this.toolbarElement.classList.add('editorn-fixed-toolbar');
        this.toolbarElement.style.position = 'sticky';
        this.toolbarElement.style.top = '0';
        this.toolbarElement.style.zIndex = '100';
        this.toolbarElement.style.backgroundColor = '#fff';
        this.toolbarElement.style.borderBottom = '1px solid #ddd';
        this.toolbarElement.style.padding = '8px 12px';
        this.toolbarElement.style.display = 'flex';
        this.toolbarElement.style.gap = '8px';
        this.toolbarElement.style.alignItems = 'center';
        this.toolbarElement.style.flexWrap = 'wrap';

        // Insert toolbar before the editor container
        const wrapper = this.api.container ? this.api.container.parentElement : this.api.ui.container.parentElement;
        const container = this.api.container || this.api.ui.container;
        wrapper.insertBefore(this.toolbarElement, container);
    }

    renderParsedLayout() {
        // Find registered tools (e.g. from GlobalRegistry or passed in config)
        // config.tools should contain an array of ToolClasses.
        // But in the new architecture, we want a string lookup.
        // Let's create a map of available tools and blocks.
        const availableInlineTools = {};
        if (this.config.tools) {
            this.config.tools.forEach(ToolClass => {
                // Determine name somehow. If ToolClass has a static property or just rely on global registry?
                // For simplicity, we can guess by constructor name.
                // A better approach is that `this.config.tools` could be a map if passed from bootstrapper.
                // Let's rely on standard names and map them.
                const name = ToolClass.name.toLowerCase().replace('tool', '');
                availableInlineTools[name] = ToolClass;
            });
            // specific mappings
            const toolArray = Array.isArray(this.config.tools) ? this.config.tools : [];
            const bold = toolArray.find(t => t.name === 'BoldTool');
            if (bold) availableInlineTools['bold'] = bold;
            const italic = toolArray.find(t => t.name === 'ItalicTool');
            if (italic) availableInlineTools['italic'] = italic;
            const underline = toolArray.find(t => t.name === 'UnderlineTool');
            if (underline) availableInlineTools['underline'] = underline;
            const link = toolArray.find(t => t.name === 'LinkTool');
            if (link) availableInlineTools['link'] = link;
        }

        const icons = {
            paragraph: renderLucideIcon(Type),
            header: renderLucideIcon(Heading),
            list: renderLucideIcon(List),
            quote: renderLucideIcon(Quote),
            divider: renderLucideIcon(Minus),
            image: renderLucideIcon(Image),
            embed: renderLucideIcon(Video),
            table: renderLucideIcon(Table),
            code: renderLucideIcon(Code)
        };


    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };

        const availableBlocks = {
            paragraph: { type: 'paragraph', icon: icons.paragraph, title: i18n.t('toolbar.paragraph', 'Paragraph') },
            header: { type: 'header', icon: icons.header, title: i18n.t('toolbar.header', 'Header') },
            list: { type: 'list', icon: icons.list, title: i18n.t('toolbar.list', 'List') },
            quote: { type: 'quote', icon: icons.quote, title: i18n.t('toolbar.quote', 'Quote') },
            divider: { type: 'divider', icon: icons.divider, title: i18n.t('toolbar.divider', 'Divider') },
            image: { type: 'image', icon: icons.image, title: i18n.t('toolbar.image', 'Image') },
            embed: { type: 'embed', icon: icons.embed, title: i18n.t('toolbar.embed', 'Embed') },
            table: { type: 'table', icon: icons.table, title: i18n.t('toolbar.table', 'Table') },
            code: { type: 'code', icon: icons.code, title: i18n.t('toolbar.code', 'Code') }
        };


        // Layout is an array of groups, each group is an array of items.
        // Example: [['undo', 'redo'], ['bold', 'italic'], ['link']]
        this.config.layout.forEach((group, index) => {
            const groupEl = document.createElement('div');
            groupEl.classList.add('editorn-toolbar-group');
            groupEl.style.display = 'flex';
            groupEl.style.gap = '4px';

            // Add visual separator after group (except for the last one)
            if (index < this.config.layout.length - 1) {
                groupEl.style.borderRight = '1px solid #eee';
                groupEl.style.paddingRight = '8px';
            }

            group.forEach(itemName => {
                const name = typeof itemName === 'string' ? itemName : itemName.name;

                if (availableInlineTools[name]) {
                    const ToolClass = availableInlineTools[name];
                    const tool = new ToolClass({ api: this.api });
                    this.tools.push(tool);
                    groupEl.appendChild(tool.render());
                } else if (availableBlocks[name]) {
                    const block = availableBlocks[name];
                    const button = document.createElement('button');
                    button.innerHTML = block.icon;
                    button.title = block.title;
                    button.type = 'button';
                    button.classList.add('editorn-toolbar-button');
                    button.dataset.type = block.type;

                    button.style.padding = '4px 8px';
                    button.style.border = '1px solid transparent';
                    button.style.background = 'transparent';
                    button.style.cursor = 'pointer';
                    button.style.borderRadius = '4px';

                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleBlockClick(block.type);
                    });

                    this.blockButtons.push(button);
                    groupEl.appendChild(button);
                }
            });

            this.toolbarElement.appendChild(groupEl);
        });
    }

    registerInlineTools() {
        const toolsToLoad = this.config.tools || this.config.inlineTools || [];

        if (toolsToLoad.length === 0) return;

        const toolsGroup = document.createElement('div');
        toolsGroup.classList.add('editorn-toolbar-group');
        toolsGroup.style.display = 'flex';
        toolsGroup.style.gap = '4px';
        toolsGroup.style.borderRight = '1px solid #eee';
        toolsGroup.style.paddingRight = '8px';

        toolsToLoad.forEach(ToolClass => {
            const tool = new ToolClass({ api: this.api });
            this.tools.push(tool);
            toolsGroup.appendChild(tool.render());
        });

        this.toolbarElement.appendChild(toolsGroup);
    }

    registerBlockTools() {
        const configuredBlocks = this.config.blocks || ['paragraph', 'header', 'list', 'quote', 'divider', 'image', 'embed', 'table', 'code'];

        if (configuredBlocks.length === 0) return;

        const blocksGroup = document.createElement('div');
        blocksGroup.classList.add('editorn-toolbar-group');
        blocksGroup.style.display = 'flex';
        blocksGroup.style.gap = '4px';

        const icons = {
            paragraph: renderLucideIcon(Type),
            header: renderLucideIcon(Heading),
            list: renderLucideIcon(List),
            quote: renderLucideIcon(Quote),
            divider: renderLucideIcon(Minus),
            image: renderLucideIcon(Image),
            embed: renderLucideIcon(Video),
            table: renderLucideIcon(Table),
            code: renderLucideIcon(Code)
        };


    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };

        const availableBlocks = {
            paragraph: { type: 'paragraph', icon: icons.paragraph, title: i18n.t('toolbar.paragraph', 'Paragraph') },
            header: { type: 'header', icon: icons.header, title: i18n.t('toolbar.header', 'Header') },
            list: { type: 'list', icon: icons.list, title: i18n.t('toolbar.list', 'List') },
            quote: { type: 'quote', icon: icons.quote, title: i18n.t('toolbar.quote', 'Quote') },
            divider: { type: 'divider', icon: icons.divider, title: i18n.t('toolbar.divider', 'Divider') },
            image: { type: 'image', icon: icons.image, title: i18n.t('toolbar.image', 'Image') },
            embed: { type: 'embed', icon: icons.embed, title: i18n.t('toolbar.embed', 'Embed') },
            table: { type: 'table', icon: icons.table, title: i18n.t('toolbar.table', 'Table') },
            code: { type: 'code', icon: icons.code, title: i18n.t('toolbar.code', 'Code') }
        };


        configuredBlocks.forEach(blockType => {
            const block = availableBlocks[blockType];
            if (!block) return;

            const button = document.createElement('button');
            button.innerHTML = block.icon;
            button.title = block.title;
            button.type = 'button';
            button.classList.add('editorn-toolbar-button');
            button.dataset.type = block.type;

            button.style.padding = '4px 8px';
            button.style.border = '1px solid transparent';
            button.style.background = 'transparent';
            button.style.cursor = 'pointer';
            button.style.borderRadius = '4px';

            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBlockClick(block.type);
            });

            this.blockButtons.push(button);
            blocksGroup.appendChild(button);
        });

        this.toolbarElement.appendChild(blocksGroup);
    }

    handleBlockClick(type) {
        let blockManager = this.api.blockManager || this.api.model;
        let renderer = this.api.renderer; // Depending on injected context or raw EditorCore

        if (!renderer && this.api.api && this.api.api.renderer) {
           renderer = this.api.api.renderer;
        }

        // Find current block based on selection
        const selection = window.getSelection();
        let currentBlockEl = null;

        if (selection.rangeCount > 0) {
            let node = selection.getRangeAt(0).startContainer;
            while (node && node !== document.body) {
                if (node.classList && node.classList.contains('editorn-block')) {
                    currentBlockEl = node;
                    break;
                }
                node = node.parentNode;
            }
        }

        if (currentBlockEl) {
            const blockId = currentBlockEl.dataset.id;
            const blocks = blockManager.getBlocks();
            const blockIndex = blocks.findIndex(b => b.id === blockId);

            if (blockIndex !== -1) {
                let content = '';
                if (currentBlockEl.textContent.trim().length > 0) {
                   content = currentBlockEl.innerHTML;
                }

                let newData = {};
                if (type === 'list') {
                    newData = { style: 'unordered', items: [content] };
                } else {
                    newData = { text: content };
                }

                blockManager.removeBlock(blockIndex);
                blockManager.insertBlock(type, newData, blockIndex);
                if (renderer) renderer.renderBlocks(blockManager.getBlocks());
            }
        } else {
            blockManager.insertBlock(type);
            if (renderer) renderer.renderBlocks(blockManager.getBlocks());
        }
    }

    bindEvents() {
        this.boundHandleSelectionChange = this.handleSelectionChange.bind(this);
        document.addEventListener('selectionchange', this.boundHandleSelectionChange);
    }

    handleSelectionChange() {
        const selection = window.getSelection();
        this.updateToolsState(selection);
    }

    updateToolsState(selection) {
        this.tools.forEach(tool => {
            if (typeof tool.checkState === 'function') {
                tool.checkState(selection);
            }
        });
    }

    destroy() {
        if (this.toolbarElement && this.toolbarElement.parentNode) {
            this.toolbarElement.parentNode.removeChild(this.toolbarElement);
        }
        if (this.boundHandleSelectionChange) {
            document.removeEventListener('selectionchange', this.boundHandleSelectionChange);
        }
    }
}
