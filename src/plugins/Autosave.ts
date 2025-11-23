import { IPlugin } from '../types';
import { Editron } from '../core/Editron';

export class Autosave implements IPlugin {
  public name: string = 'autosave';
  private editor: Editron | null = null;
  private storageKey: string = 'editron_autosave_data';
  private debounceTimer: number | null = null;
  private interval: number = 2000; // Save every 2 seconds max

  init(editor: Editron): void {
    this.editor = editor;
    this.restore();

    this.editor.on('change', () => {
        this.requestSave();
    });
  }

  requestSave() {
      if (this.debounceTimer) {
          clearTimeout(this.debounceTimer);
      }
      this.debounceTimer = window.setTimeout(() => {
          this.save();
      }, this.interval);
  }

  save() {
      if (this.editor) {
          this.editor.save().then(data => {
              localStorage.setItem(this.storageKey, JSON.stringify(data));
              console.log('Editron: Data autosaved');
          });
      }
  }

  restore() {
      const data = localStorage.getItem(this.storageKey);
      if (data && this.editor) {
          try {
              const blocks = JSON.parse(data);
              if (Array.isArray(blocks) && blocks.length > 0) {
                  console.log('Editron: Restoring autosaved data');
                  this.editor.blockManager.renderBlocks(blocks);
              }
          } catch (e) {
              console.error('Editron: Failed to restore autosaved data', e);
          }
      }
  }

  clear() {
      localStorage.removeItem(this.storageKey);
      console.log('Editron: Autosave data cleared');
  }
}
