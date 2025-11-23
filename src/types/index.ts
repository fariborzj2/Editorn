export interface BlockData {
  type: string;
  id: string;
  content: any;
}

export interface IBlock {
  id: string;
  type: string;
  render(): HTMLElement;
  save(): BlockData;
  focus(): void;
}

export interface IPlugin {
  name: string;
  init(editor: any): void;
  destroy?(): void;
}

export interface EditronConfig {
  holder: string | HTMLElement;
  data?: BlockData[];
  placeholder?: string;
  theme?: 'light' | 'dark';
}
