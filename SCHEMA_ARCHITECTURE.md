# 🧱 Schema-Driven Document Engine Architecture

## 1. Schema Design
The editor enforces a strict schema that validates all operations. Nodes are categorized into Blocks and Inline types.

**Block Nodes**:
- `paragraph`: Standard text block.
- `heading`: Structural block (level 1-6).
- `code`: Atomic block representing source code.
- `list`: Container for `list_item`s.
- `list_item`: Container for inline content or nested lists.
- `blockquote`: Stylistic container for quotes.

**Inline Nodes**:
- `text`: The fundamental inline node. Contains actual string data and metadata.

**Marks (Metadata on Inline Nodes)**:
- `bold`, `italic`, `underline`, `link`

*Schema Rule Example:*
A `paragraph` can only contain `text` children. A `code` block can only contain a single `text` child with no marks.

## 2. Document Tree Model
The document is a nested JSON tree. Flat strings are completely removed.

```json
{
  "type": "doc",
  "children": [
    {
      "type": "paragraph",
      "id": "block_1",
      "children": [
        { "type": "text", "text": "Hello ", "marks": [] },
        { "type": "text", "text": "World", "marks": ["bold"] }
      ]
    },
    {
      "type": "code",
      "id": "block_2",
      "children": [
        { "type": "text", "text": "console.log('test')", "marks": [] }
      ]
    }
  ]
}
```
Every text segment with a unique set of marks is split into its own `text` node. Contiguous text nodes with identical marks are normalized (merged).

## 3. Selection Resolution
Selection abandons raw DOM nodes in favor of an internal Path model.
A `Location` is defined by:
- `path`: `[blockIndex, childIndex]` (e.g., `[0, 1]` points to the "World" text node in the example above).
- `offset`: Character offset within that specific text node.

The `Selection` is an object:
```json
{
  "anchor": { "path": [0, 1], "offset": 0 },
  "focus": { "path": [0, 1], "offset": 5 }
}
```
*Normalization Rules:*
Selections are always normalized so `anchor` comes before `focus` in document order, resulting in a `Range` object before passing to the Reducer.

## 4. Reducer Design
The Reducer (`state + transaction => newState`) processes transactions that contain atomic operations.

**Operations**:
- `INSERT_TEXT`: Splits the target text node if necessary and inserts text, applying active marks.
- `DELETE_RANGE`: Iterates over the selection range, slicing text nodes. Completely empty text nodes are pruned. Empty blocks merge with adjacent blocks based on schema rules.
- `SPLIT_NODE`: Splits an inline node, or splits a block node (e.g. Enter key).
- `MERGE_NODES`: Merges two adjacent blocks or inline nodes.
- `WRAP_MARK`: Iterates over text nodes in the range, splitting boundaries if necessary, and adds a mark to the `marks` array.
- `UNWRAP_MARK`: Removes a mark from text nodes in the range.

## 5. Mark System
Marks are not DOM wrappers (`<b>`, `<i>`) inside the state; they are arrays of strings (or objects for links) on `text` nodes.
When a user selects text and clicks "Bold", a `WRAP_MARK` transaction is dispatched. The Reducer finds all text nodes in the selection, splits them at the selection boundaries, and adds `"bold"` to their `marks` arrays.
During rendering, the view layer wraps the text in appropriate DOM tags.

## 6. Diff Rendering Strategy
The `DOMRenderer` maintains a WeakMap mapping State Nodes to DOM elements.
During a render cycle:
1. Traverse the State Tree.
2. If a node identity matches and content/marks haven't changed, skip.
3. If marks changed, update DOM wrappers.
4. If text changed, update `nodeValue`.
5. If nodes were added/removed, patch the DOM container.
6. Translate the internal `Selection` back into DOM `Range` and apply it to `window.getSelection()` after patching.

## 7. Undo/Redo System
The history is a stack of `Transactions`. Each transaction that mutates the document generates an `Inverse Transaction` concurrently inside the Reducer.
- `INSERT_TEXT` at `path/offset` -> Inverse is `DELETE_RANGE` at `path/offset` to `path/(offset+length)`.
- `WRAP_MARK` -> Inverse is `UNWRAP_MARK`.
Pressing Undo dispatches the inverse transaction to the reducer, which deterministically restores the state.

## 8. Special Node Handling
**Code Blocks**:
- The schema defines `code` as an atomic block that only accepts plain text.
- `WRAP_MARK` transactions explicitly ignore paths inside a `code` block.
- Cross-block deletions (`DELETE_RANGE`) that partially overlap a `code` block will treat the `code` block as an indivisible unit (it will either be fully deleted or entirely preserved based on selection threshold, avoiding partial HTML/string corruption).
