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
        this.registerInlineTools();
        this.registerBlockTools();
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
        const wrapper = this.api.container.parentElement;
        wrapper.insertBefore(this.toolbarElement, this.api.container);
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
        // Read from config.blocks (array of strings, e.g. ['paragraph', 'header', 'list']), default to all if not provided
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

        const availableBlocks = {
            paragraph: { type: 'paragraph', icon: icons.paragraph, title: 'Paragraph' },
            header: { type: 'header', icon: icons.header, title: 'Header' },
            list: { type: 'list', icon: icons.list, title: 'List' },
            quote: { type: 'quote', icon: icons.quote, title: 'Quote' },
            divider: { type: 'divider', icon: icons.divider, title: 'Divider' },
            image: { type: 'image', icon: icons.image, title: 'Image' },
            embed: { type: 'embed', icon: icons.embed, title: 'Embed' },
            table: { type: 'table', icon: icons.table, title: 'Table' },
            code: { type: 'code', icon: icons.code, title: 'Code' }
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

            // Minimal button styling inline for fallback (can be overwritten by css)
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
            const blocks = this.api.blockManager.getBlocks();
            const blockIndex = blocks.findIndex(b => b.id === blockId);

            if (blockIndex !== -1) {
                // Get content from current block if any
                let content = '';
                if (currentBlockEl.textContent.trim().length > 0) {
                   content = currentBlockEl.innerHTML;
                }

                // Construct appropriate data object based on block type
                let newData = {};
                if (type === 'list') {
                    newData = { style: 'unordered', items: [content] };
                } else {
                    newData = { text: content };
                }

                this.api.blockManager.removeBlock(blockIndex);
                this.api.blockManager.insertBlock(type, newData, blockIndex);
                this.api.renderer.renderBlocks(this.api.blockManager.getBlocks());
            }
        } else {
            // Append a new block
            this.api.blockManager.insertBlock(type);
            this.api.renderer.renderBlocks(this.api.blockManager.getBlocks());
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
