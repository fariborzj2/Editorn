with open('src/plugins/FixedToolbar.js', 'r') as f:
    content = f.read()

# Replace block.title with translation logic
import_str = "import { Bold, Italic, Underline, Link2, Type, Heading, List, Quote, Minus, Image, Video, Table, Code } from 'lucide';\nimport { renderLucideIcon } from '../utils/iconUtils.js';\n"
content = content.replace("import { Bold, Italic, Underline, Link2, Type, Heading, List, Quote, Minus, Image, Video, Table, Code } from 'lucide';\nimport { renderLucideIcon } from '../utils/iconUtils.js';", import_str)

# We need to grab the i18n instance if available
setup_i18n = """
    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
"""

# For availableBlocks, we inject the translation logic
replace_blocks = """
        const availableBlocks = {
            paragraph: { type: 'paragraph', icon: icons.paragraph, title: i18n.t('toolbar.paragraph', 'Paragraph') },
            header: { type: 'header', icon: icons.header, title: i18n.t('toolbar.header', 'Header') },
            list: { type: 'list', icon: icons.list, title: i18n.t('toolbar.list', 'List') },
            quote: { type: 'quote', icon: icons.quote, title: i18n.t('toolbar.quote', 'Quote') },
            divider: { type: 'divider', icon: icons.divider, title: i18n.t('toolbar.divider', 'Divider') },
            image: { type: 'image', icon: icons.image, title: i18n.t('toolbar.image', 'Image') },
            embed: { type: 'embed', icon: icons.embed, title: i18n.t('toolbar.embed', 'Embed') },
            table: { type: 'table', icon: icons.table, title: i18n.t('toolbar.table', 'Table') },
            code: { type: 'code', icon: icons.code, title: i18n.t('toolbar.code', 'Code') }
        };
"""

content = content.replace("""        const availableBlocks = {
            paragraph: { type: 'paragraph', icon: icons.paragraph, title: 'Paragraph' },
            header: { type: 'header', icon: icons.header, title: 'Header' },
            list: { type: 'list', icon: icons.list, title: 'List' },
            quote: { type: 'quote', icon: icons.quote, title: 'Quote' },
            divider: { type: 'divider', icon: icons.divider, title: 'Divider' },
            image: { type: 'image', icon: icons.image, title: 'Image' },
            embed: { type: 'embed', icon: icons.embed, title: 'Embed' },
            table: { type: 'table', icon: icons.table, title: 'Table' },
            code: { type: 'code', icon: icons.code, title: 'Code' }
        };""", setup_i18n + replace_blocks)

with open('src/plugins/FixedToolbar.js', 'w') as f:
    f.write(content)
