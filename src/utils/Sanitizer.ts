import DOMPurify from 'dompurify';

export class Sanitizer {
  static clean(html: string): string {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'br', 'span', 'code', 'sup', 'sub', 'strong', 'em'],
      ALLOWED_ATTR: ['href', 'target', 'class', 'data-id']
    });
  }

  // Less strict for block containers or paste handling
  static cleanBlock(html: string): string {
      return DOMPurify.sanitize(html, {
          ALLOWED_TAGS: ['b', 'i', 'u', 'a', 'br', 'span', 'code', 'sup', 'sub', 'strong', 'em',
                         'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote', 'img', 'table', 'tr', 'td', 'th', 'div'],
          ALLOWED_ATTR: ['href', 'target', 'class', 'src', 'alt', 'data-id']
      });
  }
}
