import { Editron } from './Editron';

export class PasteManager {
  private editor: Editron;

  constructor(editor: Editron) {
    this.editor = editor;
    this.editor.holder.addEventListener('paste', (e) => this.handlePaste(e));
  }

  private handlePaste(e: ClipboardEvent) {
    // Allow default behavior if pasting into an input (e.g. image/video url input)
    if ((e.target as HTMLElement).tagName === 'INPUT') {
        return;
    }

    e.preventDefault();

    const html = e.clipboardData?.getData('text/html');
    const text = e.clipboardData?.getData('text/plain');

    if (html) {
        this.processHTML(html);
    } else if (text) {
        this.processText(text);
    }
  }

  private processText(text: string) {
      // Split by double newline to create paragraphs
      const lines = text.split(/\n\s*\n/);
      lines.forEach(line => {
          if (line.trim()) {
              this.editor.blockManager.addBlock('paragraph', { text: line.trim() });
          }
      });
  }

  private processHTML(html: string) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const nodes = Array.from(doc.body.childNodes);

      nodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const tagName = el.tagName.toLowerCase();

              if (['p', 'div'].includes(tagName)) {
                  if (el.textContent?.trim()) {
                      this.editor.blockManager.addBlock('paragraph', { text: el.innerHTML });
                  }
              } else if (/^h[1-6]$/.test(tagName)) {
                  const level = parseInt(tagName.replace('h', ''));
                  this.editor.blockManager.addBlock('header', { text: el.innerHTML, level });
              } else if (tagName === 'ul' || tagName === 'ol') {
                  const items = Array.from(el.querySelectorAll('li')).map(li => li.innerHTML);
                  this.editor.blockManager.addBlock('list', {
                      style: tagName === 'ol' ? 'ordered' : 'unordered',
                      items
                  });
              } else if (tagName === 'blockquote') {
                  this.editor.blockManager.addBlock('quote', { text: el.innerHTML });
              } else if (tagName === 'img') {
                  const img = el as HTMLImageElement;
                  if (img.src) {
                      this.editor.blockManager.addBlock('image', { url: img.src, caption: img.alt });
                  }
              } else if (tagName === 'pre') {
                  // Code block
                  this.editor.blockManager.addBlock('code', { code: el.textContent || '' });
              } else if (tagName === 'hr') {
                  this.editor.blockManager.addBlock('divider');
              } else if (tagName === 'table') {
                  // Basic table parsing
                  const rows = Array.from(el.querySelectorAll('tr')).map(tr => {
                      return Array.from(tr.querySelectorAll('td, th')).map(td => td.innerHTML);
                  });
                  if (rows.length > 0) {
                      this.editor.blockManager.addBlock('table', { content: rows });
                  }
              } else {
                  // Fallback for unknown blocks, just take text?
                  if (el.textContent?.trim()) {
                      this.editor.blockManager.addBlock('paragraph', { text: el.textContent });
                  }
              }
          } else if (node.nodeType === Node.TEXT_NODE) {
              if (node.textContent?.trim()) {
                  this.editor.blockManager.addBlock('paragraph', { text: node.textContent.trim() });
              }
          }
      });
  }
}
