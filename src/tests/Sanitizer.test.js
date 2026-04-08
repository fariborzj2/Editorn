import { describe, it, expect } from 'vitest';
import { Sanitizer } from '../utils/Sanitizer';

describe('Sanitizer', () => {
  it('should remove dangerous scripts', () => {
    const dirty = '<script>alert("xss")</script><p>Hello</p>';
    const clean = Sanitizer.sanitize(dirty);
    expect(clean).toBe('<p>Hello</p>');
  });

  it('should remove inline event handlers', () => {
    // Sanitizer default config doesn't allow <img> tags at all, but let's test a permitted tag (e.g. 'a') with an inline handler
    const dirty = '<a href="x" onclick="alert(1)">Link</a>';
    const clean = Sanitizer.sanitize(dirty);
    expect(clean).toBe('<a href="x">Link</a>');
  });

  it('should allow safe HTML', () => {
    const safe = '<b>Bold text</b> and <i>italic</i>';
    const clean = Sanitizer.sanitize(safe);
    expect(clean).toBe('<b>Bold text</b> and <i>italic</i>');
  });
});
