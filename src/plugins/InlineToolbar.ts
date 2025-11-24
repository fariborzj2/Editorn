import { IPlugin } from '../types';
import { Editron } from '../core/Editron';
import { AIAssistant } from './AIAssistant';

export class InlineToolbar implements IPlugin {
  public name: string = 'inline-toolbar';
  private editor: Editron | null = null;
  private toolbar: HTMLElement;
  private isVisible: boolean = false;

  constructor() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('editron-inline-toolbar');
    this.toolbar.style.display = 'none';
    // Content will be rendered in init() when editor (and i18n) is available
    document.body.appendChild(this.toolbar);
  }

  init(editor: Editron): void {
    this.editor = editor;
    this.renderToolbar();

    document.addEventListener('selectionchange', () => {
        this.handleSelectionChange();
    });

    // Also update on mouseup to be sure
    document.addEventListener('mouseup', () => {
        setTimeout(() => this.handleSelectionChange(), 0);
    });

    // Prevent loss of focus when clicking buttons
    this.toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault();
    });

    this.toolbar.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('.toolbar-btn') as HTMLElement;
        if (target) {
            const cmd = target.dataset.cmd;
            if (cmd === 'ai') {
                e.stopPropagation(); // Prevent AI dialog from closing immediately
                this.triggerAI();
            } else if (cmd) {
                document.execCommand(cmd, false);
                this.updatePosition(); // Re-calculate position if needed
            }
        }
    });
  }

  renderToolbar() {
     if (!this.editor) return;
     const t = (k: string) => this.editor!.t(k);

     this.toolbar.innerHTML = `
        <button class="toolbar-btn" data-cmd="bold" aria-label="${t('toolbar.bold')}" title="${t('toolbar.bold')}"><b>B</b></button>
        <button class="toolbar-btn" data-cmd="italic" aria-label="${t('toolbar.italic')}" title="${t('toolbar.italic')}"><i>I</i></button>
        <button class="toolbar-btn" data-cmd="underline" aria-label="${t('toolbar.underline')}" title="${t('toolbar.underline')}"><u>U</u></button>
        <button class="toolbar-btn ce-ai-trigger" data-cmd="ai" aria-label="${t('toolbar.ai_assist')}" title="${t('toolbar.ai_assist')}">✨ AI</button>
    `;
  }

  handleSelectionChange() {
      if (!this.editor) return;

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
          this.hide();
          return;
      }

      const range = selection.getRangeAt(0);
      const text = selection.toString();

      // Check if selection is within editor
      if (!this.editor.holder.contains(range.commonAncestorContainer)) {
          this.hide();
          return;
      }

      // Check if text is selected
      if (text.length === 0) {
          this.hide();
          return;
      }

      this.show(range);
  }

  show(range: Range) {
      this.isVisible = true;
      const rect = range.getBoundingClientRect();

      this.toolbar.style.display = 'flex';

      // Position above the selection
      const toolbarHeight = this.toolbar.offsetHeight || 40; // Approx if not rendered yet
      const top = rect.top + window.scrollY - toolbarHeight - 8;
      const left = rect.left + window.scrollX + (rect.width / 2) - (this.toolbar.offsetWidth / 2);

      this.toolbar.style.top = `${top}px`;
      this.toolbar.style.left = `${left}px`;
  }

  updatePosition() {
      if (this.isVisible) {
          this.handleSelectionChange();
      }
  }

  triggerAI() {
      if (!this.editor) return;
      const aiPlugin = this.editor.pluginManager.get('ai-assistant') as AIAssistant;
      if (aiPlugin) {
          const rect = this.toolbar.getBoundingClientRect();
          aiPlugin.show(rect);
          this.hide(); // Hide toolbar when AI dialog opens
      }
  }

  hide() {
      this.isVisible = false;
      this.toolbar.style.display = 'none';
  }

  destroy() {
      this.toolbar.remove();
  }
}
