import { defineConfig } from 'vite';
import visualizer from 'rollup-plugin-visualizer';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: [
        "@types/color-rgba",
        "cbor-x",
        "color-parse",
        "color-rgba",
        "fastsdf",
        "paper",
        "paperjs-offset",
        "perfect-freehand",
        "roughjs",
        "seedrandom",
        "sha1-uint8array",
        "typai",
        "ulid",
      ],
      plugins: [
        visualizer({
          filename: 'stats.html',
          template: 'treemap'
        })
      ],
      watch: {
        include: 'src/**'
      }
    }
  },
  plugins: [dts()],
  resolve: {
    extensions: ['.ts', '.js']
  }
});
