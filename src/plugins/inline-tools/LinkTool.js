import { BaseInlineTool } from './BaseInlineTool.js';

export class LinkTool extends BaseInlineTool {
  getIcon() {
    return `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;
  }

  getTitle() {
    return 'Link';
  }

  isActiveOnNode(node) {
    return node.nodeName === 'A';
  }

  createWrapper(url = '#') {
    const a = document.createElement('a');
    // Basic sanitization: only allow http/https/mailto/tel or relative urls. No javascript: or data:
    const sanitizedUrl = url.trim();
    if (/^(javascript|data|vbscript):/i.test(sanitizedUrl)) {
        a.href = '#';
    } else {
        a.href = sanitizedUrl;
    }
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    return a;
  }

  surround() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    if (range.collapsed) return;

    let element = range.commonAncestorContainer;
    element = element.nodeType === Node.ELEMENT_NODE ? element : element.parentElement;

    let unwrappingNode = null;
    while (element && this.api.container.contains(element) && element !== this.api.container) {
        if (this.isActiveOnNode(element)) {
            unwrappingNode = element;
            break;
        }
        element = element.parentElement;
    }

    if (unwrappingNode) {
       // Unwrap (remove link)
       const parent = unwrappingNode.parentNode;

       const firstChild = unwrappingNode.firstChild;
       const lastChild = unwrappingNode.lastChild;

       while (unwrappingNode.firstChild) {
           parent.insertBefore(unwrappingNode.firstChild, unwrappingNode);
       }
       parent.removeChild(unwrappingNode);

       if (firstChild && lastChild) {
           const newSelection = window.getSelection();
           newSelection.removeAllRanges();
           const newRange = document.createRange();
           newRange.setStartBefore(firstChild);
           newRange.setEndAfter(lastChild);
           newSelection.addRange(newRange);
       }

       this.api.triggerChange();
       this.checkState(window.getSelection());
    } else {
       // Wrap (add link)
       const url = prompt('Enter link URL:');
       if (url) {
           const extractedContent = range.extractContents();
           const wrapper = this.createWrapper(url);
           wrapper.appendChild(extractedContent);
           range.insertNode(wrapper);

           if (wrapper.innerHTML === '') {
               wrapper.remove();
           } else {
               const newSelection = window.getSelection();
               newSelection.removeAllRanges();
               const newRange = document.createRange();
               newRange.selectNodeContents(wrapper);
               newSelection.addRange(newRange);
           }

           this.api.triggerChange();
           this.checkState(window.getSelection());
       }
    }
  }
}
