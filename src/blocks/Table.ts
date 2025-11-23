import { IBlock, BlockData } from '../types';
import { Editron } from '../core/Editron';

export class Table implements IBlock {
  public id: string;
  public type: string = 'table';
  private element: HTMLElement;
  private editor: Editron;
  private table: HTMLTableElement;
  private rows: number;
  private cols: number;

  constructor(id: string, data: any, editor: Editron) {
    this.id = id;
    this.editor = editor;
    this.element = document.createElement('div');
    this.element.classList.add('ce-block');
    this.element.dataset.id = id;

    const content = data.content || [];
    this.rows = content.length > 0 ? content.length : 3;
    this.cols = content[0]?.length > 0 ? content[0].length : 2;

    this.table = document.createElement('table');
    this.table.classList.add('ce-table');

    // Initialize data
    if (content.length > 0) {
        this.renderFromData(content);
    } else {
        this.initTable(this.rows, this.cols);
    }

    // Add controls
    const controls = document.createElement('div');
    controls.classList.add('ce-table-controls');

    const addRowBtn = document.createElement('button');
    addRowBtn.textContent = '+ Row';
    addRowBtn.onclick = () => this.addRow();

    const addColBtn = document.createElement('button');
    addColBtn.textContent = '+ Col';
    addColBtn.onclick = () => this.addCol();

    controls.appendChild(addRowBtn);
    controls.appendChild(addColBtn);

    this.element.appendChild(this.table);
    this.element.appendChild(controls);
  }

  initTable(rows: number, cols: number) {
      this.table.innerHTML = '';
      for (let i = 0; i < rows; i++) {
          const tr = document.createElement('tr');
          for (let j = 0; j < cols; j++) {
              const td = document.createElement('td');
              td.contentEditable = 'true';
              td.classList.add('ce-table-cell');
              tr.appendChild(td);
          }
          this.table.appendChild(tr);
      }
  }

  renderFromData(data: string[][]) {
      this.table.innerHTML = '';
      data.forEach(rowData => {
          const tr = document.createElement('tr');
          rowData.forEach(cellData => {
              const td = document.createElement('td');
              td.contentEditable = 'true';
              td.classList.add('ce-table-cell');
              td.innerHTML = cellData;
              tr.appendChild(td);
          });
          this.table.appendChild(tr);
      });
  }

  addRow() {
      const tr = document.createElement('tr');
      for (let j = 0; j < this.cols; j++) {
          const td = document.createElement('td');
          td.contentEditable = 'true';
          td.classList.add('ce-table-cell');
          tr.appendChild(td);
      }
      this.table.appendChild(tr);
      this.rows++;
      this.editor.emit('change');
  }

  addCol() {
      const rows = this.table.querySelectorAll('tr');
      rows.forEach(tr => {
          const td = document.createElement('td');
          td.contentEditable = 'true';
          td.classList.add('ce-table-cell');
          tr.appendChild(td);
      });
      this.cols++;
      this.editor.emit('change');
  }

  render(): HTMLElement {
    return this.element;
  }

  save(): BlockData {
    const data: string[][] = [];
    const rows = this.table.querySelectorAll('tr');
    rows.forEach(tr => {
        const rowData: string[] = [];
        tr.querySelectorAll('td').forEach(td => {
            rowData.push(td.innerHTML);
        });
        data.push(rowData);
    });

    return {
      id: this.id,
      type: this.type,
      content: {
          content: data
      }
    };
  }

  focus(): void {
      const firstCell = this.table.querySelector('td') as HTMLElement;
      if (firstCell) firstCell.focus();
  }
}
