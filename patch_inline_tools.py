import glob

for filepath in glob.glob('src/plugins/inline-tools/*.js'):
    if 'BaseInlineTool.js' in filepath:
        continue

    with open(filepath, 'r') as f:
        content = f.read()

    tool_name = filepath.split('/')[-1].replace('Tool.js', '').lower()

    replace_str = f"""  getTitle() {{
    const i18n = this.api.i18n || (this.api.api && this.api.api.i18n) || {{ t: (key, fallback) => fallback || key }};
    return i18n.t('toolbar.{tool_name}', '{tool_name.capitalize()}');
  }}"""

    import re
    content = re.sub(r'  getTitle\(\) \{\s*return \'[^\']+\';\s*\}', replace_str, content)

    with open(filepath, 'w') as f:
        f.write(content)
