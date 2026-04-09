with open('src/core/ExtensionContext.js', 'r') as f:
    content = f.read()

content = content.replace(
    "directionManager: editorCore.directionManager,",
    "directionManager: editorCore.directionManager,\n       i18n: editorCore.i18n,"
)

with open('src/core/ExtensionContext.js', 'w') as f:
    f.write(content)
