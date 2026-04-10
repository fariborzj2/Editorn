export const TransactionTypes = {
  INSERT_TEXT: 'INSERT_TEXT',
  DELETE_RANGE: 'DELETE_RANGE',
  MERGE_BLOCKS: 'MERGE_BLOCKS',
  SPLIT_BLOCK: 'SPLIT_BLOCK',
  REPLACE_BLOCK: 'REPLACE_BLOCK',
  SET_SELECTION: 'SET_SELECTION'
};

export class Transaction {
  constructor(type, payload = {}) {
    this.type = type;
    this.payload = payload;
  }
}
