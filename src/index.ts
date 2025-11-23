import { Editron } from './core/Editron';
import { SlashMenu } from './plugins/SlashMenu';
import { InlineToolbar } from './plugins/InlineToolbar';
import { Autosave } from './plugins/Autosave';
import { Collaboration } from './plugins/Collaboration';
import { Exporter } from './utils/Exporter';

const editor = new Editron({
  holder: 'editorjs',
  placeholder: 'Let\'s write something awesome!',
  data: [
      {
          type: 'paragraph',
          id: '123',
          content: { text: 'Welcome to Editron! Start typing...' }
      }
  ]
});

editor.pluginManager.register(new SlashMenu());
editor.pluginManager.register(new InlineToolbar());
const autosave = new Autosave();
editor.pluginManager.register(autosave);
editor.pluginManager.register(new Collaboration());

editor.init();

document.getElementById('save-btn')?.addEventListener('click', () => {
    editor.save().then(data => {
        const output = document.getElementById('output');
        if (output) {
            output.innerText = JSON.stringify(data, null, 2);
        }
    });
});

// Theme Handling
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Load saved theme
const savedTheme = localStorage.getItem('editron_theme') || 'light';
html.setAttribute('data-theme', savedTheme);
if (themeToggle) {
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle?.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('editron_theme', newTheme);

    if (themeToggle) {
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    }
});

document.getElementById('clear-storage-btn')?.addEventListener('click', () => {
    autosave.clear();
    alert('Autosave cleared. Reload to see default content.');
});

document.getElementById('export-html-btn')?.addEventListener('click', () => {
    editor.save().then(data => {
        const output = document.getElementById('output');
        if (output) {
            output.innerText = Exporter.toHTML(data);
        }
    });
});

document.getElementById('export-md-btn')?.addEventListener('click', () => {
    editor.save().then(data => {
        const output = document.getElementById('output');
        if (output) {
            output.innerText = Exporter.toMarkdown(data);
        }
    });
});
