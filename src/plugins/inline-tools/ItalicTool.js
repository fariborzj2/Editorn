import { BaseInlineTool } from './BaseInlineTool.js';

export class ItalicTool extends BaseInlineTool {
  getIcon() {
    return `<i>I</i>`; // Minimalist icon
  }

  getTitle() {
    return 'Italic';
  }

  isActiveOnNode(node) {
    return node.nodeName === 'I' || node.nodeName === 'EM' || node.style.fontStyle === 'italic';
  }

  createWrapper() {
    return document.createElement('i');
  }
}
