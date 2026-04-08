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
        const toolsGroup = document.createElement('div');
        toolsGroup.classList.add('editorn-toolbar-group');
        toolsGroup.style.display = 'flex';
        toolsGroup.style.gap = '4px';
        toolsGroup.style.borderRight = '1px solid #eee';
        toolsGroup.style.paddingRight = '8px';

        const toolsToLoad = this.config.inlineTools || [];
        toolsToLoad.forEach(ToolClass => {
            const tool = new ToolClass({ api: this.api });
            this.tools.push(tool);
            toolsGroup.appendChild(tool.render());
        });

        this.toolbarElement.appendChild(toolsGroup);
    }

    registerBlockTools() {
        const blocksGroup = document.createElement('div');
        blocksGroup.classList.add('editorn-toolbar-group');
        blocksGroup.style.display = 'flex';
        blocksGroup.style.gap = '4px';

        const blocks = [
            { type: 'paragraph', icon: 'P', title: 'Paragraph' },
            { type: 'header', icon: 'H', title: 'Header' },
            { type: 'list', icon: 'List', title: 'List' },
            { type: 'quote', icon: '"', title: 'Quote' },
            { type: 'divider', icon: '---', title: 'Divider' },
            { type: 'image', icon: 'Img', title: 'Image' },
            { type: 'embed', icon: 'Vid', title: 'Embed' },
            { type: 'table', icon: 'Tab', title: 'Table' },
            { type: 'code', icon: '<>', title: 'Code' }
        ];

        blocks.forEach(block => {
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
        // Find current block
        const currentBlockEl = this.api.selection.getCurrentBlock();
        if (currentBlockEl) {
            const blockId = currentBlockEl.dataset.id;
            // Get content from current block if any
            let content = '';
            if (currentBlockEl.textContent.trim().length > 0) {
               content = currentBlockEl.innerHTML;
            }

            this.api.blockManager.replaceBlock(blockId, type, { text: content });
        } else {
            // Append a new block
            this.api.blockManager.addBlock(type);
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
