import { generateId } from '../../utils/IdGenerator.js';

export class EditorState {
  constructor(doc, selection = null) {
    this.doc = doc; // Root document node
    this.selection = selection; // { anchor: { nodeId, offset }, focus: { nodeId, offset } }
    this.nodeMap = new Map();
    this.buildNodeMap(this.doc);
  }

  buildNodeMap(node) {
      if (node.id) this.nodeMap.set(node.id, node);
      if (node.children) {
          node.children.forEach(child => this.buildNodeMap(child));
      }
  }

  getNode(id) {
      return this.nodeMap.get(id);
  }

  static createEmpty() {
    return new EditorState({
      id: generateId(),
      type: 'doc',
      children: [
        {
          id: generateId(),
          type: 'paragraph',
          children: [{ id: generateId(), type: 'text', text: '', marks: [] }]
        }
      ]
    });
  }

  static fromData(data) {
    if (!data || !data.blocks || data.blocks.length === 0) {
      return EditorState.createEmpty();
    }

    const doc = {
        id: generateId(),
        type: 'doc',
        children: data.blocks.map(b => {
            const blockId = b.id || generateId();
            if (b.type === 'code') {
                return {
                    id: blockId,
                    type: 'code',
                    data: { language: b.data?.language },
                    children: [{ id: generateId(), type: 'text', text: b.data?.code || '', marks: [] }]
                };
            }

            return {
                id: blockId,
                type: b.type,
                data: b.data,
                children: [{ id: generateId(), type: 'text', text: b.data?.text || '', marks: [] }]
            };
        })
    };

    // Default selection to start of first node
    let firstTextNodeId = doc.children[0]?.children[0]?.id;
    let selection = firstTextNodeId ? {
        anchor: { nodeId: firstTextNodeId, offset: 0 },
        focus: { nodeId: firstTextNodeId, offset: 0 }
    } : null;

    return new EditorState(doc, selection);
  }

  clone() {
    // Deep clone the document tree preserving IDs
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
