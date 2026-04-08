import { BaseInlineTool } from './BaseInlineTool.js';

export class BoldTool extends BaseInlineTool {
  getIcon() {
    return `<b>B</b>`; // Minimalist icon
  }

  getTitle() {
    return 'Bold';
  }

  isActiveOnNode(node) {
    return node.nodeName === 'B' || node.nodeName === 'STRONG' || node.style.fontWeight === 'bold';
  }

  createWrapper() {
    return document.createElement('b');
  }
}
