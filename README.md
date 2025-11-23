# Editron

A Next-Generation Modular, AI-Native Rich Text Editor for the Modern Web.

## Features

- **Block-based Architecture:** Everything is a block (Paragraph, Header, List, Image, Code, Table, etc.).
- **Extensible:** Plugin system for custom tools and behaviors.
- **Collaboration:** Real-time sync support (BroadcastChannel implemented, scalable to WebSockets).
- **AI Integration:** Built-in AI Assistant hooks.
- **Framework Agnostic:** Adapters for React and Vue included.
- **Modern Tooling:** Written in TypeScript, built with Vite.

## Installation

```bash
npm install editron
```

## Usage

### Vanilla JS

```typescript
import { Editron } from 'editron';

const editor = new Editron({
  holder: 'editorjs',
  placeholder: 'Start writing...'
});

editor.init();
```

### React

```tsx
import { EditronReact } from 'editron/react';

function App() {
  return <EditronReact />;
}
```

### Vue

```html
<script setup>
import EditronVue from 'editron/vue';
</script>

<template>
  <EditronVue />
</template>
```

## Development

### Setup

```bash
npm install
```

### Dev Server

```bash
npm run dev
```

### Build Library

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

## Documentation

See [TUTORIAL_FA.md](./TUTORIAL_FA.md) for a comprehensive guide (in Persian) on how this editor was built from scratch.
