import { BaseInlineTool } from './BaseInlineTool.js';

export class ItalicTool extends BaseInlineTool {
  getIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>`;
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
