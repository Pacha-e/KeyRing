// --- External imports ---
import { defineConfig, devices } from '@playwright/test';

// --- Exported configuration ---
export default defineConfig({
  testDir: './tests/e2e',
  use: { baseURL: 'http://127.0.0.1:3000', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'node .output/server/index.mjs',
    port: 3000,
    reuseExistingServer: false,
    timeout: 120000,
  },
});
