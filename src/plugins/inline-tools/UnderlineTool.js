import { BaseInlineTool } from './BaseInlineTool.js';

export class UnderlineTool extends BaseInlineTool {
  getIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v6a6 6 0 0 0 12 0V4"></path><line x1="4" y1="20" x2="20" y2="20"></line></svg>`;
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
