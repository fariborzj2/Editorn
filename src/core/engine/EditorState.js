import { generateId } from '../../utils/IdGenerator.js';

export class EditorState {
  constructor(blocks = [], selection = null) {
    this.blocks = blocks;
    this.selection = selection; // { anchorBlock, anchorOffset, focusBlock, focusOffset }
  }

  static createEmpty() {
    return new EditorState([{ id: generateId(), type: 'paragraph', data: { text: '' } }], null);
  }

  static fromData(data) {
    if (!data || !data.blocks || data.blocks.length === 0) {
      return EditorState.createEmpty();
    }
    const blocks = data.blocks.map(b => ({
      id: b.id || generateId(),
      type: b.type,
      data: { ...b.data }
    }));
    return new EditorState(blocks, null);
  }

  clone() {
    return new EditorState(
      this.blocks.map(b => ({ ...b, data: { ...b.data } })),
      this.selection ? { ...this.selection } : null
    );
  }
}
