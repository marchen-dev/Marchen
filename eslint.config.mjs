// @ts-check
import { defineConfig } from 'eslint-config-hyoban'

export default defineConfig(
  {
    formatting: false,
    lessOpinionated: true,
    ignores: [],
    preferESM: false,
    react: 'next',
    tailwindCSS: true,
  },
  {
    files: ['**/*/package.json', 'package.json'],
    rules: {
      'package-json/valid-package-def': 0,
      'package-json/valid-name': 0,
    },
  },
)
