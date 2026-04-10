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
      const [bIdx, cIdx] = newRange.start.path;

      const block = nextState.doc.children[bIdx];
      if (!block || !block.children) return nextState;

      // Ensure cIdx is valid, default to 0 if empty
      const childIdx = cIdx !== undefined ? cIdx : 0;

      if (!block.children[childIdx]) {
          block.children[childIdx] = { type: 'text', text: '', marks: [] };
      }

      const textNode = block.children[childIdx];
      const offset = newRange.start.offset;

      textNode.text = textNode.text.slice(0, offset) + transaction.payload.text + textNode.text.slice(offset);

      const newOffset = offset + transaction.payload.text.length;
      nextState.selection = {
          anchor: { path: [bIdx, childIdx], offset: newOffset },
          focus: { path: [bIdx, childIdx], offset: newOffset }
      };

      return nextState;
    }
    case TransactionTypes.DELETE_RANGE: {
      const range = SelectionModel.normalize(newState);
      if (!range) return newState;

      if (range.isCollapsed && transaction.payload.direction === 'backward') {
        const [bIdx, cIdx] = range.start.path;
        if (range.start.offset > 0) {
            // Delete within current text node
            const block = newState.doc.children[bIdx];
            const textNode = block.children[cIdx];
            textNode.text = textNode.text.slice(0, range.start.offset - 1) + textNode.text.slice(range.start.offset);

            newState.selection = {
                anchor: { path: [bIdx, cIdx], offset: range.start.offset - 1 },
                focus: { path: [bIdx, cIdx], offset: range.start.offset - 1 }
            };
            return normalizeTree(newState);
        } else {
            // Offset is 0
            if (cIdx > 0) {
                // Delete previous text node's last character or merge
                const block = newState.doc.children[bIdx];
                const prevNode = block.children[cIdx - 1];
                if (prevNode.text.length > 0) {
                    prevNode.text = prevNode.text.slice(0, -1);
                    newState.selection = {
                        anchor: { path: [bIdx, cIdx - 1], offset: prevNode.text.length },
                        focus: { path: [bIdx, cIdx - 1], offset: prevNode.text.length }
                    };
                }
                return normalizeTree(newState);
            } else if (bIdx > 0) {
                // Merge with previous block
                const prevBlock = newState.doc.children[bIdx - 1];
                const currentBlock = newState.doc.children[bIdx];

                if (prevBlock.type === 'code' || currentBlock.type === 'code') {
                    // Don't merge code blocks, just delete current if empty
                    if (currentBlock.children.length === 1 && currentBlock.children[0].text === '') {
                        newState.doc.children.splice(bIdx, 1);
                        const lastChildIdx = prevBlock.children.length - 1;
                        newState.selection = {
                            anchor: { path: [bIdx - 1, lastChildIdx], offset: prevBlock.children[lastChildIdx].text.length },
                            focus: { path: [bIdx - 1, lastChildIdx], offset: prevBlock.children[lastChildIdx].text.length }
                        };
                    }
                    return ensureInvariant(newState);
                }

                const prevLastChildIdx = prevBlock.children.length - 1;
                const prevLastChildLen = prevBlock.children[prevLastChildIdx].text.length;

                // Append children
                prevBlock.children.push(...currentBlock.children);
                newState.doc.children.splice(bIdx, 1);

                newState.selection = {
                    anchor: { path: [bIdx - 1, prevLastChildIdx + 1], offset: 0 },
                    focus: { path: [bIdx - 1, prevLastChildIdx + 1], offset: 0 }
                };

                return normalizeTree(newState);
            }
        }
      } else if (!range.isCollapsed) {
          return normalizeTree(deleteRange(newState, range));
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
        const [bIdx, cIdx] = newRange.start.path;
        const offset = newRange.start.offset;

        const block = nextState.doc.children[bIdx];

        if (block.type === 'code') {
           const textNode = block.children[cIdx];
           textNode.text = textNode.text.slice(0, offset) + '\n' + textNode.text.slice(offset);
           nextState.selection = {
               anchor: { path: [bIdx, cIdx], offset: offset + 1 },
               focus: { path: [bIdx, cIdx], offset: offset + 1 }
           };
           return nextState;
        }

        const textNode = block.children[cIdx];

        // Split text node
        const beforeText = textNode.text.slice(0, offset);
        const afterText = textNode.text.slice(offset);

        textNode.text = beforeText;

        // Create new text node for the rest
        const newChildNode = { type: 'text', text: afterText, marks: [...(textNode.marks || [])] };

        // Children to move to new block
        const childrenToMove = [newChildNode, ...block.children.slice(cIdx + 1)];
        block.children = block.children.slice(0, cIdx + 1);

        const newBlock = {
            id: generateId(),
            type: 'paragraph',
            children: childrenToMove.length ? childrenToMove : [{ type: 'text', text: '', marks: [] }]
        };

        nextState.doc.children.splice(bIdx + 1, 0, newBlock);

        nextState.selection = {
            anchor: { path: [bIdx + 1, 0], offset: 0 },
            focus: { path: [bIdx + 1, 0], offset: 0 }
        };

        return normalizeTree(nextState);
    }
    case 'WRAP_MARK': {
        // Implement wrap mark on selection
        const range = SelectionModel.normalize(newState);
        if (!range || range.isCollapsed) return newState;

        const mark = transaction.payload.mark;

        // A full implementation requires splitting text nodes exactly at the boundaries,
        // applying marks to the interior nodes, and merging.
        // For this architecture proof, we apply to the whole text nodes in range.
        const [startB, startC] = range.start.path;
        const [endB, endC] = range.end.path;

        for (let b = startB; b <= endB; b++) {
            const block = newState.doc.children[b];
            if (block.type === 'code') continue; // Schema validation: no inline marks in code

            const startChild = (b === startB) ? startC : 0;
            const endChild = (b === endB) ? endC : block.children.length - 1;

            for (let c = startChild; c <= endChild; c++) {
                const node = block.children[c];
                if (!node.marks.includes(mark)) {
                    node.marks.push(mark);
                }
            }
        }
        return normalizeTree(newState);
    }
    default:
      return newState;
  }
}

function deleteRange(state, range) {
    const [startB, startC] = range.start.path;
    const [endB, endC] = range.end.path;

    if (startB === endB) {
        const block = state.doc.children[startB];
        if (startC === endC) {
            const node = block.children[startC];
            node.text = node.text.slice(0, range.start.offset) + node.text.slice(range.end.offset);
        } else {
            const sNode = block.children[startC];
            const eNode = block.children[endC];
            sNode.text = sNode.text.slice(0, range.start.offset);
            eNode.text = eNode.text.slice(range.end.offset);
            // remove nodes in between
            block.children.splice(startC + 1, endC - startC - 1);
        }
    } else {
        // Cross block delete
        const sBlock = state.doc.children[startB];
        const eBlock = state.doc.children[endB];

        const sNode = sBlock.children[startC];
        sNode.text = sNode.text.slice(0, range.start.offset);
        sBlock.children.splice(startC + 1); // remove rest

        const eNode = eBlock.children[endC];
        eNode.text = eNode.text.slice(range.end.offset);
        eBlock.children.splice(0, endC); // remove preceding

        // Merge remaining end children into start block (if not code)
        if (sBlock.type !== 'code' && eBlock.type !== 'code') {
            sBlock.children.push(...eBlock.children);
        }

        // Remove blocks in between and endBlock
        state.doc.children.splice(startB + 1, endB - startB);
    }

    state.selection = {
        anchor: { path: [startB, startC], offset: range.start.offset },
        focus: { path: [startB, startC], offset: range.start.offset }
    };

    return state;
}

function normalizeTree(state) {
    // Merge adjacent text nodes with identical marks, remove empty text nodes
    state.doc.children.forEach(block => {
        if (!block.children) return;
        for (let i = block.children.length - 1; i >= 0; i--) {
            const node = block.children[i];
            // Don't remove the very last empty node if block is completely empty
            if (node.text === '' && block.children.length > 1) {
                block.children.splice(i, 1);
                // We'd need to adjust selection paths here if we remove a node
                // For simplicity in this demo, we assume selection is managed prior to cleanup
            } else if (i > 0) {
                const prev = block.children[i - 1];
                if (JSON.stringify(prev.marks.sort()) === JSON.stringify(node.marks.sort())) {
                    prev.text += node.text;
                    block.children.splice(i, 1);
                }
            }
        }
        if (block.children.length === 0) {
            block.children.push({ type: 'text', text: '', marks: [] });
        }
    });
    return ensureInvariant(state);
}

function ensureInvariant(state) {
    if (state.doc.children.length === 0) {
        state.doc.children.push({
            id: generateId(),
            type: 'paragraph',
            children: [{ type: 'text', text: '', marks: [] }]
        });
        state.selection = { anchor: { path: [0, 0], offset: 0 }, focus: { path: [0, 0], offset: 0 } };
    }
    return state;
}
