import { IPlugin } from '../types';
import { Editron } from '../core/Editron';

export class AIAssistant implements IPlugin {
  public name: string = 'ai-assistant';
  private editor: Editron | null = null;
  private dialog: HTMLElement;

  constructor() {
    this.dialog = document.createElement('div');
    this.dialog.classList.add('ce-ai-dialog');
    this.dialog.style.display = 'none';
    this.dialog.innerHTML = `
        <div class="ce-ai-header">✨ AI Assistant</div>
        <div class="ce-ai-options">
            <button data-action="summarize" aria-label="Summarize text">Summarize</button>
            <button data-action="expand" aria-label="Expand text">Expand</button>
            <button data-action="fix" aria-label="Fix grammar">Fix Grammar</button>
            <button data-action="make-funny" aria-label="Make text funny">Make Funny</button>
        </div>
        <div class="ce-ai-loading" style="display:none;">Thinking...</div>
    `;

    this.dialog.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'BUTTON' && target.dataset.action) {
            this.handleAction(target.dataset.action);
        }
    });

    document.body.appendChild(this.dialog);

    // Close on outside click
    document.addEventListener('click', (e) => {
        if (this.dialog.style.display === 'block' &&
            !this.dialog.contains(e.target as Node) &&
            !(e.target as HTMLElement).classList.contains('ce-ai-trigger')) {
            this.close();
        }
    });
  }

  init(editor: Editron): void {
    this.editor = editor;
  }

  public show(rect: DOMRect) {
      this.dialog.style.display = 'block';
      // Position below/near the selection
      this.dialog.style.top = `${rect.bottom + window.scrollY + 10}px`;
      this.dialog.style.left = `${rect.left + window.scrollX}px`;
  }

  public close() {
      this.dialog.style.display = 'none';
      const loading = this.dialog.querySelector('.ce-ai-loading') as HTMLElement;
      const options = this.dialog.querySelector('.ce-ai-options') as HTMLElement;
      if (loading) loading.style.display = 'none';
      if (options) options.style.display = 'flex';
  }

  private handleAction(action: string) {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const text = range.toString();

      if (!text) return;

      // Show loading
      const loading = this.dialog.querySelector('.ce-ai-loading') as HTMLElement;
      const options = this.dialog.querySelector('.ce-ai-options') as HTMLElement;
      loading.style.display = 'block';
      options.style.display = 'none';

      // Simulate API call
      setTimeout(() => {
          const result = this.mockAIProcess(text, action);
          this.applyResult(result);
          this.close();
      }, 1000);
  }

  private mockAIProcess(text: string, action: string): string {
      switch (action) {
          case 'summarize':
              return `[Summary: ${text.substring(0, 20)}...]`;
          case 'expand':
              return `${text} And here is some more AI-generated content expanding on the topic to make it look professional and verbose.`;
          case 'fix':
              return text.charAt(0).toUpperCase() + text.slice(1) + (text.endsWith('.') ? '' : '.');
          case 'make-funny':
              return `${text} (lol!)`;
          default:
              return text;
      }
  }

  private applyResult(result: string) {
      document.execCommand('insertText', false, result);
      // Trigger change event
      if (this.editor) {
          this.editor.emit('change');
          // For granular update, we ideally need identifying info, but change is enough for autosave
      }
  }
}
