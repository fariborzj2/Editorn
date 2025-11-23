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
                default:
                    return '';
            }
        }).join('').trim();
    }
}
