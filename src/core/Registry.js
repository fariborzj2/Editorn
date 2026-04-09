export class ExtensionRegistry {
  constructor() {
    this.extensions = new Map();
  }

  /**
   * Register an extension.
   * @param {string} name
   * @param {Class | Function} implementation
   * @param {Object} metadata
   */
  register(name, implementation, metadata = {}) {
    this.extensions.set(name, {
      implementation,
      requires: metadata.requires || [],
      type: metadata.type || 'plugin' // plugin, block, tool
    });
  }

  /**
   * Get load order using Topological Sort (DFS)
   * @param {string[]} requestedNames
   * @returns {string[]} Ordered list of extension names
   */
  resolveLoadOrder(requestedNames) {
    const activeList = new Set();
    const result = [];
    const visited = new Set();
    const visiting = new Set();

    // 1. Extract all hidden dependencies recursively
    const addWithDependencies = (name) => {
      if (!this.extensions.has(name)) {
        console.warn(`Extension "${name}" is missing or not registered.`);
        return;
      }
      if (activeList.has(name)) return;
      activeList.add(name);
      const ext = this.extensions.get(name);
      ext.requires.forEach(addWithDependencies);
    };

    requestedNames.forEach(addWithDependencies);

    // 2. Topological Sort
    const sort = (name) => {
      if (visited.has(name)) return;
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected: ${name}`);
      }

      visiting.add(name);
      const ext = this.extensions.get(name);
      if (ext) {
          ext.requires.forEach(sort);
      }
      visiting.delete(name);

      visited.add(name);
      result.push(name);
    };

    activeList.forEach(sort);
    return result;
  }
}

export const GlobalRegistry = new ExtensionRegistry();
