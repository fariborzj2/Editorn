import { Transaction, TransactionTypes } from './Transaction.js';

export class InputPipeline {
  constructor(editorContainer, engine) {
    this.container = editorContainer;
    this.engine = engine;

    this.container.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
    this.container.addEventListener('keydown', this.handleKeydown.bind(this));
  }

  handleBeforeInput(e) {
    e.preventDefault();

    this.syncSelection();

    if (e.inputType === 'insertText' || e.inputType === 'insertReplacementText') {
      const safeText = e.data || '';
      this.engine.dispatch(new Transaction(TransactionTypes.INSERT_TEXT, { text: safeText }));
    } else if (e.inputType === 'insertParagraph') {
      this.engine.dispatch(new Transaction(TransactionTypes.SPLIT_BLOCK));
    } else if (e.inputType === 'deleteContentBackward') {
      this.engine.dispatch(new Transaction(TransactionTypes.DELETE_RANGE, { direction: 'backward' }));
    } else if (e.inputType === 'deleteContentForward') {
      this.engine.dispatch(new Transaction(TransactionTypes.DELETE_RANGE, { direction: 'forward' }));
    } else if (e.inputType === 'formatBold') {
        this.engine.dispatch(new Transaction('WRAP_MARK', { mark: 'bold' }));
    } else if (e.inputType === 'formatItalic') {
        this.engine.dispatch(new Transaction('WRAP_MARK', { mark: 'italic' }));
    }
  }

  handleKeydown(e) {
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
    } else if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        this.syncSelection();
        this.engine.dispatch(new Transaction('WRAP_MARK', { mark: 'bold' }));
    } else if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        this.syncSelection();
        this.engine.dispatch(new Transaction('WRAP_MARK', { mark: 'italic' }));
    } else if (e.ctrlKey || e.metaKey) {
        setTimeout(() => this.syncSelection(), 0);
    }
  }

  syncSelection() {
     const sel = window.getSelection();
     if (!sel.rangeCount) return;

     const getPathInfo = (node, offset) => {
         let current = node;
         // Find nearest node with stable id
         while (current && !current.hasAttribute?.('data-node-id')) {
             current = current.parentElement;
         }
         if (!current) return null;

         const nodeId = current.getAttribute('data-node-id');

         let textOffset = offset;
         if (node.textContent === '\uFEFF') textOffset = 0;

         // If we matched the block wrapper (e.g. empty paragraph) but we need the inline node ID,
         // We might need to map it via DOM mapping logic. For now assume inline nodes have data-node-id.
         return { nodeId, offset: textOffset };
     };

     const anchor = getPathInfo(sel.anchorNode, sel.anchorOffset);
     const focus = getPathInfo(sel.focusNode, sel.focusOffset);

     if (anchor && focus) {
         this.engine.dispatch(new Transaction(TransactionTypes.SET_SELECTION, {
             anchor, focus
         }));
     }
  }
}
