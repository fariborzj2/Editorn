# System Analysis & Phase Plan

## 1. Overview
The Editorn block-based editor has transitioned to a modular, extensible architecture (`EditorCore`, `BlockManager`, `PluginManager`). The system has robust features like standard blocks, floating inline toolbars, a fixed toolbar, and rudimentary support for directional switching (RTL/LTR). However, extensive QA stress-testing reveals underlying fragility in block lifecycle management and user interactions. The key risks lie in how the `EditorCore` manages global events (like backspace block merging) and how plugins interact with the DOM, often assuming all blocks are simple `contentEditable` div elements.

## 2. Issue Breakdown

### Issue 1: Code Block Corruption via Backspace Merge
- **Description**: Pressing `Backspace` at the beginning of an empty block immediately following a complex block (like `Code`) corrupts the complex block's structure.
- **Severity**: Critical
- **Root Cause**: `EditorCore.js` hardcodes a merge logic (`previousBlock.element.innerHTML = prevHtml + marker + currHtml;`) that assumes all blocks are simple single-node `contentEditable` elements.
- **Impact**: Breaks syntax highlighting, destroys the `textarea` and `pre` structure of the code block, and causes the block to become unusable or data to be lost.
- **Suggested Fix**: Implement a `isMergeable` or similar interface for blocks. If the previous block is not mergeable, `Backspace` should simply delete the current empty block and place focus appropriately in the previous block.
- **Related Files / Components**: `src/core/EditorCore.js`, `src/blocks/Code.js`

### Issue 2: Fixed Toolbar Block Conversion Target Failure
- **Description**: Converting a block via the `FixedToolbar` (e.g., from Paragraph to Header) successfully changes the data model but fails to maintain focus or correctly identify the target block.
- **Severity**: Medium
- **Root Cause**: `FixedToolbar.js` attempts to find the current block by traversing up to an element with the `.editorn-block` class and reading `dataset.id`. However, the current architecture uses `.editorn-block-wrapper` (managed by `Renderer.js`) and block IDs are kept in the data model, not the DOM wrapper.
- **Impact**: Converting blocks feels disconnected; users lose cursor focus and must click back into the editor to continue typing.
- **Suggested Fix**: Use `this.api.findActiveBlockIndex()` to locate the active block index directly. After conversion via `blockManager.insertBlock`, invoke a mechanism to explicitly set focus to the newly created block.
- **Related Files / Components**: `src/plugins/FixedToolbar.js`

### Issue 3: Slash Menu Visibility Race Condition
- **Description**: The `/` slash menu sometimes fails to open when typing quickly, or opens when appending `/` to a word (e.g., `Hello/`), causing erratic behavior.
- **Severity**: Low
- **Root Cause**: `SlashMenu.js` uses `text.endsWith('/')` after stripping `\u200B`. Rapid typing and asynchronous DOM updates can cause `getSelection().rangeCount` or the internal offset calculations to misalign.
- **Impact**: Minor UX frustration.
- **Suggested Fix**: Refine the trigger condition to ensure the `/` is at the exact current cursor position and preceded by a space or start-of-line.
- **Related Files / Components**: `src/plugins/SlashMenu.js`

### Issue 4: History Manager Debounce Loss
- **Description**: Rapidly pressing `Ctrl+Z` after typing quickly discards the most recent keystrokes that haven't yet been flushed by the 500ms debounce timer.
- **Severity**: Low
- **Root Cause**: `HistoryManager.js` relies solely on `setTimeout` to record state. Unflushed state is not captured before executing `undo()`.
- **Impact**: Users may lose partial sentences when undoing immediately after typing.
- **Suggested Fix**: Immediately call `this.record()` and clear the timeout if an undo or redo event is intercepted, ensuring the current state is saved before mutating the history stack.
- **Related Files / Components**: `src/core/HistoryManager.js`

## 3. Phase-Based Fix Plan

### Phase 1: Core Lifecycle & Event Stability
- **Goal**: Resolve catastrophic failures related to block merging and fundamental key handling.
- **Tasks**:
  - [x] Implement `isMergeable` property across all standard block types.
  - [x] Refactor `Backspace` logic in `EditorCore.js` to conditionally merge or simply delete based on `isMergeable`.
- **Dependencies**: None.
- **Acceptance Criteria**: Pressing Backspace at the boundary of a Code block and Paragraph deletes the Paragraph without corrupting the Code block.
- **Risk Assessment**: Modifying core keydown events may introduce regressions in standard paragraph editing.

### Phase 2: Plugin DOM Interaction Corrections
- **Goal**: Fix the Fixed Toolbar and Slash Menu so they interact reliably with the current Renderer and BlockManager APIs.
- **Tasks**:
  - [x] Update `FixedToolbar.js` to use `findActiveBlockIndex()` instead of DOM traversal.
  - [x] Add focus logic post-conversion in `FixedToolbar.js`.
  - [x] Refine `SlashMenu.js` trigger condition regex.
- **Dependencies**: Phase 1
- **Acceptance Criteria**: Clicking "Header" in the fixed toolbar converts the current block and retains cursor focus.
- **Risk Assessment**: Low risk.

### Phase 3: State Management Polish
- **Goal**: Enhance the HistoryManager to accurately capture fast typers.
- **Tasks**:
  - [x] Add a forced flush mechanism to `HistoryManager.js` before executing Undo/Redo.
- **Dependencies**: None.
- **Acceptance Criteria**: Rapid typing followed instantly by Ctrl+Z undoes the exact string of characters typed.
- **Risk Assessment**: Low risk.

## 4. Progress Tracking
- **Phase 1 Progress**: 100%
  - Tasks: Completed
- **Phase 2 Progress**: 100%
  - Tasks: Completed
- **Phase 3 Progress**: 100%
  - Tasks: Completed

## 5. Validation & Verification
- **Test cases**:
  - Insert a Code block, insert a Paragraph block below it, press Backspace inside the Paragraph block.
  - Type a paragraph, select text, click "Quote" in the Fixed Toolbar, verify the cursor remains inside the Quote block.
  - Type `Test/`, verify slash menu does not appear. Type `/`, verify slash menu appears.
- **Edge cases**: Backspace on the first block of the document.
- **Success criteria**: All identified critical and medium bugs are resolved without causing standard text editing regressions.

## 6. Consistency Check
- **Conflicts**: Modifying the DOM wrapper structure (`Renderer.js`) is avoided to prevent breaking the `DragDropManager`.
- **Redundancies**: None identified.
- **Breaking changes**: None expected; internal block interfaces will be augmented but remain backwards compatible.

## 7. Output Requirements
This analysis provides a strictly traceable breakdown of root causes discovered via direct Playwright DOM inspection and source code static analysis.
