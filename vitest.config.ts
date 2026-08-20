import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'dist', 'mcp-server'],
    env: {
      VITE_ML_API_URL: 'http://localhost:8000',
      VITE_GEMINI_API_KEY: '',
      VITE_SUPABASE_URL: '',
      VITE_SUPABASE_ANON_KEY: '',
      VITE_ENCRYPTION_KEY: 'test-encryption-key-32-chars-long!',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['services/**', 'components/**'],
      exclude: ['node_modules', 'dist'],
    },
  },
});
