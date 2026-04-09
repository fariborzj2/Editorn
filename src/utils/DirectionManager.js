export class DirectionManager {
  /**
   * @param {string} mode - 'rtl', 'ltr', or 'auto'
   */
  constructor(mode = 'auto') {
    this.mode = mode;
    this.RTL_REGEX = /[\u0591-\u07FF\uFB1D-\uFDFD\uFE70-\uFEFC]/;
    this.LTR_REGEX = /[A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF\u200E\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF]/;
  }

  /**
   * Detects direction of a given text.
   * @param {string} text
   * @returns {'rtl' | 'ltr'}
   */
  detectDirection(text) {
    if (!text) return 'ltr';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (this.RTL_REGEX.test(char)) return 'rtl';
      if (this.LTR_REGEX.test(char)) return 'ltr';
    }

    // Default fallback for neutral content
    return 'ltr';
  }

  /**
   * Calculates the exact direction based on the current mode and content.
   * @param {string} text
   * @returns {'rtl' | 'ltr'}
   */
  getDirection(text = '') {
    if (this.mode === 'rtl' || this.mode === 'ltr') {
      return this.mode;
    }
    return this.detectDirection(text);
  }

  /**
   * Applies the calculated direction to an element.
   * @param {HTMLElement} element
   * @param {string} text - The text content to analyze if in 'auto' mode
   */
  applyToElement(element, text = '') {
    if (!element) return;
    const dir = this.getDirection(text);
    element.setAttribute('dir', dir);
  }
}
