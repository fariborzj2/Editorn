import { Transaction, TransactionTypes } from './Transaction.js';

export class InputPipeline {
  constructor(editorContainer, engine) {
    this.container = editorContainer;
    this.engine = engine;

    this.container.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
    this.container.addEventListener('keydown', this.handleKeydown.bind(this));
    // Additional listeners (paste, composition) would be registered here
  }

  handleBeforeInput(e) {
    e.preventDefault();

    this.syncSelection();

    if (e.inputType === 'insertText' || e.inputType === 'insertReplacementText') {
      // Escape HTML entities to prevent XSS
      const safeText = e.data ? e.data.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
      this.engine.dispatch(new Transaction(TransactionTypes.INSERT_TEXT, { text: safeText }));
    } else if (e.inputType === 'insertParagraph') {
      this.engine.dispatch(new Transaction(TransactionTypes.SPLIT_BLOCK));
    } else if (e.inputType === 'deleteContentBackward') {
      this.engine.dispatch(new Transaction(TransactionTypes.DELETE_RANGE, { direction: 'backward' }));
    } else if (e.inputType === 'deleteContentForward') {
      this.engine.dispatch(new Transaction(TransactionTypes.DELETE_RANGE, { direction: 'forward' }));
    }
  }

  handleKeydown(e) {
    // Handling specific keydowns to bypass native behaviors where beforeinput falls short
    if (e.key === 'Backspace') {
      e.preventDefault();
      this.syncSelection();
      this.engine.dispatch(new Transaction(TransactionTypes.DELETE_RANGE, { direction: 'backward' }));
    } else if (e.key === 'Delete') {
      e.preventDefault();
      this.syncSelection();
      this.engine.dispatch(new Transaction(TransactionTypes.DELETE_RANGE, { direction: 'forward' }));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      this.syncSelection();
      this.engine.dispatch(new Transaction(TransactionTypes.SPLIT_BLOCK));
    } else if (e.ctrlKey || e.metaKey) {
        // e.g. Ctrl+A let browser handle selection, then we sync
        setTimeout(() => this.syncSelection(), 0);
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Some browsers don't fire beforeinput reliably for all text
        // E.g., handling regular characters in Code blocks natively
    }
  }

  syncSelection() {
     const sel = window.getSelection();
     if (!sel.rangeCount) return;

     // Find the block ID and offsets by walking the DOM from the native selection
     // This is a simplified mapping. In a full implementation, you map DOM nodes to state block IDs.
     const getBlockInfo = (node, offset) => {
         let current = node;
         while(current && !current.hasAttribute?.('data-block-id')) {
             current = current.parentElement;
         }
         if (!current) return null;

         const blockId = current.getAttribute('data-block-id');

         // Calculate text offset. This is highly simplified.
         let textOffset = 0;
         const walk = document.createTreeWalker(current, NodeFilter.SHOW_TEXT, null, false);
         let tNode;
         while(tNode = walk.nextNode()) {
             if (tNode === node) {
                 textOffset += offset;
                 break;
             }
             textOffset += tNode.textContent.length;
         }
         return { blockId, offset: textOffset };
     };

     const anchor = getBlockInfo(sel.anchorNode, sel.anchorOffset);
     const focus = getBlockInfo(sel.focusNode, sel.focusOffset);

     if (anchor && focus) {
         this.engine.dispatch(new Transaction(TransactionTypes.SET_SELECTION, {
             anchorBlock: anchor.blockId, anchorOffset: anchor.offset,
             focusBlock: focus.blockId, focusOffset: focus.offset
         }));
     }
  }
}
