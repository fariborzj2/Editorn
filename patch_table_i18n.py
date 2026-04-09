with open('src/blocks/Table.js', 'r') as f:
    content = f.read()

setup_i18n = """
      const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };
"""

replace_str = """
      const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || { t: (key, fallback) => fallback || key };

      const addRowBtn = document.createElement('button');
      addRowBtn.textContent = i18n.t('table.addRow', 'Add Row');
      addRowBtn.addEventListener('click', () => this.addRow());

      const addColBtn = document.createElement('button');
      addColBtn.textContent = i18n.t('table.addColumn', 'Add Column');
      addColBtn.addEventListener('click', () => this.addColumn());

      const removeRowBtn = document.createElement('button');
      removeRowBtn.textContent = i18n.t('table.removeRow', 'Remove Row');
      removeRowBtn.addEventListener('click', () => this.removeRow());

      const removeColBtn = document.createElement('button');
      removeColBtn.textContent = i18n.t('table.removeColumn', 'Remove Column');
      removeColBtn.addEventListener('click', () => this.removeColumn());
"""

import re
content = re.sub(
    r"      const addRowBtn = document\.createElement\('button'\);\s*addRowBtn\.textContent = 'Add Row';\s*addRowBtn\.addEventListener\('click', \(\) => this\.addRow\(\)\);\s*const addColBtn = document\.createElement\('button'\);\s*addColBtn\.textContent = 'Add Column';\s*addColBtn\.addEventListener\('click', \(\) => this\.addColumn\(\)\);\s*const removeRowBtn = document\.createElement\('button'\);\s*removeRowBtn\.textContent = 'Remove Row';\s*removeRowBtn\.addEventListener\('click', \(\) => this\.removeRow\(\)\);\s*const removeColBtn = document\.createElement\('button'\);\s*removeColBtn\.textContent = 'Remove Column';\s*removeColBtn\.addEventListener\('click', \(\) => this\.removeColumn\(\)\);",
    replace_str,
    content
)

with open('src/blocks/Table.js', 'w') as f:
    f.write(content)
