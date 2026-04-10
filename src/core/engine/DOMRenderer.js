export class DOMRenderer {
    constructor(container, blockClasses) {
        this.container = container;
        this.blockClasses = blockClasses;
        this.renderedNodes = new Map(); // Map<nodeId, DOMElement | TextNode>

        this.container.spellcheck = false;
    }

    render(state) {
        // We do a top down keyed diff using state.doc.children

        const nextBlockIds = new Set(state.doc.children.map(b => b.id));

        // 1. Remove blocks that no longer exist
        for (const [id, nodeData] of this.renderedNodes.entries()) {
             if (nodeData.isBlock && !nextBlockIds.has(id)) {
                 nodeData.wrapper.remove();
                 this.renderedNodes.delete(id);
                 // We should also delete child nodes from map, but let garbage collection / overwrite handle it for simplicity here
             }
        }

        // 2. Diff and patch blocks
        let currentDomIndex = 0;
        state.doc.children.forEach(blockState => {
            let rendered = this.renderedBlocks(blockState.id);

            if (!rendered) {
                // Create Node
                rendered = this.createBlockNode(blockState);
                if (currentDomIndex < this.container.children.length) {
                    this.container.insertBefore(rendered.wrapper, this.container.children[currentDomIndex]);
                } else {
                    this.container.appendChild(rendered.wrapper);
                }
            } else {
                // Move Node if necessary
                if (this.container.children[currentDomIndex] !== rendered.wrapper) {
                    this.container.insertBefore(rendered.wrapper, this.container.children[currentDomIndex]);
                }
            }

            // 3. Diff and patch inline children
            this.patchChildren(rendered, blockState);

            currentDomIndex++;
        });

        // 4. Restore Cursor securely
        if (state.selection) {
             this.restoreSelection(state);
        }
    }

    renderedBlocks(id) {
        const node = this.renderedNodes.get(id);
        return node && node.isBlock ? node : null;
    }

    createBlockNode(blockState) {
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
        el.setAttribute('data-node-id', blockState.id);

        if (blockState.type !== 'code' && blockState.type !== 'image') {
            el.contentEditable = "true";
        }

        el.style.flex = '1';
        wrapper.appendChild(el);

        const nodeData = { isBlock: true, wrapper, el, type: blockState.type };
        this.renderedNodes.set(blockState.id, nodeData);
        return nodeData;
    }

    patchChildren(renderedBlock, blockState) {
        if (blockState.type === 'code') {
             const textState = blockState.children[0];
             let ta = renderedBlock.el.querySelector('textarea');
             if (!ta) {
                 renderedBlock.el.innerHTML = '';
                 ta = document.createElement('textarea');
                 ta.style.width = '100%';
                 ta.setAttribute('data-node-id', textState.id);
                 renderedBlock.el.appendChild(ta);
                 this.renderedNodes.set(textState.id, { isBlock: false, textNode: ta });
             }
             if (ta.value !== textState.text) ta.value = textState.text;
             return;
        }

        const el = renderedBlock.el;
        const nextChildIds = new Set(blockState.children.map(c => c.id));

        // Remove old children explicitly from DOM if not in state
        Array.from(el.childNodes).forEach(childDom => {
            const id = childDom.getAttribute('data-node-id');
            if (id && !nextChildIds.has(id)) {
                el.removeChild(childDom);
                this.renderedNodes.delete(id);
            }
        });

        let childDomIndex = 0;
        blockState.children.forEach(textState => {
            let renderedChild = this.renderedNodes.get(textState.id);

            const createChild = () => {
                const wrapper = document.createElement('span');
                wrapper.setAttribute('data-node-id', textState.id);

                const textVal = textState.text === '' ? '\uFEFF' : textState.text;
                const textNode = document.createTextNode(textVal);
                wrapper.appendChild(textNode);

                this.applyMarks(wrapper, textState.marks);
                return { isBlock: false, wrapper, textNode, marks: [...(textState.marks||[])] };
            };

            if (!renderedChild) {
                // Insert
                renderedChild = createChild();
                if (childDomIndex < el.childNodes.length) {
                    el.insertBefore(renderedChild.wrapper, el.childNodes[childDomIndex]);
                } else {
                    el.appendChild(renderedChild.wrapper);
                }
                this.renderedNodes.set(textState.id, renderedChild);
            } else {
                // Move
                if (el.childNodes[childDomIndex] !== renderedChild.wrapper) {
                    el.insertBefore(renderedChild.wrapper, el.childNodes[childDomIndex]);
                }

                // Update Text
                const expectedText = textState.text === '' ? '\uFEFF' : textState.text;
                if (renderedChild.textNode.textContent !== expectedText) {
                    renderedChild.textNode.textContent = expectedText;
                }

                // Update Marks (if changed)
                if (JSON.stringify(renderedChild.marks.sort()) !== JSON.stringify([...(textState.marks||[])].sort())) {
                    this.applyMarks(renderedChild.wrapper, textState.marks);
                    renderedChild.marks = [...(textState.marks||[])];
                }
            }

            childDomIndex++;
        });
    }

    applyMarks(el, marks) {
        el.style.fontWeight = 'normal';
        el.style.fontStyle = 'normal';
        el.style.textDecoration = 'none';

        if (!marks) return;
        if (marks.includes('bold')) el.style.fontWeight = 'bold';
        if (marks.includes('italic')) el.style.fontStyle = 'italic';
        if (marks.includes('underline')) el.style.textDecoration = 'underline';
    }

    restoreSelection(state) {
        const { anchor, focus } = state.selection;
        if (!anchor || !focus || !anchor.nodeId || !focus.nodeId) return;

        try {
            const anchorNodeData = this.renderedNodes.get(anchor.nodeId);
            const focusNodeData = this.renderedNodes.get(focus.nodeId);

            if (!anchorNodeData || !focusNodeData) return;

            const sel = window.getSelection();
            const range = document.createRange();

            // Handle textarea special case
            if (anchorNodeData.textNode instanceof HTMLTextAreaElement) {
                anchorNodeData.textNode.focus();
                anchorNodeData.textNode.setSelectionRange(anchor.offset, focus.offset);
                return;
            }

            const aTextNode = anchorNodeData.textNode;
            const fTextNode = focusNodeData.textNode;

            const aOffset = aTextNode.textContent === '\uFEFF' ? 0 : Math.min(anchor.offset, aTextNode.length);
            const fOffset = fTextNode.textContent === '\uFEFF' ? 0 : Math.min(focus.offset, fTextNode.length);

            range.setStart(aTextNode, aOffset);
            range.setEnd(fTextNode, fOffset);

            sel.removeAllRanges();
            sel.addRange(range);
        } catch(e) {
            // Safe fallback during highly destructive concurrent edits
        }
    }
}
