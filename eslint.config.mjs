import { defineConfig } from 'eslint-config-hyoban'

export default defineConfig(
  {
    formatting: false,
    preferESM: false,
    react: 'next',
    tailwindCSS: true,
  },
  {
    rules:{
      'antfu/top-level-function': 'off',
    }
  },
  {
    files: ['**/*/package.json', 'package.json'],
    rules: {
      'package-json/valid-package-def': 0,
      'package-json/valid-name': 0,
    },
  },
)
