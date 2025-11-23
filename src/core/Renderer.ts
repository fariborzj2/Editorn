import { Editron } from './Editron';
import { IBlock } from '../types';

export class Renderer {
  private editor: Editron;
  private container: HTMLElement;

  constructor(editor: Editron) {
    this.editor = editor;
    this.container = document.createElement('div');
    this.container.classList.add('editron-wrapper');
    this.editor.holder.appendChild(this.container);
  }

  appendBlock(block: IBlock) {
    const element = this.createBlockWrapper(block);
    this.container.appendChild(element);
  }

  replaceBlock(oldBlock: IBlock, newBlock: IBlock) {
      const oldWrapper = this.container.querySelector(`[data-block-id="${oldBlock.id}"]`);
      if (oldWrapper) {
          const newWrapper = this.createBlockWrapper(newBlock);
          this.container.replaceChild(newWrapper, oldWrapper);
      }
  }

  insertBlockAfter(prevBlock: IBlock, newBlock: IBlock) {
      const prevWrapper = this.container.querySelector(`[data-block-id="${prevBlock.id}"]`);
      const newWrapper = this.createBlockWrapper(newBlock);
      if (prevWrapper && prevWrapper.nextSibling) {
          this.container.insertBefore(newWrapper, prevWrapper.nextSibling);
      } else {
          this.container.appendChild(newWrapper);
      }
  }

  private createBlockWrapper(block: IBlock): HTMLElement {
      const wrapper = document.createElement('div');
      wrapper.classList.add('ce-block-wrapper');
      wrapper.dataset.blockId = block.id;
      wrapper.draggable = true;

      const handle = document.createElement('div');
      handle.classList.add('ce-drag-handle');
      handle.contentEditable = 'false';
      handle.innerHTML = '⋮⋮';

      const content = block.render();
      content.classList.add('ce-block-content');

      wrapper.appendChild(handle);
      wrapper.appendChild(content);

      this.attachDragEvents(wrapper);

      return wrapper;
  }

  private attachDragEvents(wrapper: HTMLElement) {
      wrapper.addEventListener('dragstart', (e) => {
          e.dataTransfer?.setData('text/plain', wrapper.dataset.blockId || '');
          wrapper.classList.add('ce-dragging');
          setTimeout(() => wrapper.classList.add('ce-dragging-ghost'), 0);
      });

      wrapper.addEventListener('dragend', () => {
          wrapper.classList.remove('ce-dragging', 'ce-dragging-ghost');
          this.container.querySelectorAll('.ce-drag-over').forEach(el => el.classList.remove('ce-drag-over'));
      });

      wrapper.addEventListener('dragover', (e) => {
          e.preventDefault();
          const dragging = this.container.querySelector('.ce-dragging');
          if (dragging !== wrapper) {
              wrapper.classList.add('ce-drag-over');
          }
      });

      wrapper.addEventListener('dragleave', () => {
          wrapper.classList.remove('ce-drag-over');
      });

      wrapper.addEventListener('drop', (e) => {
          e.preventDefault();
          wrapper.classList.remove('ce-drag-over');

          const draggedId = e.dataTransfer?.getData('text/plain');
          const targetId = wrapper.dataset.blockId;

          if (draggedId && targetId && draggedId !== targetId) {
              this.editor.blockManager.moveBlock(draggedId, targetId);
          }
      });
  }

  clear() {
      this.container.innerHTML = '';
  }
}
