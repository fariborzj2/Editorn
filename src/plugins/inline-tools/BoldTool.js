import { BaseInlineTool } from './BaseInlineTool.js';
import { Bold } from 'lucide';
import { renderLucideIcon } from '../../utils/iconUtils.js';

export class BoldTool extends BaseInlineTool {
  getIcon() {
    return renderLucideIcon(Bold);
  }

  getTitle() {
    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
    return i18n.t('toolbar.bold', 'Bold');
  }

  isActiveOnNode(node) {
    return node.nodeName === 'B' || node.nodeName === 'STRONG' || node.style.fontWeight === 'bold';
  }

  createWrapper() {
    return document.createElement('b');
  }
}
