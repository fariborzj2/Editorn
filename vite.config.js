import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      // Multiple entry points to bundle adapters correctly
      entry: {
        editorn: resolve(__dirname, 'src/index.js'),
        'adapters/react': resolve(__dirname, 'src/adapters/react/EditornReact.jsx'),
        'adapters/vue': resolve(__dirname, 'src/adapters/vue/EditornVue.js')
      },
      name: 'Editorn',
      fileName: (format, entryName) => {
        if (format === 'es') return `${entryName}.mjs`;
        if (format === 'cjs') return `${entryName}.cjs`;
        return `${entryName}.js`;
      }
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: ['react', 'react/jsx-runtime', 'vue'],
      output: {
        exports: 'named',
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: 'React',
          vue: 'Vue'
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
  }
});
