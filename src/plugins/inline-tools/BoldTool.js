import { BaseInlineTool } from './BaseInlineTool.js';
import { Bold } from 'lucide';
import { renderLucideIcon } from '../../utils/iconUtils.js';

export class BoldTool extends BaseInlineTool {
  getIcon() {
    return renderLucideIcon(Bold);
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
