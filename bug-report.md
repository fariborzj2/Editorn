# 🧪 Editor Bug Report & Fix Roadmap

## 📊 Test Summary
- Features Tested: Core typing, Block creation/deletion, Directional support (RTL/LTR), Keyboard navigation, Menu rendering, Extension system.
- Bugs Found: 4
- Critical Bugs: 2

---

## ❌ Bugs Found

### 🐞 BUG-001: Slash Menu Incorrect Render Trigger
- Severity: High
- Area: Toolbar / Core
- Steps:
  1. Type `/h` inside a paragraph block.
  2. Notice the Slash menu does not open or triggers inconsistently when `textBeforeCursor` contains characters after the slash (e.g. `/h`).
- Expected:
  Slash menu should appear and filter items, or at least open exactly when `/` is typed and handle subsequent characters gracefully. Currently, it strictly expects `/` or ` /` immediately before the cursor to trigger `open()`, and typing additional characters causes it to close.
- Actual:
  The Slash Menu closes instantly if any character is typed after the `/`.

---

### 🐞 BUG-002: Backspace Empty Editor State Crash
- Severity: Critical
- Area: Keyboard / Core / BlockManager
- Steps:
  1. Select all content in the editor and press Backspace to clear it.
  2. Press Backspace again.
- Expected:
  The editor should retain at least one empty paragraph block to allow continued typing.
- Actual:
  If the `currentBlockIndex` logic fails or all blocks are removed, the editor enters an invalid state with 0 blocks. The `EditorCore` lacks a robust normalization check during runtime input/backspace to ensure at least one paragraph always exists. Actually, testing shows Backspace handles `currentBlockIndex <= 0` by returning early, meaning the first block cannot be deleted via Backspace. However, selecting all (`Ctrl+A`) and pressing `Backspace` relies on native browser selection deletion which destroys the DOM structure, leaving the `BlockManager` state out of sync with the DOM.

---

### 🐞 BUG-003: Code Block Corrupted by Selection Deletion
- Severity: Critical
- Area: Selection / Core / Blocks
- Steps:
  1. Have multiple blocks including a Code block.
  2. Press `Ctrl+A` to select all, then type some text or press `Backspace`.
- Expected:
  All blocks are replaced by a single new paragraph containing the typed text.
- Actual:
  Because Code block uses `<textarea>` (or similar) internally and relies on `contenteditable="false"`, the native `Ctrl+A` + typing behavior completely breaks the synchronization between the DOM and `BlockManager`. Text typed replaces the entire container DOM but does not update `BlockManager` state, or mixes HTML into Code blocks incorrectly as seen in `Output after typing: { "type": "paragraph", "data": { "text": "<pre><code>...</code></pre>" } }`.

---

### 🐞 BUG-004: Missing `replaceBlock` Method in BlockManager
- Severity: Medium
- Area: Architecture / BlockManager
- Steps:
  1. Review `src/plugins/SlashMenu.js`.
  2. Note the workaround used: removing a block and inserting a new one because `BlockManager` lacks `replaceBlock`.
- Expected:
  `BlockManager` should provide a standard `replaceBlock(index, newType, newData)` API for consistency and cleaner history management.
- Actual:
  Plugins manually perform `removeBlock` followed by `insertBlock`, which causes brief DOM thrashing, cursor issues, and two separate operations in the history stack.

---

## 📍 Root Cause Analysis (MANDATORY)
- **BUG-002 & BUG-003 (Selection / DOM Sync)**:
  - احتمالی‌ترین علت فنی: The editor relies heavily on native `contenteditable` behavior without an overarching `MutationObserver` or `selectionchange` interceptor for complex cross-block operations like `Ctrl+A` + `Delete`/`Typing`. When a user performs a cross-block deletion, the browser destroys the DOM structure of the blocks, but `EditorCore` event handlers (`keydown`) only handle specific key presses (Enter/Backspace) on a block-by-block basis. The internal state (`BlockManager.blocks`) becomes entirely disconnected from the actual DOM.
  - مربوط به: State Management & DOM Sync.

- **BUG-001 (Slash Menu)**:
  - احتمالی‌ترین علت فنی: In `SlashMenu.js`, `handleInput` checks if `textBeforeCursor` exactly equals `/` or ends with ` /` or `
/`. If the user types `/h`, the text becomes `/h`, the condition fails, and `this.close()` is immediately called.

---

## 🛠 Fix Roadmap (PHASED - CRITICAL)

### 🔴 Phase 1: Critical Stabilization
Goal: Prevent data loss and major UX breakage (DOM vs State desync)

- Bugs included: BUG-002, BUG-003
- Why these first: Native cross-block selection deletion corrupts the editor's entire data model. This is a fatal flaw for any WYSIWYG editor.
- Fix strategy:
  1. Intercept `keydown` events for `Backspace`/`Delete` and printable characters when `selection.rangeCount > 0` and the selection spans across multiple blocks.
  2. Implement a unified `deleteRange(range)` function that calculates the affected blocks, removes the middle blocks, merges the start and end text appropriately, and updates the `BlockManager` state.
  3. Ensure a global fallback that enforces at least one paragraph block exists in the DOM/State.
- Risk level: High (Touches core selection and state logic).
- Dependencies: None.

---

### 🟠 Phase 2: Core Behavior Fixes
Goal: Fix editor logic consistency

- Bugs included: BUG-004
- Strategy: Add `replaceBlock` API to `BlockManager`. Refactor `SlashMenu` and toolbar plugins to use this new API.
- Order of execution:
  1. Add `replaceBlock` to `BlockManager.js`.
  2. Update `SlashMenu.js` to utilize it.
  3. Update `FixedToolbar.js` (if applicable) to utilize it.

---

### 🟡 Phase 3: UX & Edge Cases
Goal: Improve usability and polish

- Bugs included: BUG-001
- Improvements: Enhance the Slash Menu to stay open when typing after the `/` and filter the available items based on the typed query (e.g., `/h` highlights "Header 1").

---

### 🔵 Phase 4: Final Hardening
Goal: Production readiness

- Stress fixes: Test rapid copy/paste spanning multiple blocks, specifically targeting mixed LTR/RTL text.
- Performance considerations: Debounce history saves during the new `deleteRange` operation to prevent excessive state snapshots.
- Regression risks: Ensure that fixing `Ctrl+A` does not break standard single-block typing or backspace behavior.

---

## 🔗 Execution Order (VERY IMPORTANT)

1. Fix BUG-002 and BUG-003 (Implement cross-block selection handling and fallback block enforcement).
2. Fix BUG-004 (Implement `BlockManager.replaceBlock`).
3. Fix BUG-001 (Enhance SlashMenu trigger and filtering).
4. Re-test keyboard module (specifically cross-block interactions).
5. Perform end-to-end regression testing.

---

## ⚠ Risk Analysis

- What can break after fixes? Complex selection logic (Phase 1) is prone to edge cases, especially across boundaries of "unmergeable" blocks (like Code or Table). Handling selection inside shadow DOMs or custom elements might fail.
- Which parts need regression testing? Copy/paste, Undo/Redo history, and Backspace/Enter behavior at the very start/end of blocks.

---

## 💡 Additional Improvements

- Architecture suggestions: Move away from relying strictly on DOM events for state updates and consider a Virtual DOM or explicit Operation Model (like Slate.js or ProseMirror) for robust cross-block state management.
- Performance ideas: Use `DocumentFragment` when rendering multiple blocks simultaneously.
- UX improvements: Implement floating toolbars near the text selection instead of relying solely on the Slash Menu or fixed toolbars.

---

## 🧠 Tester Notes

- Human-like pain points: "I tried to select all and start over, and the whole editor broke! Code blocks turned into weird HTML paragraphs."
- Unexpected behaviors: The Slash Menu disappearing immediately when I tried to type the name of the block I wanted.
- Confusing interactions: Not being able to cleanly delete empty space if it crosses a block boundary.
