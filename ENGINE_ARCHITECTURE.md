# 🧱 Editor Engine Architecture (Operation-Based Model)

## 1. Full Architecture Redesign Explanation
The editor is transitioning from a fragile `contenteditable` DOM-mutation model to a deterministic, operation-based state machine. The DOM is no longer the source of truth. Instead, it is purely a view layer that reflects the current internal immutable `EditorState`. All user inputs are intercepted by the `InputPipeline`, converted into `Transactions`, and applied to the `EditorState` via a pure, deterministic `Reducer`.

This ensures that bugs like cross-block selection deletion corrupting the DOM, or Code Blocks leaking HTML, become structurally impossible because the state transitions are mathematically defined and the DOM is completely regenerated or patched deterministically from the state.

## 2. Transaction System Design
Every user interaction produces a transaction. A transaction is a plain object describing the intent and the exact payload.

**Transaction Types:**
- `INSERT_TEXT`: `{ type: 'INSERT_TEXT', payload: { text: string } }`
- `DELETE_RANGE`: `{ type: 'DELETE_RANGE', payload: {} }` (infers from current selection)
- `MERGE_BLOCKS`: `{ type: 'MERGE_BLOCKS', payload: { blockId1, blockId2 } }`
- `SPLIT_BLOCK`: `{ type: 'SPLIT_BLOCK', payload: {} }`
- `REPLACE_BLOCK`: `{ type: 'REPLACE_BLOCK', payload: { blockId, newType, newData } }`
- `SET_SELECTION`: `{ type: 'SET_SELECTION', payload: { anchorBlock, anchorOffset, focusBlock, focusOffset } }`

**Rules:**
Transactions are strictly descriptive. They describe *what* happened, not *how* to change the state.

## 3. Reducer Logic Specification
The core engine is driven by a pure `reducer(state, transaction) => newState`.

**State Structure:**
```javascript
{
  blocks: [
    { id: 'b1', type: 'paragraph', data: { text: 'Hello' } },
    { id: 'b2', type: 'code', data: { language: 'js', code: 'console.log()' } }
  ],
  selection: {
    anchorBlock: 'b1', anchorOffset: 5,
    focusBlock: 'b1', focusOffset: 5
  }
}
```

The reducer takes the current `blocks` and `selection`, processes the transaction, and returns completely new `blocks` array and `selection` object. No DOM access is permitted inside the reducer.

## 4. Selection Model Design
Browser selections are mapped to an internal, block-aware selection model:
- `anchorBlock`: ID of the block where the selection starts.
- `anchorOffset`: Text offset within the anchor block.
- `focusBlock`: ID of the block where the selection ends.
- `focusOffset`: Text offset within the focus block.

Before any edit transaction, the selection is normalized into a `Range` (startBlock, startOffset, endBlock, endOffset) where start comes before end in the document order.

## 5. deleteRange Algorithm (Pure Function)
```javascript
function deleteRange(state) {
  const { startBlock, startOffset, endBlock, endOffset } = normalizeSelection(state);

  if (startBlock === endBlock) {
    // Intra-block delete
    const block = state.blocks.find(b => b.id === startBlock);
    const newText = block.data.text.slice(0, startOffset) + block.data.text.slice(endOffset);
    return updateBlock(state, startBlock, { text: newText });
  } else {
    // Cross-block delete
    const startIndex = state.blocks.findIndex(b => b.id === startBlock);
    const endIndex = state.blocks.findIndex(b => b.id === endBlock);

    const startB = state.blocks[startIndex];
    const endB = state.blocks[endIndex];

    // Merge remainder of startBlock and endBlock (if mergeable types like paragraph)
    let newText = (startB.data.text || '').slice(0, startOffset) + (endB.data.text || '').slice(endOffset);

    let newBlocks = [...state.blocks];
    newBlocks[startIndex] = { ...startB, data: { ...startB.data, text: newText } };

    // Remove all blocks strictly between start and end, and the end block
    newBlocks.splice(startIndex + 1, endIndex - startIndex);

    // Invariant: Always at least 1 paragraph
    if (newBlocks.length === 0) {
      newBlocks.push({ id: generateId(), type: 'paragraph', data: { text: '' } });
    }

    return { ...state, blocks: newBlocks, selection: collapsedAt(startBlock, startOffset) };
  }
}
```

## 6. Input Interception Pipeline
All native mutation events are intercepted using an isolated `InputPipeline`.
- `beforeinput`: Captured. `e.preventDefault()` is called for `insertText`, `insertParagraph`, `deleteContentBackward`. These are translated into `INSERT_TEXT`, `SPLIT_BLOCK`, `DELETE_RANGE` transactions.
- `keydown`: Captured for keys like Backspace, Enter, Delete, Arrow keys.
- DOM updates only happen asynchronously after the reducer computes the new state. The view layer (Renderer) calculates a diff and patches the DOM safely.

## 7. Slash Menu State Derivation Model
The Slash Menu is no longer dependent on string matching against DOM text.
It is purely a derived view of the current State.
- **Trigger**: When `state.selection` is collapsed in a `paragraph` block, the engine checks `block.data.text` up to `selection.anchorOffset`.
- If the text ends with a regex match for `/(^|\s)\/([a-zA-Z0-9]*)$/`, the slash menu is active.
- State derivation yields: `slashMenu: { active: true, query: 'h', position: { blockId, offset } }`.
- Closing the menu happens automatically if the regex fails in the new state.

## 8. Invariant Enforcement Rules
1. **Never Empty**: The `blocks` array must never be empty. If a transaction results in 0 blocks, a default empty paragraph is appended.
2. **Code Block Atomic Rule**: Cross-block selections cannot partially select text inside a Code block. If a code block falls within the range, it is treated as a single indivisible unit and completely deleted.
3. **No Direct DOM Manipulation**: Plugins, tools, and blocks cannot call `innerHTML`, `appendChild`, or `execCommand` on the editor container. They dispatch transactions to the Engine.
