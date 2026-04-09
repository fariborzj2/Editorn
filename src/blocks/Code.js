export class Code {
  constructor({ data, api }) {
    this.data = {
      code: data && data.code ? data.code : '',
      language: data && data.language ? data.language : 'javascript'
    };
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
    this.textarea.style.width = '100%';
    this.textarea.style.minHeight = '100px';
    this.textarea.style.fontFamily = 'monospace';

    // Handle tab key to insert spaces instead of moving focus
    this.textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = this.textarea.selectionStart;
            const end = this.textarea.selectionEnd;
            this.textarea.value = this.textarea.value.substring(0, start) + "  " + this.textarea.value.substring(end);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;
            this.api.triggerChange();
        }
    });

    // Trigger changes on input and language change
    this.textarea.addEventListener('input', () => this.api.triggerChange());
    this.langSelect.addEventListener('change', () => this.api.triggerChange());

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
