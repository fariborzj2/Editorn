export class InlineToolbar {
  constructor({ api, config }) {
    this.api = api;
    this.config = config;
    this.tools = [];
    this.toolbarElement = null;
    this.isVisible = false;
  }

  init() {
    this.createToolbar();
    this.registerTools();
    this.bindEvents();
  }

  createToolbar() {
    this.toolbarElement = document.createElement('div');
    this.toolbarElement.classList.add('editorn-inline-toolbar');
    this.toolbarElement.style.position = 'absolute';
    this.toolbarElement.style.display = 'none';
    this.toolbarElement.style.zIndex = '1000';
    this.toolbarElement.style.backgroundColor = '#fff';
    this.toolbarElement.style.border = '1px solid #ddd';
    this.toolbarElement.style.borderRadius = '4px';
    this.toolbarElement.style.padding = '4px';
    this.toolbarElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';

    document.body.appendChild(this.toolbarElement);
  }

  registerTools() {
    const toolsToLoad = this.config.tools || this.config.inlineTools || [];
    toolsToLoad.forEach(ToolClass => {
        const tool = new ToolClass({ api: this.api });
        this.tools.push(tool);
        this.toolbarElement.appendChild(tool.render());
    });
  }

  bindEvents() {
    this.boundHandleContextMenu = this.handleContextMenu.bind(this);
    this.boundHandleDocumentClick = this.handleDocumentClick.bind(this);

    this.api.container.addEventListener('contextmenu', this.boundHandleContextMenu);
    document.addEventListener('click', this.boundHandleDocumentClick);

    // Prevent hiding when clicking on toolbar itself
    this.toolbarElement.addEventListener('mousedown', (e) => {
        // Only prevent default if it's not a right click inside the toolbar
        if (e.button !== 2) {
            e.preventDefault();
        }
    });
  }

  handleContextMenu(e) {
    e.preventDefault();

    const selection = window.getSelection();

    // We update tools state even if there's no selection (for block-level tools if any, or just to sync state)
    if (selection.rangeCount > 0) {
        this.updateToolsState(selection);
    }

    this.show(e.clientX, e.clientY);
  }

  handleDocumentClick(e) {
    // Hide if clicked outside the toolbar
    if (this.isVisible && !this.toolbarElement.contains(e.target)) {
        this.hide();
    }
  }

  show(clientX, clientY) {
    // Add scroll offsets
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    const left = clientX + scrollX;
    const top = clientY + scrollY;

    // Show first to get dimensions if needed
    this.toolbarElement.style.display = 'flex';

    // Adjust if it goes off screen
    const rect = this.toolbarElement.getBoundingClientRect();
    let finalLeft = left;
    let finalTop = top;

    if (clientX + rect.width > window.innerWidth) {
        finalLeft = left - rect.width;
    }
    if (clientY + rect.height > window.innerHeight) {
        finalTop = top - rect.height;
    }

    this.toolbarElement.style.left = `${finalLeft}px`;
    this.toolbarElement.style.top = `${finalTop}px`;
    this.isVisible = true;
  }

  hide() {
    if (this.isVisible) {
      this.toolbarElement.style.display = 'none';
      this.isVisible = false;
    }
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
    if (this.boundHandleContextMenu) {
        this.api.container.removeEventListener('contextmenu', this.boundHandleContextMenu);
    }
    if (this.boundHandleDocumentClick) {
        document.removeEventListener('click', this.boundHandleDocumentClick);
    }
  }
}
