import { Sanitizer } from '../utils/Sanitizer.js';

export class Code {
  constructor({ data, api }) {
    this.data = {
      code: data && data.code ? data.code : '',
      language: data && data.language ? data.language : 'javascript'
    };
    this.api = api;
    this.isMergeable = false;
    this.wrapper = undefined;
    this.textarea = undefined;
    this.pre = undefined;
    this.codeEl = undefined;
    this.langSelect = undefined;
    this.Prism = null;
    this.debounceTimer = null;

    // Load CSS
    if (!document.getElementById('editorn-code-block-css')) {
      const style = document.createElement('style');
      style.id = 'editorn-code-block-css';
      style.textContent = `
.editorn-block-code { position: relative; background: #2d2d2d; border-radius: 6px; margin: 1em 0; overflow: hidden; direction: ltr; text-align: left; }
.editorn-block-code-header { display: flex; justify-content: flex-end; padding: 6px 12px; background: #1e1e1e; border-bottom: 1px solid #333; }
.editorn-block-code select { background: #333; color: #fff; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer; }
.editorn-block-code-editor { position: relative; min-height: 120px; font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace; font-size: 14px; line-height: 1.5; }
.editorn-block-code-textarea, .editorn-block-code-pre { width: 100%; height: 100%; min-height: 120px; margin: 0; padding: 15px; border: none; font-family: inherit; font-size: inherit; line-height: inherit; white-space: pre; overflow: auto; box-sizing: border-box; }
.editorn-block-code-textarea { position: absolute; top: 0; left: 0; background: transparent; color: transparent; caret-color: #fff; resize: none; z-index: 2; outline: none; }
.editorn-block-code-pre { position: relative; background: transparent; color: #ccc; pointer-events: none; z-index: 1; }
/* Minimal Prism Core Theme fallback */
.token.comment, .token.prolog, .token.doctype, .token.cdata { color: #808080; }
.token.punctuation { color: #d4d4d4; }
.token.namespace { opacity: .7; }
.token.property, .token.tag, .token.boolean, .token.number, .token.constant, .token.symbol, .token.deleted { color: #b5cea8; }
.token.selector, .token.attr-name, .token.string, .token.char, .token.builtin, .token.inserted { color: #ce9178; }
.token.operator, .token.entity, .token.url, .language-css .token.string, .style .token.string { color: #d4d4d4; }
.token.atrule, .token.attr-value, .token.keyword { color: #569cd6; }
.token.function, .token.class-name { color: #dcdcaa; }
.token.regex, .token.important, .token.variable { color: #d16969; }
      `;
      document.head.appendChild(style);
    }
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('editorn-block-code');
    this.wrapper.contentEditable = false;

    // Header with language selector
    const header = document.createElement('div');
    header.classList.add('editorn-block-code-header');

    this.langSelect = document.createElement('select');
    const languages = [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'html', label: 'HTML/XML' },
      { value: 'css', label: 'CSS' },
      { value: 'python', label: 'Python' },
      { value: 'java', label: 'Java' },
      { value: 'c', label: 'C' },
      { value: 'cpp', label: 'C++' },
      { value: 'csharp', label: 'C#' },
      { value: 'php', label: 'PHP' },
      { value: 'sql', label: 'SQL' },
      { value: 'bash', label: 'Bash/Shell' },
      { value: 'json', label: 'JSON' },
      { value: 'typescript', label: 'TypeScript' }
    ];

    languages.forEach(lang => {
      const option = document.createElement('option');
      option.value = lang.value;
      option.textContent = lang.label;
      if (lang.value === this.data.language) {
        option.selected = true;
      }
      this.langSelect.appendChild(option);
    });

    this.langSelect.addEventListener('change', () => {
      this.data.language = this.langSelect.value;
      this.loadPrismAndHighlight();
      this.api.triggerChange();
    });

    header.appendChild(this.langSelect);

    // Editor Area
    const editorArea = document.createElement('div');
    editorArea.classList.add('editorn-block-code-editor');

    this.textarea = document.createElement('textarea');
    this.textarea.classList.add('editorn-block-code-textarea');
    this.textarea.value = this.data.code;
    this.textarea.spellcheck = false;

    this.pre = document.createElement('pre');
    this.pre.classList.add('editorn-block-code-pre');

    this.codeEl = document.createElement('code');
    this.codeEl.className = `language-${this.data.language}`;

    this.pre.appendChild(this.codeEl);

    // Synchronize scrolling
    this.textarea.addEventListener('scroll', () => {
      this.pre.scrollTop = this.textarea.scrollTop;
      this.pre.scrollLeft = this.textarea.scrollLeft;
    });

    // Handle input and update highlighting with debounce
    this.textarea.addEventListener('input', () => {
      this.data.code = this.textarea.value;

      // Update immediately to prevent lag for small inputs, but use debounce for large inputs or heavy operations
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.updateHighlight();
      }, 150); // 150ms debounce for performance on large code blocks

      this.api.triggerChange();
    });

    // Handle Tab key
    this.textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.textarea.selectionStart;
        const end = this.textarea.selectionEnd;

        // Insert 2 spaces
        this.textarea.value = this.textarea.value.substring(0, start) + "  " + this.textarea.value.substring(end);
        this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;

        this.data.code = this.textarea.value;
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.updateHighlight(); // update immediately on tab
        this.api.triggerChange();
      }
    });

    editorArea.appendChild(this.textarea);
    editorArea.appendChild(this.pre);

    this.wrapper.appendChild(header);
    this.wrapper.appendChild(editorArea);

    // Initial highlight
    this.updateHighlight(); // update text immediately
    this.loadPrismAndHighlight(); // load prism async

    return this.wrapper;
  }

  updateHighlight() {
    // Escape HTML to prevent XSS in the underlying pre/code
    const escapedCode = this.escapeHtml(this.data.code || '');

    // Add trailing newline to match textarea height correctly when ending with newlines
    const formattedCode = escapedCode + (escapedCode.endsWith('\n') ? ' ' : '');

    if (this.Prism && this.Prism.languages[this.data.language]) {
      this.codeEl.innerHTML = this.Prism.highlight(this.data.code, this.Prism.languages[this.data.language], this.data.language);
    } else {
      this.codeEl.innerHTML = formattedCode;
    }
  }

  escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
  }

  async loadPrismAndHighlight() {
    try {
      if (!this.Prism) {
        // Dynamically load prismjs core
        const prismModule = await import('prismjs');
        // Prism is attached to window globally by default or returned as default export
        this.Prism = prismModule.default || window.Prism || prismModule;

        // In some environments, Prism might be attached to window without default export
        if (!this.Prism && window.Prism) {
             this.Prism = window.Prism;
        }
      }

      if (!this.Prism) {
         console.warn('Prism object not found after import.');
         return;
      }

      const lang = this.data.language;

      // Load specific language if not already loaded (html, css, js are usually bundled)
      if (!this.Prism.languages[lang]) {
        try {
          // Dynamic imports with template literals do not work nicely with Vite/Rollup.
          // Using a static map for the supported languages.
          const loadLang = async (l) => {
             switch (l) {
                case 'python': return await import('prismjs/components/prism-python.js');
                case 'java': return await import('prismjs/components/prism-java.js');
                case 'c': return await import('prismjs/components/prism-c.js');
                case 'cpp': return await import('prismjs/components/prism-cpp.js');
                case 'csharp': return await import('prismjs/components/prism-csharp.js');
                case 'php': return await import('prismjs/components/prism-php.js');
                case 'sql': return await import('prismjs/components/prism-sql.js');
                case 'bash': return await import('prismjs/components/prism-bash.js');
                case 'json': return await import('prismjs/components/prism-json.js');
                case 'typescript': return await import('prismjs/components/prism-typescript.js');
                default: return null;
             }
          };
          await loadLang(lang);
        } catch (e) {
          console.warn(`Failed to load PrismJS language component: ${lang}`, e);
        }
      }

      this.codeEl.className = `language-${lang}`;
      this.updateHighlight();
    } catch (error) {
      console.error('Error loading PrismJS:', error);
    }
  }

  save() {
    return {
      code: this.textarea.value,
      language: this.langSelect.value
    };
  }

  validate(savedData) {
    return !!savedData.code.trim();
  }
}
