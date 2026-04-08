export class Divider {
  constructor({ data, api }) {
    this.data = data || {};
    this.api = api;
    this.wrapper = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('editorn-block-divider');
    this.wrapper.contentEditable = false;

    const hr = document.createElement('hr');
    this.wrapper.appendChild(hr);

    return this.wrapper;
  }

  save() {
    return {};
  }

  validate() {
    return true;
  }
}
