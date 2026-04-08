import { describe, it, expect, vi } from 'vitest';
import { PluginManager } from '../core/PluginManager';

describe('PluginManager', () => {
  it('should register a plugin and call init', () => {
    const editorMock = {};
    const manager = new PluginManager(editorMock);

    const initMock = vi.fn();
    class MockPlugin {
      constructor({ api, config }) {
        this.api = api;
        this.config = config;
      }
      init() {
        initMock();
      }
    }

    manager.register('mock', MockPlugin, { option: true });

    const plugin = manager.get('mock');
    expect(plugin).toBeInstanceOf(MockPlugin);
    expect(plugin.config.option).toBe(true);
    expect(initMock).toHaveBeenCalled();
  });

  it('should not register invalid plugins', () => {
    const manager = new PluginManager({});

    // Suppress console.warn for this test
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    manager.register('invalid', null);
    expect(manager.get('invalid')).toBeUndefined();
    expect(consoleWarnSpy).toHaveBeenCalled();

    consoleWarnSpy.mockRestore();
  });

  it('should destroy all plugins correctly', () => {
    const manager = new PluginManager({});

    const destroyMock1 = vi.fn();
    class Plugin1 { destroy() { destroyMock1(); } }

    const destroyMock2 = vi.fn();
    class Plugin2 { destroy() { destroyMock2(); } }

    manager.register('p1', Plugin1);
    manager.register('p2', Plugin2);

    manager.destroy();

    expect(destroyMock1).toHaveBeenCalled();
    expect(destroyMock2).toHaveBeenCalled();
    expect(manager.plugins.size).toBe(0);
  });
});
