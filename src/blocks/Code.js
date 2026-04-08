export class Code {
  constructor({ data, api }) {
    this.data = data || { code: '', language: 'javascript' };
    this.api = api;
    this.wrapper = undefined;
    this.textarea = undefined;
    this.langSelect = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('editorn-block-code');

    // Simple UI with a language selector and textarea for code
    this.langSelect = document.createElement('select');
    this.langSelect.innerHTML = `<option value="javascript">JavaScript</option><option value="html">HTML</option><option value="css">CSS</option>`;
    this.langSelect.value = this.data.language;

    this.textarea = document.createElement('textarea');
    this.textarea.value = this.data.code;
    this.textarea.placeholder = 'Write code here...';

    this.wrapper.appendChild(this.langSelect);
    this.wrapper.appendChild(this.textarea);

    return this.wrapper;
  }

  save() {
    return {
      code: this.textarea.value,
      language: this.langSelect.value
    };
  }

  validate(savedData) {
    return !!savedData.code.trim();
  }
}
