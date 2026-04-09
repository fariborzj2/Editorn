with open('src/core/EditorCore.js', 'r') as f:
    content = f.read()

import_str = "import { I18n } from '../utils/I18n.js';\n"
content = import_str + content

content = content.replace(
    "direction: 'auto',",
    "direction: 'auto',\n      lang: 'en',"
)

content = content.replace(
    "this.directionManager = new DirectionManager(this.config.direction);",
    "this.directionManager = new DirectionManager(this.config.direction);\n    this.i18n = new I18n(this.config.lang);"
)

with open('src/core/EditorCore.js', 'w') as f:
    f.write(content)
