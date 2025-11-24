import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

interface ChecklistItem {
    text: string;
    checked: boolean;
}

export class Checklist implements IBlock {
  public id: string;
  public type: string = 'checklist';
  private element: HTMLElement;
  private editor: Editron;
  private container: HTMLDivElement;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    this.container = document.createElement('div');
    this.container.classList.add('ce-checklist');

    const items: ChecklistItem[] = data.items || [{ text: '', checked: false }];

    items.forEach((item) => {
        this.addItem(item.text, item.checked);
    });

    this.element.appendChild(this.container);
  }

  addItem(text: string = '', checked: boolean = false, focus: boolean = false) {
      const wrapper = document.createElement('div');
      wrapper.classList.add('ce-checklist-item');

      // Checkbox wrapper (custom for better styling control)
      const checkboxWrapper = document.createElement('span');
      checkboxWrapper.classList.add('ce-checklist-checkbox');
      if (checked) checkboxWrapper.classList.add('ce-checklist-checked');

      checkboxWrapper.addEventListener('click', () => {
          checkboxWrapper.classList.toggle('ce-checklist-checked');
          // Optional: Toggle text strikethrough logic here if desired
      });

      // Text input
      const input = document.createElement('div');
      input.classList.add('ce-checklist-text');
      input.contentEditable = 'true';
      input.innerHTML = text;

      this.attachEvents(input, wrapper);

      wrapper.appendChild(checkboxWrapper);
      wrapper.appendChild(input);
      this.container.appendChild(wrapper);

      if (focus) {
          input.focus();
      }
  }

  attachEvents(input: HTMLElement, wrapper: HTMLElement) {
      input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              // Add new item
              this.addItem('', false, true);
          } else if (e.key === 'Backspace' && input.textContent === '') {
              // Handle backspace on empty item
              e.preventDefault();
              const prevWrapper = wrapper.previousElementSibling as HTMLElement;

              if (prevWrapper) {
                  wrapper.remove();
                  const prevInput = prevWrapper.querySelector('.ce-checklist-text') as HTMLElement;
                  if (prevInput) {
                       const range = document.createRange();
                       range.selectNodeContents(prevInput);
                       range.collapse(false);
                       const sel = window.getSelection();
                       sel?.removeAllRanges();
                       sel?.addRange(range);
                  }
              } else {
                  // If first item is empty, maybe convert block to paragraph?
                  if (this.container.children.length === 1) {
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
    const items: ChecklistItem[] = [];
    const wrappers = this.container.querySelectorAll('.ce-checklist-item');

    wrappers.forEach(wrapper => {
        const checkbox = wrapper.querySelector('.ce-checklist-checkbox');
        const text = wrapper.querySelector('.ce-checklist-text');

        items.push({
            text: text ? text.innerHTML : '',
            checked: checkbox ? checkbox.classList.contains('ce-checklist-checked') : false
        });
    });

    return {
      id: this.id,
      type: this.type,
      content: {
        items: items
      }
    };
  }

  focus(): void {
      const firstInput = this.container.querySelector('.ce-checklist-text') as HTMLElement;
      if (firstInput) {
          firstInput.focus();
      }
  }
}
