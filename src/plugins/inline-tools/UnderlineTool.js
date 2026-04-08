import { BaseInlineTool } from './BaseInlineTool.js';

export class UnderlineTool extends BaseInlineTool {
  getIcon() {
    return `<u>U</u>`; // Minimalist icon
  }

  getTitle() {
    return 'Underline';
  }

  isActiveOnNode(node) {
    return node.nodeName === 'U' || node.style.textDecoration === 'underline';
  }

  createWrapper() {
    return document.createElement('u');
  }
}
