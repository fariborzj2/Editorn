import { Sanitizer } from '../utils/Sanitizer.js';

export class List {
  constructor({ data, api }) {
    this.data = data || { style: 'unordered', items: [''] };
    this.api = api;
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement(this.data.style === 'ordered' ? 'ol' : 'ul');
    this.wrapper.classList.add('editorn-block-list');

    this.data.items.forEach(item => {
      const li = document.createElement('li');
      li.contentEditable = true;
      li.innerHTML = item ? Sanitizer.sanitize(item) : '<br>';
      li.addEventListener('input', () => {
        if (li.innerHTML === '') li.innerHTML = '<br>';
        this.api.triggerChange();
      });
      // Handle enter key locally to add new list items
      li.addEventListener('keydown', (e) => this.handleKeydown(e, li));
      this.wrapper.appendChild(li);
    });

    if (this.data.items.length === 0) {
      const li = document.createElement('li');
      li.contentEditable = true;
      li.innerHTML = '<br>';
      li.addEventListener('input', () => {
        if (li.innerHTML === '') li.innerHTML = '<br>';
        this.api.triggerChange();
      });
      li.addEventListener('keydown', (e) => this.handleKeydown(e, li));
      this.wrapper.appendChild(li);
    }

    return this.wrapper;
  }

  handleKeydown(e, li) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      const newLi = document.createElement('li');
      newLi.contentEditable = true;
      newLi.innerHTML = '<br>';
      newLi.addEventListener('input', () => {
        if (newLi.innerHTML === '') newLi.innerHTML = '<br>';
        this.api.triggerChange();
      });
      newLi.addEventListener('keydown', (e2) => this.handleKeydown(e2, newLi));
      this.wrapper.insertBefore(newLi, li.nextSibling);
      newLi.focus();
    } else if (e.key === 'Backspace' && li.innerHTML === '<br>' && this.wrapper.children.length > 1) {
      e.preventDefault();
      e.stopPropagation();
      const prevLi = li.previousElementSibling;
      li.remove();
      if (prevLi) prevLi.focus();
    }
  }

  save(blockContent) {
    const items = Array.from(blockContent.children).map(li => {
      let html = li.innerHTML;
      if (html === '<br>') html = '';
      return Sanitizer.sanitize(html);
    }).filter(text => text.trim() !== '');

    return {
      style: this.wrapper.tagName === 'OL' ? 'ordered' : 'unordered',
      items: items
    };
  }

  validate(savedData) {
    return savedData.items.length > 0;
  }
}
