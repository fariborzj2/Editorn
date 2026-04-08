import { BaseInlineTool } from './BaseInlineTool.js';

export class BoldTool extends BaseInlineTool {
  getIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8"></path><path d="M15 20a4 4 0 0 0 0-8H6v8Z"></path></svg>`;
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
