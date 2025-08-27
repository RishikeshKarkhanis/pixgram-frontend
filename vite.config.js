import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/users': 'http://localhost:3000',
      '/posts': 'http://localhost:3000',
      '/likes': 'http://localhost:3000',
      '/comments': 'http://localhost:3000',
      '/follows': 'http://localhost:3000'
    },
  },
});
