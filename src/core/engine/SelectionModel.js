export class SelectionModel {
  static normalize(state) {
    if (!state.selection) return null;

    const { anchorBlock, anchorOffset, focusBlock, focusOffset } = state.selection;

    const anchorIndex = state.blocks.findIndex(b => b.id === anchorBlock);
    const focusIndex = state.blocks.findIndex(b => b.id === focusBlock);

    if (anchorIndex === -1 || focusIndex === -1) return null;

    let startBlockId, startOffset, endBlockId, endOffset;

    if (anchorIndex < focusIndex) {
      startBlockId = anchorBlock; startOffset = anchorOffset;
      endBlockId = focusBlock; endOffset = focusOffset;
    } else if (anchorIndex > focusIndex) {
      startBlockId = focusBlock; startOffset = focusOffset;
      endBlockId = anchorBlock; endOffset = anchorOffset;
    } else {
      startBlockId = anchorBlock;
      endBlockId = anchorBlock;
      startOffset = Math.min(anchorOffset, focusOffset);
      endOffset = Math.max(anchorOffset, focusOffset);
    }

    return {
      startBlockId, startOffset,
      endBlockId, endOffset,
      isCollapsed: startBlockId === endBlockId && startOffset === endOffset
    };
  }
}
