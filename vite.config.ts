import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Correctly stringify the env object for replacement
      'process.env': JSON.stringify(env)
    },
    build: {
      outDir: 'dist',
    }
  };
});