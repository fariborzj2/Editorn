import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class List implements IBlock {
  public id: string;
  public type: string = 'list';
  private element: HTMLElement;
  private editor: Editron;
  private style: 'ordered' | 'unordered';
  private listElement: HTMLUListElement | HTMLOListElement;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.style = data.style === 'ordered' ? 'ordered' : 'unordered';
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const items = data.items || [''];

    this.listElement = document.createElement(this.style === 'ordered' ? 'ol' : 'ul');
    this.listElement.classList.add('ce-list');

    items.forEach((itemText: string) => {
        this.addListItem(itemText);
    });

    this.element.appendChild(this.listElement);
  }

  addListItem(text: string = '', focus: boolean = false) {
      const li = document.createElement('li');
      li.classList.add('ce-list-item');
      li.contentEditable = 'true';
      li.innerHTML = text;

      this.attachEvents(li);
      this.listElement.appendChild(li);

      if (focus) {
          li.focus();
      }
  }

  attachEvents(li: HTMLElement) {
      li.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              const content = li.textContent;
              if (content === '') {
                  // Empty item + Enter = Exit list
                  // If this is the only item, convert block to paragraph
                  // If last item, remove it and add paragraph after
                  if (this.listElement.children.length === 1) {
                      this.editor.blockManager.replaceBlock(this.id, 'paragraph');
                  } else {
                      li.remove();
                      // Split list logic is complex. For now, if we are at the end (or not), we just insert paragraph after this list block.
                      // Ideally if in middle, we should split the list block into two.
                      // For this phase, we assume simple exit behavior: insert paragraph after list.
                      const newBlock = this.editor.blockManager.addBlock('paragraph', {}, true, this.id);
                      if(newBlock) newBlock.focus();
                  }
              } else {
                  this.addListItem('', true);
              }
          } else if (e.key === 'Backspace' && li.textContent === '') {
              // Handle backspace on empty item
              e.preventDefault();
              const prev = li.previousElementSibling as HTMLElement;
              if (prev) {
                  li.remove();
                  // Move cursor to end of prev
                  const range = document.createRange();
                  range.selectNodeContents(prev);
                  range.collapse(false);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              } else {
                 // First item empty, convert to paragraph? or remove list if only item?
                 if (this.listElement.children.length === 1) {
                     this.editor.blockManager.replaceBlock(this.id, 'paragraph');
                 }
              }
          }
      });
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
    const items = Array.from(this.listElement.querySelectorAll('.ce-list-item'))
        .map(li => li.innerHTML);

    return {
      id: this.id,
      type: this.type,
      content: {
        style: this.style,
        items: items
      }
    };
  }

  focus(): void {
      const firstItem = this.listElement.querySelector('.ce-list-item') as HTMLElement;
      if (firstItem) {
          firstItem.focus();
      }
  }
}
