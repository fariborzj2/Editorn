import { BaseInlineTool } from './BaseInlineTool.js';
import { Italic } from 'lucide';
import { renderLucideIcon } from '../../utils/iconUtils.js';

export class ItalicTool extends BaseInlineTool {
  getIcon() {
    return renderLucideIcon(Italic);
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
