import { Editron } from './core/Editron';
import { SlashMenu } from './plugins/SlashMenu';
import { InlineToolbar } from './plugins/InlineToolbar';
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

editor.init();

document.getElementById('save-btn')?.addEventListener('click', () => {
    editor.save().then(data => {
        const output = document.getElementById('output');
        if (output) {
            output.innerText = JSON.stringify(data, null, 2);
        }
    });
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
