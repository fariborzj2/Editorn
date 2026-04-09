const fs = require('fs');
let code = fs.readFileSync('src/blocks/Code.js', 'utf8');

// Update input event
code = code.replace(
`    // Handle input and update highlighting
    this.textarea.addEventListener('input', () => {
      this.data.code = this.textarea.value;
      this.updateHighlight();
      this.api.triggerChange();
    });`,
`    // Handle input and update highlighting with debounce
    this.textarea.addEventListener('input', () => {
      this.data.code = this.textarea.value;

      // Update immediately to prevent lag for small inputs, but use debounce for large inputs or heavy operations
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.updateHighlight();
      }, 150); // 150ms debounce for performance on large code blocks

      this.api.triggerChange();
    });`
);

// Update tab event
code = code.replace(
`        this.data.code = this.textarea.value;
        this.updateHighlight();
        this.api.triggerChange();`,
`        this.data.code = this.textarea.value;
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.updateHighlight(); // update immediately on tab
        this.api.triggerChange();`
);

fs.writeFileSync('src/blocks/Code.js', code);
