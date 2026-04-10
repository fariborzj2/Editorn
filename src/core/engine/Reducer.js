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
      const textNodeId = newRange.start.nodeId;
      const offset = newRange.start.offset;

      const textNode = nextState.getNode(textNodeId);
      if (!textNode || textNode.type !== 'text') return nextState;

      textNode.text = textNode.text.slice(0, offset) + transaction.payload.text + textNode.text.slice(offset);

      const newOffset = offset + transaction.payload.text.length;
      nextState.selection = {
          anchor: { nodeId: textNodeId, offset: newOffset },
          focus: { nodeId: textNodeId, offset: newOffset }
      };

      return nextState;
    }
    case TransactionTypes.DELETE_RANGE: {
      const range = SelectionModel.normalize(newState);
      if (!range) return newState;

      if (range.isCollapsed && transaction.payload.direction === 'backward') {
        const textNodeId = range.start.nodeId;
        const textNode = newState.getNode(textNodeId);
        if (!textNode) return newState;

        if (range.start.offset > 0) {
            textNode.text = textNode.text.slice(0, range.start.offset - 1) + textNode.text.slice(range.start.offset);
            newState.selection = {
                anchor: { nodeId: textNodeId, offset: range.start.offset - 1 },
                focus: { nodeId: textNodeId, offset: range.start.offset - 1 }
            };
            return normalizeTree(newState);
        } else {
            // Find parent block
            let parentBlock = null;
            let blockIndex = -1;
            for (let i = 0; i < newState.doc.children.length; i++) {
                if (newState.doc.children[i].children.find(c => c.id === textNodeId)) {
                    parentBlock = newState.doc.children[i];
                    blockIndex = i;
                    break;
                }
            }
            if (!parentBlock) return newState;

            const childIndex = parentBlock.children.findIndex(c => c.id === textNodeId);

            if (childIndex > 0) {
                const prevNode = parentBlock.children[childIndex - 1];
                if (prevNode.text.length > 0) {
                    prevNode.text = prevNode.text.slice(0, -1);
                    newState.selection = {
                        anchor: { nodeId: prevNode.id, offset: prevNode.text.length },
                        focus: { nodeId: prevNode.id, offset: prevNode.text.length }
                    };
                }
                return normalizeTree(newState);
            } else if (blockIndex > 0) {
                const prevBlock = newState.doc.children[blockIndex - 1];

                if (prevBlock.type === 'code' || parentBlock.type === 'code') {
                    if (parentBlock.children.length === 1 && parentBlock.children[0].text === '') {
                        newState.doc.children.splice(blockIndex, 1);
                        newState.nodeMap.delete(parentBlock.id);
                        newState.nodeMap.delete(textNodeId);

                        const lastNode = prevBlock.children[prevBlock.children.length - 1];
                        newState.selection = {
                            anchor: { nodeId: lastNode.id, offset: lastNode.text.length },
                            focus: { nodeId: lastNode.id, offset: lastNode.text.length }
                        };
                    }
                    return ensureInvariant(newState);
                }

                const lastNode = prevBlock.children[prevBlock.children.length - 1];
                const newOffset = lastNode.text.length;

                prevBlock.children.push(...parentBlock.children);
                newState.doc.children.splice(blockIndex, 1);
                newState.nodeMap.delete(parentBlock.id);

                // If lastNode is empty, we probably just jump to the next one
                let targetNodeId = lastNode.id;
                let targetOffset = newOffset;
                if (lastNode.text === '' && prevBlock.children.length > 1) {
                    targetNodeId = parentBlock.children[0].id;
                    targetOffset = 0;
                }

                newState.selection = {
                    anchor: { nodeId: targetNodeId, offset: targetOffset },
                    focus: { nodeId: targetNodeId, offset: targetOffset }
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
        const textNodeId = newRange.start.nodeId;
        const offset = newRange.start.offset;

        const textNode = nextState.getNode(textNodeId);

        let parentBlock = null;
        let blockIndex = -1;
        for (let i = 0; i < nextState.doc.children.length; i++) {
            if (nextState.doc.children[i].children.find(c => c.id === textNodeId)) {
                parentBlock = nextState.doc.children[i];
                blockIndex = i;
                break;
            }
        }
        if (!parentBlock) return nextState;
        const childIndex = parentBlock.children.findIndex(c => c.id === textNodeId);

        if (parentBlock.type === 'code') {
           textNode.text = textNode.text.slice(0, offset) + '\n' + textNode.text.slice(offset);
           nextState.selection = {
               anchor: { nodeId: textNodeId, offset: offset + 1 },
               focus: { nodeId: textNodeId, offset: offset + 1 }
           };
           return nextState;
        }

        const beforeText = textNode.text.slice(0, offset);
        const afterText = textNode.text.slice(offset);

        textNode.text = beforeText;

        const newChildNode = { id: generateId(), type: 'text', text: afterText, marks: [...(textNode.marks || [])] };
        nextState.nodeMap.set(newChildNode.id, newChildNode);

        const childrenToMove = [newChildNode, ...parentBlock.children.slice(childIndex + 1)];
        parentBlock.children = parentBlock.children.slice(0, childIndex + 1);

        const emptyNode = { id: generateId(), type: 'text', text: '', marks: [] };
        if (childrenToMove.length === 0) {
            childrenToMove.push(emptyNode);
            nextState.nodeMap.set(emptyNode.id, emptyNode);
        }

        const newBlock = {
            id: generateId(),
            type: 'paragraph',
            children: childrenToMove
        };
        nextState.nodeMap.set(newBlock.id, newBlock);

        nextState.doc.children.splice(blockIndex + 1, 0, newBlock);

        nextState.selection = {
            anchor: { nodeId: childrenToMove[0].id, offset: 0 },
            focus: { nodeId: childrenToMove[0].id, offset: 0 }
        };

        return normalizeTree(nextState);
    }
    case TransactionTypes.REPLACE_BLOCK: {
        const blockId = transaction.payload.blockId;
        const newType = transaction.payload.newType;
        const newData = transaction.payload.newData || {};

        let blockIndex = -1;
        for (let i = 0; i < newState.doc.children.length; i++) {
            if (newState.doc.children[i].id === blockId) {
                blockIndex = i;
                break;
            }
        }
        if (blockIndex === -1) return newState;

        const oldBlock = newState.doc.children[blockIndex];
        // Clean old inline nodes from nodeMap (simplification)

        const emptyTextNode = { id: generateId(), type: 'text', text: '', marks: [] };
        newState.nodeMap.set(emptyTextNode.id, emptyTextNode);

        let newChildren = [emptyTextNode];
        if (newType === 'code') {
           const codeText = { id: generateId(), type: 'text', text: newData.code || '', marks: [] };
           newChildren = [codeText];
           newState.nodeMap.set(codeText.id, codeText);
        } else if (newData.text) {
           const inlineText = { id: generateId(), type: 'text', text: newData.text, marks: [] };
           newChildren = [inlineText];
           newState.nodeMap.set(inlineText.id, inlineText);
        }

        const newBlock = {
            id: generateId(),
            type: newType,
            data: newData,
            children: newChildren
        };
        newState.nodeMap.set(newBlock.id, newBlock);

        newState.doc.children[blockIndex] = newBlock;
        newState.selection = {
            anchor: { nodeId: newChildren[0].id, offset: newChildren[0].text.length },
            focus: { nodeId: newChildren[0].id, offset: newChildren[0].text.length }
        };

        return newState;
    }
    case 'WRAP_MARK': {
        const range = SelectionModel.normalize(newState);
        if (!range || range.isCollapsed) return newState;

        const mark = transaction.payload.mark;

        const startId = range.start.nodeId;
        const endId = range.end.nodeId;

        let sBlockIdx = -1, eBlockIdx = -1;
        let sNodeIdx = -1, eNodeIdx = -1;

        for (let i = 0; i < newState.doc.children.length; i++) {
            const blk = newState.doc.children[i];
            for (let j = 0; j < blk.children.length; j++) {
                if (blk.children[j].id === startId) { sBlockIdx = i; sNodeIdx = j; }
                if (blk.children[j].id === endId) { eBlockIdx = i; eNodeIdx = j; }
            }
        }

        if (sBlockIdx === -1 || eBlockIdx === -1) return newState;

        for (let i = sBlockIdx; i <= eBlockIdx; i++) {
            const block = newState.doc.children[i];
            if (block.type === 'code') continue;

            const startNodeIdx = (i === sBlockIdx) ? sNodeIdx : 0;
            const endNodeIdx = (i === eBlockIdx) ? eNodeIdx : block.children.length - 1;

            for (let j = startNodeIdx; j <= endNodeIdx; j++) {
                const node = block.children[j];

                // For simplicity we just apply marks to the entire node.
                // A true engine splits text nodes exactly at selection boundaries.
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
    const sId = range.start.nodeId;
    const eId = range.end.nodeId;

    // Find blocks containing these nodes
    let sBlockIdx = -1, eBlockIdx = -1;
    let sNodeIdx = -1, eNodeIdx = -1;

    for (let i = 0; i < state.doc.children.length; i++) {
        const blk = state.doc.children[i];
        for (let j = 0; j < blk.children.length; j++) {
            if (blk.children[j].id === sId) { sBlockIdx = i; sNodeIdx = j; }
            if (blk.children[j].id === eId) { eBlockIdx = i; eNodeIdx = j; }
        }
    }

    if (sBlockIdx === -1 || eBlockIdx === -1) return state;

    if (sBlockIdx === eBlockIdx) {
        const block = state.doc.children[sBlockIdx];
        if (sNodeIdx === eNodeIdx) {
            const node = block.children[sNodeIdx];
            node.text = node.text.slice(0, range.start.offset) + node.text.slice(range.end.offset);
        } else {
            const sNode = block.children[sNodeIdx];
            const eNode = block.children[eNodeIdx];
            sNode.text = sNode.text.slice(0, range.start.offset);
            eNode.text = eNode.text.slice(range.end.offset);
            // remove nodes in between
            for(let i = sNodeIdx + 1; i < eNodeIdx; i++) state.nodeMap.delete(block.children[i].id);
            block.children.splice(sNodeIdx + 1, eNodeIdx - sNodeIdx - 1);
        }
    } else {
        const sBlock = state.doc.children[sBlockIdx];
        const eBlock = state.doc.children[eBlockIdx];

        const sNode = sBlock.children[sNodeIdx];
        sNode.text = sNode.text.slice(0, range.start.offset);
        for(let i = sNodeIdx + 1; i < sBlock.children.length; i++) state.nodeMap.delete(sBlock.children[i].id);
        sBlock.children.splice(sNodeIdx + 1);

        const eNode = eBlock.children[eNodeIdx];
        eNode.text = eNode.text.slice(range.end.offset);
        for(let i = 0; i < eNodeIdx; i++) state.nodeMap.delete(eBlock.children[i].id);
        eBlock.children.splice(0, eNodeIdx);

        if (sBlock.type !== 'code' && eBlock.type !== 'code') {
            sBlock.children.push(...eBlock.children);
        }

        for(let i = sBlockIdx + 1; i <= eBlockIdx; i++) {
             const b = state.doc.children[i];
             state.nodeMap.delete(b.id);
             // Note: children IDs are not explicitly deleted from map here for simplicity, but should be for GC
        }
        state.doc.children.splice(sBlockIdx + 1, eBlockIdx - sBlockIdx);
    }

    state.selection = {
        anchor: { nodeId: sId, offset: range.start.offset },
        focus: { nodeId: sId, offset: range.start.offset }
    };

    return state;
}

function normalizeTree(state) {
    state.doc.children.forEach(block => {
        if (!block.children) return;
        for (let i = block.children.length - 1; i >= 0; i--) {
            const node = block.children[i];
            if (node.text === '' && block.children.length > 1) {
                // Remove empty node
                if (state.selection && state.selection.anchor.nodeId === node.id) {
                    // re-map selection to adjacent node before deleting
                    const targetNode = i > 0 ? block.children[i-1] : block.children[i+1];
                    state.selection = {
                        anchor: { nodeId: targetNode.id, offset: targetNode.text.length },
                        focus: { nodeId: targetNode.id, offset: targetNode.text.length }
                    };
                }
                block.children.splice(i, 1);
                state.nodeMap.delete(node.id);
            } else if (i > 0) {
                const prev = block.children[i - 1];
                if (JSON.stringify(prev.marks.sort()) === JSON.stringify(node.marks.sort())) {
                    prev.text += node.text;

                    if (state.selection && state.selection.anchor.nodeId === node.id) {
                         const offset = prev.text.length - node.text.length + state.selection.anchor.offset;
                         state.selection = {
                             anchor: { nodeId: prev.id, offset }, focus: { nodeId: prev.id, offset }
                         };
                    }

                    block.children.splice(i, 1);
                    state.nodeMap.delete(node.id);
                }
            }
        }
        if (block.children.length === 0) {
            const empty = { id: generateId(), type: 'text', text: '', marks: [] };
            block.children.push(empty);
            state.nodeMap.set(empty.id, empty);
        }
    });
    return ensureInvariant(state);
}

function ensureInvariant(state) {
    if (state.doc.children.length === 0) {
        const emptyText = { id: generateId(), type: 'text', text: '', marks: [] };
        const emptyBlock = { id: generateId(), type: 'paragraph', children: [emptyText] };
        state.doc.children.push(emptyBlock);
        state.nodeMap.set(emptyText.id, emptyText);
        state.nodeMap.set(emptyBlock.id, emptyBlock);
        state.selection = { anchor: { nodeId: emptyText.id, offset: 0 }, focus: { nodeId: emptyText.id, offset: 0 } };
    }
    return state;
}
