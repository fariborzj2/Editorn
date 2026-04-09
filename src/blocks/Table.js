import { Sanitizer } from '../utils/Sanitizer.js';

export class Table {
  constructor({ data, api }) {
    this.data = data && data.content ? data : { content: [['', ''], ['', '']] }; // Default 2x2 table
    this.api = api;
    this.isMergeable = false;
    this.wrapper = undefined;
    this.tableEl = undefined;
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('editorn-block-table');
    this.wrapper.style.position = 'relative';

    this.tableEl = document.createElement('table');
    this.tableEl.border = '1';
    this.tableEl.style.width = '100%';
    this.tableEl.style.borderCollapse = 'collapse';

    const tbody = document.createElement('tbody');
    this.tableEl.appendChild(tbody);

    this.data.content.forEach((row) => {
        const tr = document.createElement('tr');
        row.forEach((cellContent) => {
            const td = this._createCell(cellContent);
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });

    this.wrapper.appendChild(this.tableEl);
    this.wrapper.appendChild(this._createToolbar());

    return this.wrapper;
  }

  _createCell(content = '') {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.innerHTML = content ? Sanitizer.sanitize(content) : '<br>';
      td.style.padding = '8px';
      td.style.border = '1px solid #ccc';
      td.style.minWidth = '50px';

      td.addEventListener('input', () => {
          if (td.innerHTML === '') td.innerHTML = '<br>';
          if (this.api && this.api.directionManager) {
            this.api.directionManager.applyToElement(td, td.innerText || td.textContent);
          }
          this.api.triggerChange();
      });

      if (this.api && this.api.directionManager) {
          this.api.directionManager.applyToElement(td, td.innerText || td.textContent);
      }
      return td;
  }

  _createToolbar() {
      const toolbar = document.createElement('div');
      toolbar.classList.add('editorn-table-toolbar');
      toolbar.style.marginTop = '10px';
      toolbar.style.display = 'flex';
      toolbar.style.gap = '5px';


      const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };

      const addRowBtn = document.createElement('button');
      addRowBtn.textContent = i18n.t('table.addRow', 'Add Row');
      addRowBtn.addEventListener('click', () => this.addRow());

      const addColBtn = document.createElement('button');
      addColBtn.textContent = i18n.t('table.addColumn', 'Add Column');
      addColBtn.addEventListener('click', () => this.addColumn());

      const removeRowBtn = document.createElement('button');
      removeRowBtn.textContent = i18n.t('table.removeRow', 'Remove Row');
      removeRowBtn.addEventListener('click', () => this.removeRow());

      const removeColBtn = document.createElement('button');
      removeColBtn.textContent = i18n.t('table.removeColumn', 'Remove Column');
      removeColBtn.addEventListener('click', () => this.removeColumn());


      toolbar.appendChild(addRowBtn);
      toolbar.appendChild(addColBtn);
      toolbar.appendChild(removeRowBtn);
      toolbar.appendChild(removeColBtn);

      return toolbar;
  }

  addRow() {
      const tbody = this.tableEl.querySelector('tbody');
      const colsCount = tbody.querySelector('tr') ? tbody.querySelector('tr').children.length : 2;
      const tr = document.createElement('tr');
      for (let i = 0; i < colsCount; i++) {
          tr.appendChild(this._createCell());
      }
      tbody.appendChild(tr);
      this.api.triggerChange();
  }

  addColumn() {
      const tbody = this.tableEl.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');
      rows.forEach(row => {
          row.appendChild(this._createCell());
      });
      if (rows.length === 0) {
           const tr = document.createElement('tr');
           tr.appendChild(this._createCell());
           tbody.appendChild(tr);
      }
      this.api.triggerChange();
  }

  removeRow() {
      const tbody = this.tableEl.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');
      if (rows.length > 1) {
          tbody.removeChild(rows[rows.length - 1]);
          this.api.triggerChange();
      }
  }

  removeColumn() {
      const tbody = this.tableEl.querySelector('tbody');
      const rows = tbody.querySelectorAll('tr');
      if (rows.length > 0 && rows[0].children.length > 1) {
          rows.forEach(row => {
              row.removeChild(row.lastElementChild);
          });
          this.api.triggerChange();
      }
  }

  save() {
    const extractedData = [];
    const rows = this.tableEl.querySelectorAll('tr');

    rows.forEach(row => {
        const rowData = [];
        const cells = row.querySelectorAll('td');
        cells.forEach(cell => {
            let html = cell.innerHTML;
            if (html === '<br>') html = '';
            rowData.push(Sanitizer.sanitize(html));
        });
        extractedData.push(rowData);
    });

    return {
      content: extractedData
    };
  }

  validate(savedData) {
    return savedData.content && savedData.content.length > 0 && savedData.content[0].length > 0;
  }
}
