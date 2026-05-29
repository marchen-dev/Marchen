import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const fromRoot = (path: string) => fileURLToPath(new URL(path, import.meta.url))

export const sharedVitestConfig = defineConfig({
  resolve: {
    alias: {
      '@marchen/shared': fromRoot('./packages/shared/src/index.ts'),
      '@marchen/config': fromRoot('./packages/config/src/index.ts'),
      '@marchen/fs': fromRoot('./packages/fs/src/index.ts'),
      '@marchen/core': fromRoot('./packages/core/src/index.ts'),
    },
  },
  test: {
    environment: 'node',
    include: ['apps/**/test/**/*.test.ts', 'packages/**/test/**/*.test.ts'],
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
})

export default sharedVitestConfig
