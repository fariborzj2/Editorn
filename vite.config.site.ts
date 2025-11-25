import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/Editorn/', // مسیر صحیح برای GitHub Pages
  build: {
    outDir: 'dist-site', // خروجی را اینجا بفرست تا با خروجی کلونت هماهنگ باشد
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html') // اگر index.html در روت است
      }
    }
  }
});
