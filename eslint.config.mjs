import path from "node:path"

import { defineConfig } from 'eslint-config-hyoban'

export default defineConfig(
  {
    formatting: false,
    preferESM: false,
    react: 'next',
    tailwindCSS: true,
  },
  {
    rules: {
      'antfu/top-level-function': 'off',
      '@eslint-react/no-forward-ref': 'off',
      '@eslint-react/hooks-extra/no-direct-set-state-in-use-effect': 'off',
    },
  },
  {
    files: ['**/*/package.json', 'package.json'],
    rules: {
      'package-json/valid-package-def': 0,
      'package-json/valid-name': 0,
    },
  },
  {
    settings: {
      tailwindcss: {
        config: path.join(import.meta.dirname, "apps/web/tailwind.config.ts"),
      },
    },
  },
)
