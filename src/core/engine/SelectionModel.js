export class SelectionModel {
  static normalize(state) {
    if (!state.selection) return null;

    const { anchor, focus } = state.selection;

    if (!anchor || !focus || !anchor.path || !focus.path) return null;

    const cmp = this.comparePoints(anchor, focus);

    let start, end;
    if (cmp <= 0) {
        start = anchor;
        end = focus;
    } else {
        start = focus;
        end = anchor;
    }

    return {
      start,
      end,
      isCollapsed: cmp === 0
    };
  }

  static comparePoints(p1, p2) {
      // p.path is [blockIndex, childIndex]
      const [b1, c1] = p1.path;
      const [b2, c2] = p2.path;

      if (b1 !== b2) return b1 - b2;

      // If same block, compare child index
      if (c1 !== undefined && c2 !== undefined) {
          if (c1 !== c2) return c1 - c2;
      }

      // If same child, compare offset
      return p1.offset - p2.offset;
  }
}
