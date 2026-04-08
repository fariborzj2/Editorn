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

        const icons = {
            paragraph: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 4H9.5a5.5 5.5 0 0 0 0 11h2.5V4z"></path><path d="M12 4v16"></path><path d="M16 4v16"></path></svg>',
            header: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16"></path><path d="M4 18V6"></path><path d="M20 18V6"></path></svg>',
            list: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>',
            quote: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path></svg>',
            divider: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>',
            image: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>',
            embed: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>',
            table: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="3" y1="15" x2="21" y2="15"></line><line x1="9" y1="3" x2="9" y2="21"></line><line x1="15" y1="3" x2="15" y2="21"></line></svg>',
            code: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>'
        };

        const blocks = [
            { type: 'paragraph', icon: icons.paragraph, title: 'Paragraph' },
            { type: 'header', icon: icons.header, title: 'Header' },
            { type: 'list', icon: icons.list, title: 'List' },
            { type: 'quote', icon: icons.quote, title: 'Quote' },
            { type: 'divider', icon: icons.divider, title: 'Divider' },
            { type: 'image', icon: icons.image, title: 'Image' },
            { type: 'embed', icon: icons.embed, title: 'Embed' },
            { type: 'table', icon: icons.table, title: 'Table' },
            { type: 'code', icon: icons.code, title: 'Code' }
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
