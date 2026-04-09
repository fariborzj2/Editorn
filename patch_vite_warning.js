const fs = require('fs');
let code = fs.readFileSync('src/blocks/Code.js', 'utf8');

code = code.replace(
`      // Load specific language if not already loaded (html, css, js are usually bundled)
      if (!this.Prism.languages[lang]) {
        try {
          await import(/* @vite-ignore */ \`prismjs/components/prism-\${lang}.js\`);
        } catch (e) {
          console.warn(\`Failed to load PrismJS language component: \${lang}\`, e);
        }
      }`,
`      // Load specific language if not already loaded (html, css, js are usually bundled)
      if (!this.Prism.languages[lang]) {
        try {
          // Explicit mapping for Vite static analysis
          const langMap = {
            'python': () => import('prismjs/components/prism-python.js'),
            'java': () => import('prismjs/components/prism-java.js'),
            'c': () => import('prismjs/components/prism-c.js'),
            'cpp': () => import('prismjs/components/prism-cpp.js'),
            'csharp': () => import('prismjs/components/prism-csharp.js'),
            'php': () => import('prismjs/components/prism-php.js'),
            'sql': () => import('prismjs/components/prism-sql.js'),
            'bash': () => import('prismjs/components/prism-bash.js'),
            'json': () => import('prismjs/components/prism-json.js'),
            'typescript': () => import('prismjs/components/prism-typescript.js')
          };
          if (langMap[lang]) {
             await langMap[lang]();
          }
        } catch (e) {
          console.warn(\`Failed to load PrismJS language component: \${lang}\`, e);
        }
      }`
);

fs.writeFileSync('src/blocks/Code.js', code);
