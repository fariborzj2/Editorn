export class SelectionModel {
  static normalize(state) {
    if (!state.selection || !state.selection.anchor || !state.selection.focus) return null;

    const { anchor, focus } = state.selection;
    if (!anchor.nodeId || !focus.nodeId) return null;

    // We need to determine document order.
    // We can do this by traversing the state tree.
    let order = 0; // 0 = same, -1 = anchor first, 1 = focus first

    if (anchor.nodeId !== focus.nodeId) {
        let found = null;
        const traverse = (node) => {
            if (found) return;
            if (node.id === anchor.nodeId) {
                found = 'anchor';
                order = -1;
            } else if (node.id === focus.nodeId) {
                found = 'focus';
                order = 1;
            }
            if (node.children) {
                for (const child of node.children) {
                    traverse(child);
                }
            }
        };
        traverse(state.doc);
    } else {
        order = anchor.offset - focus.offset;
    }

    let start, end;
    if (order <= 0) {
        start = anchor;
        end = focus;
    } else {
        start = focus;
        end = anchor;
    }

    return {
      start,
      end,
      isCollapsed: order === 0
    };
  }
}
