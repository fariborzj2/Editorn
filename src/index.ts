import { Editron } from './core/Editron';
import { Toolbar } from './plugins/Toolbar';
import { SlashMenu } from './plugins/SlashMenu';
import { AIAssistant } from './plugins/AIAssistant';
import { Autosave } from './plugins/Autosave';
import './style.scss'; // Assuming you might have one, but we used index.html styles.
// Actually, we should export styles if we were a real library.

// Export core classes
export { Editron } from './core/Editron';
export { BlockManager } from './core/BlockManager';
export { Renderer } from './core/Renderer';

// Export Blocks
export { Paragraph } from './blocks/Paragraph';
export { Header } from './blocks/Header';
export { List } from './blocks/List';
export { Checklist } from './blocks/Checklist';
// ... others

// Export Adapters (optional, usually separate entry points)
// export { EditronReact } from './adapters/EditronReact';

// Initialize for demo if in browser
if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const locale = urlParams.get('locale') || 'en';

    // Check if element exists
    const holder = document.getElementById('editorjs');
    if (holder) {
        const editor = new Editron({
            holder: holder,
            placeholder: locale === 'fa' ? 'شروع به نوشتن کنید...' : 'Let`s write an awesome story!',
            locale: locale,
            data: [] // Let autosave handle it or start empty
        });

        editor.init();

        // Register Plugins
        // The user requested a fixed toolbar, so we use Toolbar instead of InlineToolbar
        editor.pluginManager.register(new Toolbar());
        editor.pluginManager.register(new SlashMenu());
        editor.pluginManager.register(new AIAssistant());
        editor.pluginManager.register(new Autosave());

        // Save button handler
        document.getElementById('save-btn')?.addEventListener('click', () => {
            editor.save().then((outputData) => {
                console.log('Article data: ', outputData);
                alert('Data saved! Check console.');
            });
        });

        // Debug
        (window as any).editor = editor;
    }
}
