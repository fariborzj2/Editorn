const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const codeBlockData = `,
          {
            type: 'code',
            data: {
              language: 'javascript',
              code: 'function test() {\\n  console.log("Hello, Prism!");\\n}'
            }
          }`;

html = html.replace(`            data: { text: 'سلام! این ویرایشگر جدید مبتنی بر بلوک است. این ویرایشگر جدید مبتنی بر بلوک با API تنظیمات مدرن است.' }
          }`, `            data: { text: 'سلام! این ویرایشگر جدید مبتنی بر بلوک است. این ویرایشگر جدید مبتنی بر بلوک با API تنظیمات مدرن است.' }
          }${codeBlockData}`);

fs.writeFileSync('index.html', html);
