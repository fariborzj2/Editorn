import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: './', // Use relative paths so it works on any subdirectory (like GitHub Pages repo/project)
  build: {
    outDir: 'dist-site',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  }
});
