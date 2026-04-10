export class SlashMenuState {
    static derive(state) {
        if (!state.selection || !state.selection.isCollapsed) return { active: false };

        const block = state.blocks.find(b => b.id === state.selection.anchorBlock);
        if (!block || block.type !== 'paragraph') return { active: false };

        const text = (block.data.text || '').slice(0, state.selection.anchorOffset);

        // Match a slash preceded by start of line or space, followed by alphanumeric query
        const match = text.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

        if (match) {
            return {
                active: true,
                query: match[1],
                position: {
                    blockId: block.id,
                    offset: state.selection.anchorOffset
                }
            };
        }

        return { active: false };
    }
}
