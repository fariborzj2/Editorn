import { BlockData } from '../types';

export class Exporter {
    static toMarkdown(blocks: BlockData[]): string {
        return blocks.map(block => {
            switch (block.type) {
                case 'paragraph':
                    return block.content.text + '\n\n';
                case 'header':
                    const level = '#'.repeat(block.content.level);
                    return `${level} ${block.content.text}\n\n`;
                case 'list':
                    const items = block.content.items;
                    const style = block.content.style;
                    return items.map((item: string, index: number) => {
                        const prefix = style === 'ordered' ? `${index + 1}.` : '-';
                        return `${prefix} ${item}`;
                    }).join('\n') + '\n\n';
                case 'quote':
                    return `> ${block.content.text}\n\n`;
                case 'image':
                    return `![${block.content.caption || 'image'}](${block.content.url})\n\n`;
                case 'divider':
                    return '---\n\n';
                case 'code':
                    return '```\n' + block.content.code + '\n```\n\n';
                case 'table':
                    const rows = block.content.content;
                    if (!rows || rows.length === 0) return '';
                    // Simple Markdown Table
                    // | Col 1 | Col 2 |
                    // | --- | --- |
                    // | Val 1 | Val 2 |
                    const header = '| ' + rows[0].map(() => '   ').join(' | ') + ' |\n';
                    const divider = '| ' + rows[0].map(() => '---').join(' | ') + ' |\n';
                    const body = rows.map((row: string[]) => '| ' + row.join(' | ') + ' |').join('\n');
                    return header + divider + body + '\n\n';
                default:
                    return '';
            }
        }).join('').trim();
    }

    static toHTML(blocks: BlockData[]): string {
        return blocks.map(block => {
            switch (block.type) {
                case 'paragraph':
                    return `<p>${block.content.text}</p>`;
                case 'header':
                    return `<h${block.content.level}>${block.content.text}</h${block.content.level}>`;
                case 'list':
                    const tag = block.content.style === 'ordered' ? 'ol' : 'ul';
                    const items = block.content.items.map((i: string) => `<li>${i}</li>`).join('');
                    return `<${tag}>${items}</${tag}>`;
                case 'quote':
                    return `<blockquote>${block.content.text}</blockquote>`;
                case 'image':
                    return `<figure><img src="${block.content.url}" alt="${block.content.caption || ''}"><figcaption>${block.content.caption || ''}</figcaption></figure>`;
                case 'divider':
                    return '<hr />';
                case 'code':
                    return `<pre><code>${block.content.code}</code></pre>`;
                case 'table':
                    const tableRows = block.content.content.map((row: string[]) => {
                        const cells = row.map(cell => `<td>${cell}</td>`).join('');
                        return `<tr>${cells}</tr>`;
                    }).join('');
                    return `<table>${tableRows}</table>`;
                default:
                    return '';
            }
        }).join('');
    }
}
