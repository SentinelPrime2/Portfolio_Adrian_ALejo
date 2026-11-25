import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

const envBase = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env?.VITE_BASE_PATH;

export default defineConfig({
  base: envBase || './',
  plugins: [react(), tailwindcss()],
});
