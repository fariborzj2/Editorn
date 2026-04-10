import { EditorState } from './EditorState.js';
import { reducer } from './Reducer.js';
import { TransactionTypes } from './Transaction.js';

export class EditorEngine {
  constructor(initialData, onStateChange) {
    this.state = EditorState.fromData(initialData);
    this.onStateChange = onStateChange;
    this.transactionQueue = [];
    this.rAFId = null;
  }

  dispatch(transaction) {
    // Micro-batching: Push to queue and schedule render

    // History compression / Transaction merging logic
    // e.g., if last transaction in queue is INSERT_TEXT and this is INSERT_TEXT at the contiguous boundary, we could merge.
    // For simplicity of this architecture proof, we just append to the queue.
    const lastTx = this.transactionQueue[this.transactionQueue.length - 1];
    let merged = false;

    if (lastTx && lastTx.type === TransactionTypes.INSERT_TEXT && transaction.type === TransactionTypes.INSERT_TEXT) {
         // Basic merge check: we could merge text payloads if selections align,
         // but since Reducer handles selections implicitly, we might just reduce them synchronously instead of merging payloads.
    }

    // Reduce synchronously to maintain correct state for immediate subsequent reads
    this.state = reducer(this.state, transaction);
    this.transactionQueue.push(transaction);

    this.scheduleRender();
  }

  scheduleRender() {
      if (this.rAFId) return;
      this.rAFId = requestAnimationFrame(() => {
          this.rAFId = null;
          this.transactionQueue = []; // flush queue
          if (this.onStateChange) {
              this.onStateChange(this.state);
          }
      });
  }

  getState() {
    return this.state;
  }
}
