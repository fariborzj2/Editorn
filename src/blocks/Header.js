import { Sanitizer } from '../utils/Sanitizer.js';

export class Header {
  constructor({ data, api }) {
    this.data = {
      text: data && data.text ? data.text : '',
      level: data && data.level ? data.level : 2
    };
    this.api = api;
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement(`h${this.data.level || 2}`);
    this.wrapper.classList.add('editorn-block-header');
    this.wrapper.contentEditable = true;
    this.wrapper.innerHTML = this.data.text ? Sanitizer.sanitize(this.data.text) : '<br>';

    this.wrapper.addEventListener('input', () => {
      if (this.wrapper.innerHTML === '') {
        this.wrapper.innerHTML = '<br>';
      }
      this.api.triggerChange();
    });

    return this.wrapper;
  }

  save(blockContent) {
    let html = blockContent.innerHTML;
    if (html === '<br>') html = '';
    return {
      text: Sanitizer.sanitize(html),
      level: parseInt(this.wrapper.tagName.replace('H', ''), 10) || 2
    };
  }

  validate(savedData) {
    return !!savedData.text.trim();
  }
}
