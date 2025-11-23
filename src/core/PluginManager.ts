import { IPlugin } from '../types';
import { Editron } from './Editron';

export class PluginManager {
  private plugins: Map<string, IPlugin> = new Map();
  private editor: Editron;

  constructor(editor: Editron) {
    this.editor = editor;
  }

  register(plugin: IPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin ${plugin.name} is already registered.`);
      return;
    }
    this.plugins.set(plugin.name, plugin);
    plugin.init(this.editor);
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      if (plugin.destroy) {
        plugin.destroy();
      }
      this.plugins.delete(pluginName);
    }
  }

  get(pluginName: string): IPlugin | undefined {
    return this.plugins.get(pluginName);
  }
}
