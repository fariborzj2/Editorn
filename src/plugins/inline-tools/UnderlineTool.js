import { BaseInlineTool } from './BaseInlineTool.js';
import { Underline } from 'lucide';
import { renderLucideIcon } from '../../utils/iconUtils.js';

export class UnderlineTool extends BaseInlineTool {
  getIcon() {
    return renderLucideIcon(Underline);
  }

  getTitle() {
    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
    return i18n.t('toolbar.underline', 'Underline');
  }

  isActiveOnNode(node) {
    return node.nodeName === 'U' || node.style.textDecoration === 'underline';
  }

  createWrapper() {
    return document.createElement('u');
  }
}
