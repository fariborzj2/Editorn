import { EditorState } from './EditorState.js';
import { reducer } from './Reducer.js';
import { TransactionTypes } from './Transaction.js';

export class EditorEngine {
  constructor(initialData, onStateChange) {
    this.state = EditorState.fromData(initialData);
    this.onStateChange = onStateChange;
    this.transactionQueue = [];
    this.rAFId = null;

    // History System
    this.history = []; // Array of states for undo
    this.redoStack = []; // Array of states for redo
    this.lastActionTime = 0;
  }

  dispatch(transaction) {
    // 1. Transaction Batching Layer
    this.transactionQueue.push(transaction);
    this.scheduleBatchProcess();
  }

  scheduleBatchProcess() {
      if (this.rAFId) return;
      this.rAFId = requestAnimationFrame(() => {
          this.rAFId = null;
          this.processQueue();
      });
  }

  processQueue() {
      if (this.transactionQueue.length === 0) return;

      const transactions = [...this.transactionQueue];
      this.transactionQueue = [];

      const now = Date.now();
      const timeSinceLast = now - this.lastActionTime;

      // Determine if this batch should create a new history snapshot
      // We compress sequential text inserts into a single snapshot if they happen within 500ms
      const isTextBatchOnly = transactions.every(t => t.type === TransactionTypes.INSERT_TEXT);
      const shouldSaveSnapshot = !isTextBatchOnly || timeSinceLast > 500 || this.history.length === 0;

      if (shouldSaveSnapshot) {
          // Save a deep clone of state before applying the batch
          this.history.push(this.state.clone());
          // Cap history length to prevent memory leaks (e.g. 100 steps)
          if (this.history.length > 100) this.history.shift();
          // Clear redo stack on new action
          this.redoStack = [];
      }

      this.lastActionTime = now;

      // 2. Single Reducer Pass
      let nextState = this.state;
      for (const tx of transactions) {
          nextState = reducer(nextState, tx);
      }

      this.state = nextState;

      // 3. Trigger Render
      if (this.onStateChange) {
          this.onStateChange(this.state);
      }
  }

  undo() {
      if (this.history.length === 0) return;

      // Push current to redo
      this.redoStack.push(this.state.clone());

      // Pop last from history and set as state
      this.state = this.history.pop();

      if (this.onStateChange) {
          this.onStateChange(this.state);
      }
  }

  redo() {
      if (this.redoStack.length === 0) return;

      // Push current to history
      this.history.push(this.state.clone());

      // Pop from redo stack and set as state
      this.state = this.redoStack.pop();

      if (this.onStateChange) {
          this.onStateChange(this.state);
      }
  }

  getState() {
    return this.state;
  }
}
