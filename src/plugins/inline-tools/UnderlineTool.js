import { BaseInlineTool } from './BaseInlineTool.js';
import { Underline } from 'lucide';
import { renderLucideIcon } from '../../utils/iconUtils.js';

export class UnderlineTool extends BaseInlineTool {
  getIcon() {
    return renderLucideIcon(Underline);
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
