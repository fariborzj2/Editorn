import { IPlugin } from '../types';
import { Editron } from '../core/Editron';
import { AIAssistant } from './AIAssistant';

export class Toolbar implements IPlugin {
  public name: string = 'toolbar';
  private editor: Editron | null = null;
  private toolbar: HTMLElement;

  constructor() {
    this.toolbar = document.createElement('div');
    this.toolbar.classList.add('editron-toolbar');
  }

  init(editor: Editron): void {
    this.editor = editor;
    this.renderToolbar();

    // Insert toolbar at the top of the editor holder
    this.editor.holder.insertBefore(this.toolbar, this.editor.holder.firstChild);

    document.addEventListener('selectionchange', () => {
        this.updateButtonStates();
    });

    this.toolbar.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent loss of focus
    });

    this.toolbar.addEventListener('click', (e) => {
        const target = (e.target as HTMLElement).closest('.toolbar-btn') as HTMLElement;
        if (target) {
            const cmd = target.dataset.cmd;
            const type = target.dataset.type;

            if (cmd === 'ai') {
                this.triggerAI();
            } else if (cmd) {
                document.execCommand(cmd, false);
                this.updateButtonStates();
            } else if (type) {
                this.handleBlockAction(target);
            }
        }
    });
  }

  renderToolbar() {
     if (!this.editor) return;
     const t = (k: string) => this.editor!.t(k);

     // Using simple text/unicode for icons
     this.toolbar.innerHTML = `
        <div class="toolbar-group">
            <button class="toolbar-btn" data-cmd="bold" title="${t('toolbar.bold')}"><b>B</b></button>
            <button class="toolbar-btn" data-cmd="italic" title="${t('toolbar.italic')}"><i>I</i></button>
            <button class="toolbar-btn" data-cmd="underline" title="${t('toolbar.underline')}"><u>U</u></button>
        </div>
        <div class="toolbar-separator"></div>
        <div class="toolbar-group">
            <button class="toolbar-btn" data-type="header" data-level="1" title="${t('slash_menu.heading1')}">H1</button>
            <button class="toolbar-btn" data-type="header" data-level="2" title="${t('slash_menu.heading2')}">H2</button>
            <button class="toolbar-btn" data-type="header" data-level="3" title="${t('slash_menu.heading3')}">H3</button>
            <button class="toolbar-btn" data-type="paragraph" title="${t('slash_menu.paragraph')}">¶</button>
        </div>
        <div class="toolbar-separator"></div>
        <div class="toolbar-group">
            <button class="toolbar-btn" data-type="list" data-style="unordered" title="${t('slash_menu.list_unordered')}">• List</button>
            <button class="toolbar-btn" data-type="list" data-style="ordered" title="${t('slash_menu.list_ordered')}">1. List</button>
            <button class="toolbar-btn" data-type="checklist" title="${t('slash_menu.checklist')}">☑</button>
        </div>
        <div class="toolbar-separator"></div>
        <div class="toolbar-group">
            <button class="toolbar-btn" data-type="quote" title="${t('slash_menu.quote')}">❝</button>
            <button class="toolbar-btn" data-type="code" title="${t('slash_menu.code')}">&lt;/&gt;</button>
            <button class="toolbar-btn" data-type="table" title="${t('slash_menu.table')}">▦</button>
            <button class="toolbar-btn" data-type="divider" title="${t('slash_menu.divider')}">—</button>
        </div>
         <div class="toolbar-separator"></div>
        <div class="toolbar-group">
            <button class="toolbar-btn" data-type="image" title="${t('slash_menu.image')}">🖼</button>
            <button class="toolbar-btn" data-type="video" title="${t('slash_menu.video')}">🎥</button>
        </div>
        <div class="toolbar-separator"></div>
        <div class="toolbar-group">
            <button class="toolbar-btn ce-ai-trigger" data-cmd="ai" title="${t('toolbar.ai_assist')}">✨ AI</button>
        </div>
    `;
  }

  getActiveBlockId(): string | null {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return null;

      const node = selection.anchorNode;
      if (!node) return null;

      const element = node.nodeType === Node.TEXT_NODE ? node.parentElement : (node as HTMLElement);
      const blockWrapper = element?.closest('.ce-block-wrapper') as HTMLElement;

      return blockWrapper ? blockWrapper.dataset.blockId || null : null;
  }

  handleBlockAction(target: HTMLElement) {
      if (!this.editor) return;

      const type = target.dataset.type!;
      const blockId = this.getActiveBlockId();

      // Data attributes for specific blocks
      const level = target.dataset.level ? parseInt(target.dataset.level) : undefined;
      const style = target.dataset.style;

      // Conversion blocks: Replace current block if it exists
      const conversionTypes = ['header', 'paragraph', 'list', 'checklist', 'quote', 'code'];

      if (conversionTypes.includes(type) && blockId) {
          // Keep existing text if possible?
          // For now, we just replace. We might want to migrate content.
          // The slash menu implementation passed empty text.
          // Ideally, we get the current block's content.
          const currentBlock = this.editor.blockManager.getBlockById(blockId);
          let text = '';
          if (currentBlock) {
             // Saving gives us the data structure. Paragraph/Header/Quote usually have 'text'.
             const saved = currentBlock.save();
             text = saved.content.text || '';
             // If converting FROM list, we might lose items.
             // Simplification: just pass the text.
          }

          this.editor.blockManager.replaceBlock(blockId, type, {
              text: text,
              level: level,
              style: style,
              items: [] // Reset list items if converting TO list
          });
      } else {
          // Insertion blocks: Add new block after current one
          this.editor.blockManager.addBlock(type, {}, true, blockId || undefined);
      }
  }

  updateButtonStates() {
      // Update inline style buttons
      const buttons = this.toolbar.querySelectorAll('.toolbar-btn[data-cmd]');
      buttons.forEach(btn => {
          const cmd = (btn as HTMLElement).dataset.cmd;
          if (cmd && cmd !== 'ai') {
              if (document.queryCommandState(cmd)) {
                  btn.classList.add('active');
              } else {
                  btn.classList.remove('active');
              }
          }
      });

      // Optionally highlight the active block type
      // This would require checking the active block's type from BlockManager
  }

  triggerAI() {
      if (!this.editor) return;
      const aiPlugin = this.editor.pluginManager.get('ai-assistant') as AIAssistant;
      if (aiPlugin) {
          const rect = this.toolbar.getBoundingClientRect();
          // Position AI dialog below the toolbar button or center?
          // Let's position it near the selection or center if no selection
          const selection = window.getSelection();
          if (selection && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rangeRect = range.getBoundingClientRect();
               if (rangeRect.width > 0 && rangeRect.height > 0) {
                   aiPlugin.show(rangeRect);
                   return;
               }
          }

          // Fallback to toolbar position
          aiPlugin.show(rect);
      }
  }

  destroy() {
      this.toolbar.remove();
  }
}
