import { defineConfig } from 'vite';
import visualizer from 'rollup-plugin-visualizer';
import dts from 'vite-plugin-dts';
import * as path from 'path'
import commonjs from '@rollup/plugin-commonjs';

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
        commonjs({
          transformMixedEsModules: true,
          requireReturnsDefault: 'auto'
        }),
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
  plugins: [
    commonjs({
      // CommonJSモジュールをESモジュールとして適切に変換するための設定
      transformMixedEsModules: true,
      // デフォルトエクスポートの処理を改善
      requireReturnsDefault: 'auto'
    }),
    dts()
  ],
  resolve: {
    extensions: ['.ts', '.js'],
    alias: {
      $bookTypes: path.resolve(__dirname, 'src/lib/book/types'),
    }    
  },
});
