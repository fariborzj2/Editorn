export class DOMRenderer {
    constructor(container, blockClasses) {
        this.container = container;
        this.blockClasses = blockClasses;
        this.renderedBlocks = new Map();

        // Disable native spellcheck which can corrupt the DOM during fast typing
        this.container.spellcheck = false;
    }

    render(state) {
        const currentIds = new Set(state.doc.children.map(b => b.id));

        for (const [id, el] of this.renderedBlocks.entries()) {
            if (!currentIds.has(id)) {
                el.wrapper.remove();
                this.renderedBlocks.delete(id);
            }
        }

        let currentDomIndex = 0;
        state.doc.children.forEach((blockState, bIdx) => {
            let rendered = this.renderedBlocks.get(blockState.id);

            if (!rendered) {
                const wrapper = document.createElement('div');
                wrapper.className = 'editorn-block-wrapper';
                wrapper.style.display = 'flex';

                const dragHandle = document.createElement('div');
                dragHandle.className = 'editorn-drag-handle';
                dragHandle.innerHTML = '⋮⋮';
                dragHandle.contentEditable = 'false';
                wrapper.appendChild(dragHandle);

                const el = document.createElement('div');
                el.className = `editorn-block-${blockState.type}`;
                el.setAttribute('data-block-id', blockState.id);
                el.setAttribute('data-bidx', bIdx);

                if (blockState.type !== 'code' && blockState.type !== 'image') {
                    el.contentEditable = "true";
                }

                el.style.flex = '1';
                wrapper.appendChild(el);

                rendered = { wrapper, el, type: blockState.type, childNodesMap: new Map() };
                this.renderedBlocks.set(blockState.id, rendered);

                if (currentDomIndex < this.container.children.length) {
                    this.container.insertBefore(wrapper, this.container.children[currentDomIndex]);
                } else {
                    this.container.appendChild(wrapper);
                }
            } else {
                if (this.container.children[currentDomIndex] !== rendered.wrapper) {
                     this.container.insertBefore(rendered.wrapper, this.container.children[currentDomIndex]);
                }
                rendered.el.setAttribute('data-bidx', bIdx);
            }

            this.renderBlockChildren(rendered, blockState);
            currentDomIndex++;
        });

        if (state.selection) {
             this.restoreSelection(state);
        }
    }

    renderBlockChildren(rendered, blockState) {
        if (blockState.type === 'code') {
             const ta = rendered.el.querySelector('textarea');
             const text = blockState.children[0]?.text || '';
             if (ta) {
                  if (ta.value !== text) ta.value = text;
             } else {
                  rendered.el.innerHTML = `<textarea style="width:100%">${text}</textarea>`;
             }
             return;
        }

        const el = rendered.el;
        let childDomIndex = 0;

        // Basic diffing for inline tree
        blockState.children.forEach((childNode, cIdx) => {
            // For simplicity in diffing without unique IDs on text nodes, we map by index
            let domChild = el.childNodes[childDomIndex];

            // Create proper DOM structure based on marks
            const createNode = () => {
                let node = document.createTextNode(childNode.text || '\uFEFF'); // zero width space for empty nodes to keep height
                if (childNode.text === '') node.textContent = '\uFEFF';

                if (childNode.marks && childNode.marks.length > 0) {
                    let wrapper = document.createElement('span');
                    childNode.marks.forEach(mark => {
                        if (mark === 'bold') wrapper.style.fontWeight = 'bold';
                        if (mark === 'italic') wrapper.style.fontStyle = 'italic';
                        if (mark === 'underline') wrapper.style.textDecoration = 'underline';
                    });
                    wrapper.appendChild(node);
                    wrapper.setAttribute('data-cidx', cIdx);
                    return { element: wrapper, textNode: node };
                }

                // Need a wrapper anyway to attach data-cidx for selection mapping
                let wrapper = document.createElement('span');
                wrapper.appendChild(node);
                wrapper.setAttribute('data-cidx', cIdx);
                return { element: wrapper, textNode: node };
            };

            if (!domChild) {
                const { element, textNode } = createNode();
                el.appendChild(element);
                rendered.childNodesMap.set(cIdx, textNode);
            } else {
                // To keep it robust, we just replace if marks changed, otherwise update text
                // Check if current DOM node has same marks. (Simplified check by recreating)
                // In a true engine, we diff the marks array carefully.
                const { element, textNode } = createNode();
                el.replaceChild(element, domChild);
                rendered.childNodesMap.set(cIdx, textNode);
            }
            childDomIndex++;
        });

        // Remove excess children
        while (el.childNodes.length > blockState.children.length) {
            el.removeChild(el.lastChild);
        }
    }

    restoreSelection(state) {
        const selState = state.selection;
        if (!selState || !selState.anchor || !selState.focus) return;

        try {
            const anchorBlockState = state.doc.children[selState.anchor.path[0]];
            const focusBlockState = state.doc.children[selState.focus.path[0]];
            if (!anchorBlockState || !focusBlockState) return;

            const anchorRendered = this.renderedBlocks.get(anchorBlockState.id);
            const focusRendered = this.renderedBlocks.get(focusBlockState.id);
            if (!anchorRendered || !focusRendered) return;

            const anchorTextNode = anchorRendered.childNodesMap.get(selState.anchor.path[1]);
            const focusTextNode = focusRendered.childNodesMap.get(selState.focus.path[1]);

            if (!anchorTextNode || !focusTextNode) return;

            const sel = window.getSelection();
            const range = document.createRange();

            // Handle zero width space offset adjustment
            const aOffset = anchorTextNode.textContent === '\uFEFF' ? 0 : selState.anchor.offset;
            const fOffset = focusTextNode.textContent === '\uFEFF' ? 0 : selState.focus.offset;

            range.setStart(anchorTextNode, Math.min(aOffset, anchorTextNode.length));
            range.setEnd(focusTextNode, Math.min(fOffset, focusTextNode.length));

            sel.removeAllRanges();
            sel.addRange(range);
        } catch(e) {
            // Ignore temporary selection errors during fast typing diffs
        }
    }
}
