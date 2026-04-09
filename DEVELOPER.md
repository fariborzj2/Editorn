# Developer Documentation: Editorn

This document outlines the architecture, APIs, and guidelines for contributing to and extending the Editorn block-based editor.

## Architecture & Bootstrapping

Editorn uses an **Inversion of Control (IoC)** architecture. The core `EditorCore` class handles DOM events and basic operations, while all formatting tools, blocks, and UI elements are injected as **Extensions**.

The initialization flow is declarative, utilizing a central Registry and an asynchronous Bootstrapper:

```javascript
import Editorn from '@editorn/core';

// 1. Register a custom extension
Editorn.register('my-plugin', MyPluginClass, { type: 'plugin', requires: ['bold'] });

// 2. Initialize the editor
Editorn.init({
  selector: '#editor',
  plugins: ['bold', 'italic', 'my-plugin'],
  toolbar: "bold italic | my-plugin"
});
```

### Dependency Management

The `ExtensionRegistry` uses Topological Sorting to automatically resolve and load dependencies. If a requested plugin requires another tool (e.g., `'requires': ['bold']`), the system ensures the required tool is initialized first.

## Extension Context

To enforce security and strict architectural boundaries, plugins do not receive direct access to the `EditorCore` instance. Instead, they receive an `ExtensionContext` that provides a safe, limited facade for interacting with the editor:

- `context.ui.container`: The main editor DOM element.
- `context.model.insertBlock()`: Safely create new blocks.
- `context.model.getBlocks()`: Retrieve the current block state.

## Writing an Extension

All new blocks, tools, and plugins should adhere to the `BaseExtension` contract:

```javascript
import { BaseExtension } from '@editorn/core';

class CustomExtension extends BaseExtension {
  async init() {
    // Initial setup, event listener registration.
    // The ExtensionContext is available at this.context
  }

  async mount() {
    // DOM rendering logic, injecting UI into the toolbar or container
  }

  update(newOptions) {
    // Handle dynamic config updates
  }

  destroy() {
    // Clean up event listeners and DOM elements
  }
}
```

## Legacy Compatibility

For backwards compatibility with early-phase plugins, the bootstrapper bridges the `ExtensionContext` to emulate the old `{ api, config }` signature. Older plugins that expect `this.api.container` will continue to function seamlessly.

## Testing and Verification

- The project uses `vitest` for unit testing. Use `npm test` to run tests.
- After implementing UI changes, verify using the Python Playwright scripts.
