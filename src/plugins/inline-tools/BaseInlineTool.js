export class BaseInlineTool {
  constructor({ api, config }) {
    this.api = api;
    this.config = config;
    this.button = null;
  }

  /**
   * Return the button element for the toolbar
   */
  render() {
    this.button = document.createElement('button');
    this.button.type = 'button';
    this.button.classList.add('editorn-inline-tool');
    this.button.innerHTML = this.getIcon();
    this.button.title = this.getTitle();

    this.button.addEventListener('click', () => this.surround());
    return this.button;
  }

  /**
   * The icon HTML for the button
   */
  getIcon() {
    return '';
  }

  /**
   * The title for the button
   */
  getTitle() {
    return '';
  }

  /**
   * Check if the tool's state is active on the current selection
   * @param {Selection} selection
   */
  checkState(selection) {
    if (!selection || selection.rangeCount === 0) {
        this.button.classList.remove('active');
        return;
    }
    const range = selection.getRangeAt(0);
    const commonAncestor = range.commonAncestorContainer;

    let element = commonAncestor.nodeType === Node.ELEMENT_NODE ? commonAncestor : commonAncestor.parentElement;

    let isActive = false;
    while (element && this.api.container.contains(element) && element !== this.api.container) {
        if (this.isActiveOnNode(element)) {
            isActive = true;
            break;
        }
        element = element.parentElement;
    }

    if (isActive) {
      this.button.classList.add('active');
    } else {
      this.button.classList.remove('active');
    }
  }

  /**
   * Abstract: check if the given node represents this tool's formatting
   */
  isActiveOnNode(node) {
    return false;
  }

  /**
   * Wrap or unwrap the selection with the tool's formatting
   */
  surround() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    const extractedContent = range.extractContents();

    // Check if we are unwrapping or wrapping. Simplistic approach for boilerplate.
    // In a robust implementation, this needs to handle complex nested nodes.

    // Check if the current selection parent already has the tag
    let element = range.commonAncestorContainer;
    element = element.nodeType === Node.ELEMENT_NODE ? element : element.parentElement;

    let unwrappingNode = null;
    while (element && this.api.container.contains(element) && element !== this.api.container) {
        if (this.isActiveOnNode(element)) {
            unwrappingNode = element;
            break;
        }
        element = element.parentElement;
    }

    if (unwrappingNode) {
       // Unwrap: Extract contents of the unwrapping node and place them before it, then remove the node.
       // This is a simplified unwrap that assumes we unwrap the whole parent node.
       const textNode = document.createTextNode(unwrappingNode.textContent);
       unwrappingNode.parentNode.replaceChild(textNode, unwrappingNode);
    } else {
       // Wrap
       const wrapper = this.createWrapper();
       wrapper.appendChild(extractedContent);
       range.insertNode(wrapper);
    }

    this.api.triggerChange();
    this.checkState(window.getSelection());
  }

  /**
   * Abstract: Create the wrapping element
   */
  createWrapper() {
      return document.createElement('span');
  }
}
