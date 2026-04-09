import { BaseInlineTool } from './BaseInlineTool.js';
import { Italic } from 'lucide';
import { renderLucideIcon } from '../../utils/iconUtils.js';

export class ItalicTool extends BaseInlineTool {
  getIcon() {
    return renderLucideIcon(Italic);
  }

  getTitle() {
    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
    return i18n.t('toolbar.italic', 'Italic');
  }

  isActiveOnNode(node) {
    return node.nodeName === 'I' || node.nodeName === 'EM' || node.style.fontStyle === 'italic';
  }

  createWrapper() {
    return document.createElement('i');
  }
}
