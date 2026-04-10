import { generateId } from '../../utils/IdGenerator.js';

export class EditorState {
  constructor(doc, selection = null) {
    this.doc = doc; // Root document node
    this.selection = selection; // { anchor: { path, offset }, focus: { path, offset } }
    this.activeMarks = []; // Marks to apply to next typed text
  }

  static createEmpty() {
    return new EditorState({
      type: 'doc',
      children: [
        {
          id: generateId(),
          type: 'paragraph',
          children: [{ type: 'text', text: '', marks: [] }]
        }
      ]
    }, {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 }
    });
  }

  static fromData(data) {
    if (!data || !data.blocks || data.blocks.length === 0) {
      return EditorState.createEmpty();
    }

    const doc = {
        type: 'doc',
        children: data.blocks.map(b => {
            const blockId = b.id || generateId();
            if (b.type === 'code') {
                return {
                    id: blockId,
                    type: 'code',
                    data: { language: b.data?.language },
                    children: [{ type: 'text', text: b.data?.code || '', marks: [] }]
                };
            }

            // For other blocks, we attempt to parse HTML to text nodes if migrating from old format
            // In a pure implementation, the incoming data is already tree-shaped.
            // For simplicity in this engine redesign, we wrap raw text.
            return {
                id: blockId,
                type: b.type,
                data: b.data, // Preserve other metadata
                children: [{ type: 'text', text: b.data?.text || '', marks: [] }]
            };
        })
    };

    return new EditorState(doc, null);
  }

  clone() {
    // Deep clone the document tree
    const cloneNode = (node) => {
        const cloned = { ...node };
        if (node.children) {
            cloned.children = node.children.map(cloneNode);
        }
        if (node.marks) {
            cloned.marks = [...node.marks];
        }
        return cloned;
    };

    return new EditorState(
        cloneNode(this.doc),
        this.selection ? JSON.parse(JSON.stringify(this.selection)) : null
    );
  }
}
