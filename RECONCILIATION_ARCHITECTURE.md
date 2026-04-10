# ⚛️ Editor Engine Reconciliation & Performance Architecture

## 1. Stable Node Identity System
Every node in the document tree (Block and Inline) MUST possess a persistent, globally unique `id` (UUID). Index-based paths (`[blockIndex, childIndex]`) are strictly forbidden for identity resolution, as they fail during concurrent mutations.

**Node Creation:**
- New nodes generated via `INSERT_TEXT` (splits) or `SPLIT_NODE` are assigned a new UUID.
- `MERGE_NODES` preserves the `id` of the target node (typically the one coming first in the document) and discards the second.
- `EditorState` maintains a flattened `nodeMap` (Map<id, Node>) alongside the tree for `O(1)` lookups.

## 2. Keyed Reconciliation Algorithm
The engine uses a React-like keyed diffing algorithm to compare `previousStateTree` and `nextStateTree`.

**Algorithm:**
1. Traverse children of a Block node.
2. Match nodes by `id`.
3. Detect:
   - **Insertions**: Node `id` in `next` but not `prev`.
   - **Deletions**: Node `id` in `prev` but not `next`.
   - **Updates**: Node `id` exists in both, but `text` or `marks` differ.
   - **Moves**: Node `id` order changed (less relevant for text editors, but handled via sibling index comparisons).

## 3. Minimal DOM Patch Strategy
The `DOMRenderer` maintains a `nodeMap` linking state `id` to the actual DOM Element or TextNode.

- `createNode(stateNode)`: Constructs DOM. Updates internal map.
- `updateNode(domNode, nextState)`: Modifies `nodeValue` or classList without replacing the DOM node.
- `removeNode(domNode)`: Calls `parentNode.removeChild()`. Removes from map.
- `moveNode(domNode, newIndex)`: Uses `insertBefore`.

NO full re-render of `.innerHTML` is allowed.

## 4. Cursor Preservation System
**State Model**: `{ anchor: { nodeId, offset }, focus: { nodeId, offset } }`.
Because `nodeId` is stable, the cursor naturally survives tree restructuring.

**Mapping:**
- State -> DOM: Retrieve `domNode` via `nodeMap.get(nodeId)`. Apply DOM Range using character offsets on the mapped TextNode.
- DOM -> State: Traverse DOM upwards from `Selection.anchorNode` to find the nearest `[data-node-id]`. Calculate text offset.

## 5. Transaction Batching & Transaction Queue
Rapid typing generates hundreds of events per second.
- `TransactionQueue` collects transactions synchronously.
- Transactions are collapsed/merged if possible:
  - Sequence of `INSERT_TEXT` at contiguous offsets merges into a single `INSERT_TEXT` with combined payload.

## 6. Render Scheduling Model
Rendering is decoupled from state updates.
- State updates are synchronous (via the queue).
- Rendering is scheduled via `requestAnimationFrame` (rAF).
- Multiple state updates within one frame result in a single reconciliation pass against the latest state.
- Cursor mapping is deferred until the patch cycle completes, applied synchronously at the end of the rAF callback.

## 7. History Compression
The Undo/Redo stack relies on debouncing.
- Sequential text inserts within a 500ms window (without cursor jumps) are grouped into a single History Patch.
- Structural edits (`SPLIT_NODE`) force a new history boundary.
