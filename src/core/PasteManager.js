import { Sanitizer } from '../utils/Sanitizer.js';

export class PasteManager {
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    this.editor.container.addEventListener('paste', (e) => this.handlePaste(e));
  }

  handlePaste(e) {
    // Boilerplate for handling paste events securely
    // TODO: Phase 4 - Implement parsing of pasted HTML/text and converting into appropriate blocks
    // This involves intercepting the paste, using Sanitizer.sanitize(), and updating the BlockManager
    e.preventDefault();

    // Fallback simple implementation for boilerplate: just insert as plain text or basic HTML into current block
    const text = (e.originalEvent || e).clipboardData.getData('text/plain');
    if (text) {
        document.execCommand('insertText', false, text);
    }
  }

  destroy() {
    this.editor.container.removeEventListener('paste', this.handlePaste);
  }
}
