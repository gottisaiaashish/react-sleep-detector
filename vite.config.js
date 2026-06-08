import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'ReactSleepDetector',
      fileName: (format) => `react-sleep-detector.${format}.js`
    },
    rollupOptions: {
      // Ensure we don't bundle React since it's a peer dependency
      external: ['react', 'react-dom', '@vladmandic/face-api', 'lucide-react'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@vladmandic/face-api': 'faceapi',
          'lucide-react': 'lucide'
        }
      }
    }
  }
});
