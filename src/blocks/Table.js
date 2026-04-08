export class Table {
  constructor({ data, api }) {
    this.data = data || { content: [['', ''], ['', '']] }; // Default 2x2 table
    this.api = api;
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('editorn-block-table');
    // Basic Boilerplate UI rendering
    this.wrapper.innerHTML = `<table border="1"><tbody><tr><td contenteditable="true"></td><td contenteditable="true"></td></tr><tr><td contenteditable="true"></td><td contenteditable="true"></td></tr></tbody></table>`;
    return this.wrapper;
  }

  save() {
    // Logic to extract data from table cells
    return {
      content: this.data.content
    };
  }

  validate(savedData) {
    return true; // Simple validation
  }
}
