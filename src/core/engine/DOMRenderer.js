// A simple virtual DOM to real DOM patcher
export class DOMRenderer {
    constructor(container, blockClasses) {
        this.container = container;
        this.blockClasses = blockClasses;
        this.renderedBlocks = new Map();
    }

    render(state) {
        // Iterate through state blocks
        const currentIds = new Set(state.blocks.map(b => b.id));

        // Remove blocks that are no longer in state
        for (const [id, el] of this.renderedBlocks.entries()) {
            if (!currentIds.has(id)) {
                el.wrapper.remove();
                this.renderedBlocks.delete(id);
            }
        }

        // Ensure DOM matches state order and content
        let currentDomIndex = 0;
        state.blocks.forEach((blockState, index) => {
            let rendered = this.renderedBlocks.get(blockState.id);

            if (!rendered) {
                // Create new
                const BlockClass = this.blockClasses[blockState.type];
                if (!BlockClass) return;

                // For this demo, we bypass the full block lifecycle and just create the element
                // In a full implementation, you'd integrate with the BlockManager/ExtensionRegistry properly.
                const wrapper = document.createElement('div');
                wrapper.className = 'editorn-block-wrapper';
                wrapper.style.display = 'flex';

                const dragHandle = document.createElement('div');
                dragHandle.className = 'editorn-drag-handle';
                dragHandle.innerHTML = '⋮⋮';
                wrapper.appendChild(dragHandle);

                const el = document.createElement('div');
                el.className = `editorn-block-${blockState.type}`;
                el.setAttribute('data-block-id', blockState.id);
                // Important: Since we intercept beforeinput, we can keep contenteditable true for text blocks
                // to allow native selection and IME, but we intercept mutations.
                if (blockState.type !== 'code' && blockState.type !== 'image') {
                    el.contentEditable = "true";
                }

                el.style.flex = '1';
                wrapper.appendChild(el);

                rendered = { wrapper, el, type: blockState.type, lastText: '' };
                this.renderedBlocks.set(blockState.id, rendered);

                // Append or insert before
                if (currentDomIndex < this.container.children.length) {
                    this.container.insertBefore(wrapper, this.container.children[currentDomIndex]);
                } else {
                    this.container.appendChild(wrapper);
                }
            } else {
                // Reorder if necessary
                if (this.container.children[currentDomIndex] !== rendered.wrapper) {
                     this.container.insertBefore(rendered.wrapper, this.container.children[currentDomIndex]);
                }
            }

            // Sync content conditionally to avoid breaking IME
            if (rendered.type === 'code') {
                const ta = rendered.el.querySelector('textarea');
                if (ta) {
                     if (ta.value !== blockState.data.code) {
                         ta.value = blockState.data.code || '';
                     }
                } else {
                     rendered.el.innerHTML = `<textarea style="width:100%">${blockState.data.code || ''}</textarea>`;
                }
            } else {
                 // Compare before setting innerHTML to avoid destroying DOM nodes for ongoing IME
                 if (rendered.lastText !== blockState.data.text) {
                     // VERY rudimentary innerHTML update, should ideally patch DOM nodes
                     rendered.el.innerHTML = blockState.data.text || '<br>';
                     rendered.lastText = blockState.data.text;
                 }
            }

            currentDomIndex++;
        });

        // Restore selection if state has it
        if (state.selection) {
             this.restoreSelection(state.selection);
        }
    }

    restoreSelection(selState) {
        const anchorRendered = this.renderedBlocks.get(selState.anchorBlock);
        const focusRendered = this.renderedBlocks.get(selState.focusBlock);

        if (!anchorRendered || !focusRendered) return;

        const setRangeOffset = (el, offset) => {
            let currentOffset = 0;
            const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
            let node;
            while (node = walk.nextNode()) {
                if (currentOffset + node.textContent.length >= offset) {
                    return { node, offset: offset - currentOffset };
                }
                currentOffset += node.textContent.length;
            }
            return { node: el, offset: el.childNodes.length };
        };

        try {
            const sel = window.getSelection();
            const range = document.createRange();

            const anchor = setRangeOffset(anchorRendered.el, selState.anchorOffset);
            range.setStart(anchor.node, anchor.offset);

            if (selState.isCollapsed) {
                range.collapse(true);
            } else {
                const focus = setRangeOffset(focusRendered.el, selState.focusOffset);
                range.setEnd(focus.node, focus.offset);
            }

            sel.removeAllRanges();
            sel.addRange(range);
        } catch(e) {
            // Ignore selection restoration errors during rapid typing
        }
    }
}
