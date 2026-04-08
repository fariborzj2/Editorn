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
    e.preventDefault();

    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const plainText = clipboardData.getData('text/plain');

    const currentBlockIndex = this.editor.findActiveBlockIndex();
    if (currentBlockIndex === -1) return;

    const currentBlock = this.editor.blockManager.getBlocks()[currentBlockIndex];
    const isAtStart = this.isCursorAtStart(currentBlock);
    const isAtEnd = this.isCursorAtEnd(currentBlock);
    const isEmpty = currentBlock.element.innerHTML === '<br>' || currentBlock.element.innerHTML.trim() === '';

    let insertIndex = currentBlockIndex;

    // If we are replacing an empty block, we will just delete it later if we inserted new ones
    // Or if we are in the middle, we might need to split. For simplicity, if we have HTML we append after.
    // If it's just text, we insert inline if we can.

    if (htmlData) {
        const sanitizedHtml = Sanitizer.sanitize(htmlData);
        const parsedBlocks = this.parseHtmlToBlocks(sanitizedHtml);

        if (parsedBlocks.length === 0) {
            this.insertInlineText(plainText || sanitizedHtml.replace(/<[^>]+>/g, ''));
            return;
        }

        // If the current block is empty, replace it
        if (isEmpty) {
            this.editor.blockManager.removeBlock(currentBlockIndex);
        } else if (!isAtEnd) {
             // Split the block
             const selection = window.getSelection();
             if (selection.rangeCount > 0) {
                 const range = selection.getRangeAt(0);
                 const postRange = range.cloneRange();
                 postRange.selectNodeContents(currentBlock.element);
                 postRange.setStart(range.endContainer, range.endOffset);

                 const postFragment = postRange.cloneContents();
                 const tempDiv = document.createElement('div');
                 tempDiv.appendChild(postFragment);
                 const textAfter = tempDiv.innerHTML;

                 range.deleteContents();
                 if (textAfter) {
                     this.editor.blockManager.insertBlock('paragraph', { text: textAfter }, currentBlockIndex + 1);
                 }
                 insertIndex = isEmpty ? currentBlockIndex : currentBlockIndex + 1;
             }
        } else {
             insertIndex++;
        }

        parsedBlocks.forEach((blockData, idx) => {
            const addedBlock = this.editor.blockManager.insertBlock(blockData.type, blockData.data, insertIndex + idx);
            // Focus the last added block
            if (idx === parsedBlocks.length - 1 && addedBlock && addedBlock.element) {
               setTimeout(() => {
                   addedBlock.element.focus();
                   const newRange = document.createRange();
                   newRange.selectNodeContents(addedBlock.element);
                   newRange.collapse(false);
                   const sel = window.getSelection();
                   sel.removeAllRanges();
                   sel.addRange(newRange);
               }, 0);
            }
        });

        this.editor.renderer.renderBlocks(this.editor.blockManager.getBlocks());
        this.editor.triggerChange();

    } else if (plainText) {
        // Plain text: just insert it at the cursor
        this.insertInlineText(plainText);
    }
  }

  isCursorAtStart(block) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      const range = selection.getRangeAt(0);
      return range.startOffset === 0 && (range.startContainer === block.element || range.startContainer.parentNode === block.element);
  }

  isCursorAtEnd(block) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      const range = selection.getRangeAt(0);
      const textLen = range.startContainer.textContent.length;
      return range.startOffset === textLen && (range.startContainer === block.element || range.startContainer.parentNode === block.element);
  }

  insertInlineText(text) {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.collapse(false);

      const currentBlockIndex = this.editor.findActiveBlockIndex();
      if (currentBlockIndex !== -1) {
          const currentBlock = this.editor.blockManager.getBlocks()[currentBlockIndex];
          if (currentBlock.instance.data) {
              currentBlock.instance.data.text = currentBlock.element.innerHTML;
          }
          this.editor.triggerChange();
      }
  }

  parseHtmlToBlocks(html) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;

      const blocks = [];
      const children = Array.from(tempDiv.children);

      if (children.length === 0) {
          if (tempDiv.textContent.trim()) {
              blocks.push({ type: 'paragraph', data: { text: tempDiv.innerHTML } });
          }
          return blocks;
      }

      children.forEach(el => {
          const tagName = el.tagName.toLowerCase();

          if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tagName)) {
              blocks.push({
                  type: 'header',
                  data: { level: parseInt(tagName[1], 10), text: el.innerHTML }
              });
          } else if (tagName === 'ul') {
              const items = Array.from(el.querySelectorAll('li')).map(li => li.innerHTML);
              blocks.push({ type: 'list', data: { style: 'unordered', items } });
          } else if (tagName === 'ol') {
              const items = Array.from(el.querySelectorAll('li')).map(li => li.innerHTML);
              blocks.push({ type: 'list', data: { style: 'ordered', items } });
          } else if (tagName === 'blockquote') {
              blocks.push({ type: 'quote', data: { text: el.innerHTML, caption: '' } });
          } else if (tagName === 'hr') {
              blocks.push({ type: 'divider', data: {} });
          } else if (tagName === 'img') {
              blocks.push({ type: 'image', data: { url: el.src, caption: el.alt || '' } });
          } else if (tagName === 'p' || el.textContent.trim()) {
              blocks.push({ type: 'paragraph', data: { text: el.innerHTML } });
          }
      });

      return blocks;
  }

  destroy() {
    this.editor.container.removeEventListener('paste', this.handlePaste);
  }
}
