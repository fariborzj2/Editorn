export class SlashMenuState {
    static derive(state) {
        if (!state.selection || !state.selection.anchor || state.selection.anchor.path[0] !== state.selection.focus.path[0]) return { active: false };

        const block = state.doc.children[state.selection.anchor.path[0]];
        if (!block || block.type !== 'paragraph') return { active: false };

        const textNode = block.children[state.selection.anchor.path[1]];
        const text = (textNode ? textNode.text : '').slice(0, state.selection.anchor.offset);

        // Match a slash preceded by start of line or space, followed by alphanumeric query
        const match = text.match(/(?:^|\s)\/([a-zA-Z0-9]*)$/);

        if (match) {
            return {
                active: true,
                query: match[1],
                position: {
                    blockId: block.id,
                    offset: state.selection.anchor.offset
                }
            };
        }

        return { active: false };
    }
}
