export class HistoryManager {
  constructor(editor) {
    this.editor = editor;
    this.history = [];
    this.index = -1;
    this.maxHistory = 100;
    this.isRecording = false;
    this.debounceTimeout = null;

    this.init();
  }

  init() {
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    this.editor.container.addEventListener('keydown', this.boundHandleKeydown);

    // We defer the first record to ensure EditorCore has fully rendered its initial blocks
    setTimeout(() => {
        this.record();
    }, 0);
  }

  record() {
    if (this.isRecording) return;

    clearTimeout(this.debounceTimeout);

    // Use debouncing so we don't record every single keystroke immediately
    this.debounceTimeout = setTimeout(() => {
        try {
            const state = JSON.stringify(this.editor.save().blocks);

            // If the state hasn't changed from the current state, don't record
            if (this.index >= 0 && this.history[this.index] === state) {
                return;
            }

            // If we are not at the end of the history array and we make a change,
            // we discard the future history (redo stack).
            if (this.index < this.history.length - 1) {
                this.history = this.history.slice(0, this.index + 1);
            }

            this.history.push(state);

            if (this.history.length > this.maxHistory) {
                this.history.shift();
            } else {
                this.index++;
            }
        } catch (error) {
            console.error("Failed to record history state:", error);
        }
    }, 500);
  }

  undo() {
    if (this.index > 0) {
      this.isRecording = true;
      this.index--;
      this.restoreState(this.history[this.index]);
      this.isRecording = false;
    }
  }

  redo() {
    if (this.index < this.history.length - 1) {
      this.isRecording = true;
      this.index++;
      this.restoreState(this.history[this.index]);
      this.isRecording = false;
    }
  }

  restoreState(stateString) {
      try {
          const blocksData = JSON.parse(stateString);

          // Clear current blocks
          this.editor.blockManager.blocks = [];
          this.editor.renderer.container.innerHTML = '';

          // Re-insert blocks
          blocksData.forEach(blockData => {
              this.editor.blockManager.insertBlock(blockData.type, blockData.data);
          });

          this.editor.renderer.renderBlocks(this.editor.blockManager.getBlocks());

          // Trigger change so UI can update appropriately if listening
          if (this.editor.config.onChange) {
              this.editor.config.onChange(this.editor.save());
          }

      } catch (error) {
          console.error("Failed to restore history state:", error);
      }
  }

  handleKeydown(e) {
    if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
            e.preventDefault();
            this.undo();
        } else if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            this.redo();
        }
    }
  }

  destroy() {
    this.editor.container.removeEventListener('keydown', this.boundHandleKeydown);
    clearTimeout(this.debounceTimeout);
  }
}
