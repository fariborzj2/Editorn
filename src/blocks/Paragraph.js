import { Sanitizer } from '../utils/Sanitizer.js';

export class Paragraph {
  constructor({ data, api }) {
    this.data = data;
    this.api = api;
    this.isMergeable = true;
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('editorn-block-paragraph');
    this.wrapper.contentEditable = true;

    // Set initial data or empty paragraph structure
    this.wrapper.innerHTML = this.data.text ? Sanitizer.sanitize(this.data.text) : '<br>';

    // Basic event listeners
    this.wrapper.addEventListener('input', () => {
      // In a real implementation we might debounce this
      if (this.wrapper.innerHTML === '') {
        this.wrapper.innerHTML = '<br>';
      }
            if (this.api && this.api.directionManager) {
        this.api.directionManager.applyToElement(this.wrapper, this.wrapper.innerText || this.wrapper.textContent);
      }
      this.api.triggerChange();
    });


    if (this.api && this.api.directionManager) {
      this.api.directionManager.applyToElement(this.wrapper, this.wrapper.innerText || this.wrapper.textContent);
    }
    return this.wrapper;
  }

  save(blockContent) {
    // Return the HTML content of the block
    let html = blockContent.innerHTML;
    if (html === '<br>') {
      html = '';
    }
    return {
      text: Sanitizer.sanitize(html)
    };
  }

  validate(savedData) {
    if (!savedData.text || !savedData.text.trim()) {
      return false; // Can decide whether to discard empty blocks on save
    }
    return true;
  }
}
