import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      'three': path.resolve(__dirname, 'node_modules/three'),
      'three/examples/jsm': path.resolve(__dirname, 'node_modules/three/examples/jsm')
    }
  }
});

