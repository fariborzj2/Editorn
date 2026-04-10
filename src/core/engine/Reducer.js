import { TransactionTypes } from './Transaction.js';
import { SelectionModel } from './SelectionModel.js';
import { generateId } from '../../utils/IdGenerator.js';

export function reducer(state, transaction) {
  const newState = state.clone();

  switch (transaction.type) {
    case TransactionTypes.SET_SELECTION: {
      newState.selection = transaction.payload;
      return newState;
    }
    case TransactionTypes.INSERT_TEXT: {
      const range = SelectionModel.normalize(newState);
      if (!range) return newState;

      let nextState = newState;
      if (!range.isCollapsed) {
        nextState = deleteRange(nextState, range);
      }

      const newRange = SelectionModel.normalize(nextState);
      const blockIndex = nextState.blocks.findIndex(b => b.id === newRange.startBlockId);
      if (blockIndex === -1) return nextState;

      const block = nextState.blocks[blockIndex];
      if (block.type !== 'code' && block.type !== 'paragraph' && block.type !== 'header') {
        // If not a text block, we can't insert text directly, this is a simplification
        return nextState;
      }

      const text = block.data.text || '';

      // We assume plain text offsets match the raw html string for this conceptual prototype.
      // A robust engine requires an HTML-aware offset mapping or using DocumentFragment.
      const newText = text.slice(0, newRange.startOffset) + transaction.payload.text + text.slice(newRange.startOffset);

      nextState.blocks[blockIndex].data.text = newText;
      const newOffset = newRange.startOffset + transaction.payload.text.length;
      nextState.selection = {
        anchorBlock: block.id, anchorOffset: newOffset,
        focusBlock: block.id, focusOffset: newOffset
      };

      return nextState;
    }
    case TransactionTypes.DELETE_RANGE: {
      const range = SelectionModel.normalize(newState);
      if (!range) return newState;

      if (range.isCollapsed && transaction.payload.direction === 'backward') {
        // Handle backspace when collapsed
        if (range.startOffset > 0) {
           const blockIndex = newState.blocks.findIndex(b => b.id === range.startBlockId);
           const block = newState.blocks[blockIndex];
           const text = block.data.text || '';
           newState.blocks[blockIndex].data.text = text.slice(0, range.startOffset - 1) + text.slice(range.startOffset);
           newState.selection = {
               anchorBlock: block.id, anchorOffset: range.startOffset - 1,
               focusBlock: block.id, focusOffset: range.startOffset - 1
           };
           return newState;
        } else {
           // Offset is 0, merge with previous block
           const blockIndex = newState.blocks.findIndex(b => b.id === range.startBlockId);
           if (blockIndex > 0) {
               const prevBlock = newState.blocks[blockIndex - 1];
               const currentBlock = newState.blocks[blockIndex];

               // Complex block isolation: if prev or current is code/image, don't merge, just delete if empty
               if (prevBlock.type === 'code' || currentBlock.type === 'code') {
                   // if current is empty paragraph, just delete it
                   if (currentBlock.type === 'paragraph' && (currentBlock.data.text || '') === '') {
                       newState.blocks.splice(blockIndex, 1);
                       newState.selection = {
                           anchorBlock: prevBlock.id, anchorOffset: (prevBlock.data.text || '').length,
                           focusBlock: prevBlock.id, focusOffset: (prevBlock.data.text || '').length
                       };
                   }
                   return ensureInvariant(newState);
               }

               const prevText = prevBlock.data.text || '';
               const currentText = currentBlock.data.text || '';

               newState.blocks[blockIndex - 1].data.text = prevText + currentText;
               newState.blocks.splice(blockIndex, 1);

               newState.selection = {
                   anchorBlock: prevBlock.id, anchorOffset: prevText.length,
                   focusBlock: prevBlock.id, focusOffset: prevText.length
               };
               return newState;
           }
           return newState;
        }
      } else if (!range.isCollapsed) {
        return deleteRange(newState, range);
      }
      return newState;
    }
    case TransactionTypes.SPLIT_BLOCK: {
        const range = SelectionModel.normalize(newState);
        if (!range) return newState;

        let nextState = newState;
        if (!range.isCollapsed) {
          nextState = deleteRange(nextState, range);
        }

        const newRange = SelectionModel.normalize(nextState);
        const blockIndex = nextState.blocks.findIndex(b => b.id === newRange.startBlockId);
        const block = nextState.blocks[blockIndex];

        if (block.type === 'code') {
           // Newline inside code
           const text = block.data.code || '';
           block.data.code = text.slice(0, newRange.startOffset) + '\n' + text.slice(newRange.startOffset);
           const newOffset = newRange.startOffset + 1;
           nextState.selection = {
               anchorBlock: block.id, anchorOffset: newOffset,
               focusBlock: block.id, focusOffset: newOffset
           };
           return nextState;
        }

        const text = block.data.text || '';
        const beforeText = text.slice(0, newRange.startOffset);
        const afterText = text.slice(newRange.startOffset);

        nextState.blocks[blockIndex].data.text = beforeText;

        const newBlock = {
            id: generateId(),
            type: 'paragraph',
            data: { text: afterText }
        };

        nextState.blocks.splice(blockIndex + 1, 0, newBlock);
        nextState.selection = {
            anchorBlock: newBlock.id, anchorOffset: 0,
            focusBlock: newBlock.id, focusOffset: 0
        };
        return nextState;
    }
    case TransactionTypes.REPLACE_BLOCK: {
        const blockIndex = newState.blocks.findIndex(b => b.id === transaction.payload.blockId);
        if (blockIndex === -1) return newState;
        newState.blocks[blockIndex] = {
            id: generateId(),
            type: transaction.payload.newType,
            data: transaction.payload.newData
        };
        // Reset selection to the start of new block
        newState.selection = {
            anchorBlock: newState.blocks[blockIndex].id, anchorOffset: 0,
            focusBlock: newState.blocks[blockIndex].id, focusOffset: 0
        };
        return newState;
    }
    default:
      return newState;
  }
}

function deleteRange(state, range) {
    const startIndex = state.blocks.findIndex(b => b.id === range.startBlockId);
    const endIndex = state.blocks.findIndex(b => b.id === range.endBlockId);

    if (startIndex === -1 || endIndex === -1) return state;

    if (startIndex === endIndex) {
        const block = state.blocks[startIndex];
        if (block.type === 'code') {
            const text = block.data.code || '';
            block.data.code = text.slice(0, range.startOffset) + text.slice(range.endOffset);
        } else {
            const text = block.data.text || '';
            block.data.text = text.slice(0, range.startOffset) + text.slice(range.endOffset);
        }
        state.selection = {
            anchorBlock: block.id, anchorOffset: range.startOffset,
            focusBlock: block.id, focusOffset: range.startOffset
        };
        return ensureInvariant(state);
    }

    // Cross-block delete
    const startB = state.blocks[startIndex];
    const endB = state.blocks[endIndex];

    // Check for complex blocks in selection. If code block is involved, we treat it carefully
    let newText = '';
    if (startB.type !== 'code') {
        newText += (startB.data.text || '').slice(0, range.startOffset);
    }
    if (endB.type !== 'code') {
        newText += (endB.data.text || '').slice(range.endOffset);
    }

    // Convert first block to paragraph with merged text, or update if it's already a paragraph
    state.blocks[startIndex] = {
        id: startB.id,
        type: 'paragraph',
        data: { text: newText }
    };

    // Remove intermediate blocks and end block
    state.blocks.splice(startIndex + 1, endIndex - startIndex);

    state.selection = {
        anchorBlock: startB.id, anchorOffset: range.startOffset,
        focusBlock: startB.id, focusOffset: range.startOffset
    };

    return ensureInvariant(state);
}

function ensureInvariant(state) {
    if (state.blocks.length === 0) {
        const newBlockId = generateId();
        state.blocks.push({ id: newBlockId, type: 'paragraph', data: { text: '' } });
        state.selection = { anchorBlock: newBlockId, anchorOffset: 0, focusBlock: newBlockId, focusOffset: 0 };
    }
    return state;
}
