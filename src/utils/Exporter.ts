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
                default:
                    return '';
            }
        }).join('');
    }
}
