// --- External imports ---
import { defineConfig, devices } from '@playwright/test';

// --- Exported members ---
export default defineConfig({
  testDir: './tests',
  use: { baseURL: 'http://127.0.0.1:4173', ...devices['Desktop Chrome'] },
  webServer: {
    command: 'pnpm preview --host 127.0.0.1 --port 4173 --strictPort',
    reuseExistingServer: !process.env.CI,
    url: 'http://127.0.0.1:4173',
  },
});
