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
    document.addEventListener('selectionchange', () => this.handleSelectionChange());
    // Prevent hiding when clicking on toolbar
    this.toolbarElement.addEventListener('mousedown', (e) => e.preventDefault());
  }

  handleSelectionChange() {
    const selection = window.getSelection();

    if (!selection.rangeCount || selection.isCollapsed) {
      this.hide();
      return;
    }

    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;

    // Check if selection is within the editor
    let element = commonAncestor.nodeType === Node.ELEMENT_NODE ? commonAncestor : commonAncestor.parentElement;
    let isInsideEditor = false;

    while (element) {
        if (element === this.api.container) {
            isInsideEditor = true;
            break;
        }
        element = element.parentElement;
    }

    if (!isInsideEditor) {
        this.hide();
        return;
    }

    const rect = range.getBoundingClientRect();
    this.show(rect);
    this.updateToolsState(selection);
  }

  show(rect) {
    // Add scroll offsets
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Calculate position (centered above the selection)
    const toolbarWidth = this.toolbarElement.offsetWidth || 150; // Fallback width if not rendered yet
    const left = rect.left + scrollX + (rect.width / 2) - (toolbarWidth / 2);
    const top = rect.top + scrollY - this.toolbarElement.offsetHeight - 10; // 10px spacing

    this.toolbarElement.style.left = `${left}px`;
    this.toolbarElement.style.top = `${top > 0 ? top : rect.bottom + scrollY + 10}px`; // Flip to bottom if no space on top
    this.toolbarElement.style.display = 'flex';
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
    document.removeEventListener('selectionchange', this.handleSelectionChange);
  }
}
