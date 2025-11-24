# Editron API Reference

## Configuration (`EditronConfig`)

When initializing `Editron`, you pass a configuration object:

```typescript
interface EditronConfig {
  holder: string | HTMLElement;    // ID of the element or the element itself
  data?: BlockData[];              // Initial content blocks
  placeholder?: string;            // Placeholder text for empty editor
  theme?: 'light' | 'dark';        // UI Theme
  locale?: string;                 // 'en' or 'fa' (supports RTL automatically)
  i18n?: Record<string, any>;      // Custom translations overrides
  onImageUpload?: (file: File) => Promise<string>; // Async handler for image uploads
}
```

## Core Methods

### `editor.save(): Promise<BlockData[]>`
Saves the current content of the editor and returns a promise resolving to an array of block data.

### `editor.init(): void`
Initializes the editor, renders initial blocks, and sets up event listeners.

### `editor.on(event: string, callback: Function)`
Subscribes to editor events.
- `change`: Fired when content changes.
- `block:add`: Fired when a block is added.
- `block:remove`: Fired when a block is removed.
- `block:move`: Fired when a block is moved.

### `editor.t(key: string): string`
Returns a localized string for the given key (e.g., `ui.placeholder`).

## Block Interface (`IBlock`)

Custom blocks must implement this interface:

```typescript
interface IBlock {
  id: string;
  type: string;
  render(): HTMLElement;   // Returns the DOM element for the block
  save(): BlockData;       // Returns the JSON data for the block
  focus(): void;           // Focuses the block (e.g. input field)
}
```

## Plugin Interface (`IPlugin`)

Plugins must implement this interface:

```typescript
interface IPlugin {
  name: string;
  init(editor: Editron): void; // Called when editor initializes
  destroy?(): void;            // Called when editor is destroyed
}
```
