import { defineConfig } from 'vitest/config'

// Security rules tests run against the Firestore emulator: `npm run test:rules`.
// On GitHub Actions, failures are also posted as annotations on the run.
export default defineConfig({
  test: {
    include: ['tests/rules/**/*.test.ts'], testTimeout: 20000, hookTimeout: 60000, fileParallelism: false,
    reporters: process.env.GITHUB_ACTIONS ? ['default', 'github-actions'] : ['default'],
  },
})
