import { EditorState } from './EditorState.js';
import { reducer } from './Reducer.js';
import { InputPipeline } from './InputPipeline.js';

export class EditorEngine {
  constructor(initialData, onStateChange) {
    this.state = EditorState.fromData(initialData);
    this.onStateChange = onStateChange;
  }

  dispatch(transaction) {
    this.state = reducer(this.state, transaction);
    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  getState() {
    return this.state;
  }
}
