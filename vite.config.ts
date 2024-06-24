import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'three': path.resolve(__dirname, 'node_modules/three'),
      'three/examples/jsm': path.resolve(__dirname, 'node_modules/three/examples/jsm')
    }
  }
});
