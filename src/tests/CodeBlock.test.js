import { describe, it, expect, vi } from 'vitest';
import { Code } from '../blocks/Code';

describe('Code Block', () => {
  it('should initialize with default empty values', () => {
    const code = new Code({ api: {} });
    expect(code.data.code).toBe('');
    expect(code.data.language).toBe('javascript');
  });

  it('should sanitize input to prevent XSS in updateHighlight', () => {
    const code = new Code({ data: { code: '<script>alert("xss")</script>' }, api: { triggerChange: () => {} } });
    code.render();
    code.updateHighlight();

    // We expect the <script> to be escaped into &lt;script&gt;
    expect(code.codeEl.innerHTML).toContain('&lt;script&gt;');
    expect(code.codeEl.innerHTML).not.toContain('<script>');
  });

  it('should return valid save data', () => {
    const code = new Code({ data: { code: 'console.log("test");', language: 'python' }, api: { triggerChange: () => {} } });
    code.render();

    const saved = code.save();
    expect(saved.code).toBe('console.log("test");');
    expect(saved.language).toBe('python');
  });

  it('should validate correctly based on empty string', () => {
    const code = new Code({ api: {} });
    expect(code.validate({ code: '' })).toBe(false);
    expect(code.validate({ code: '  ' })).toBe(false);
    expect(code.validate({ code: 'valid' })).toBe(true);
  });
});
