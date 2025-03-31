# manga-renderer

A JavaScript library for rendering manga/comic pages in browser canvas.

## Features

- Load and render manga pages from envelope file format
- Automatic font loading (supports both Google Fonts and local fonts)
- Canvas-based rendering for optimal performance
- Handles text bubbles and typography
- TypeScript support

## Installation

```bash
npm install manga-renderer
```

## Basic Usage

```javascript
import { readEnvelope, buildRenderer, listFonts, isLocalFont, loadGoogleFontForCanvas } from "manga-renderer";

// Load your envelope file
const response = await fetch('your-manga.envelope');
const fileContent = await response.blob();
const book = await readEnvelope(fileContent);

// Get canvas element
const canvas = document.querySelector('canvas');

// Load required fonts
const fonts = listFonts(book);
for (const font of fonts) {
  const { family, weight } = font;
  
  if (isLocalFont(family)) {
    // Load local font
    const localFile = localFonts[family];
    const url = `/fonts/${localFile}.woff2`;
    const font = new FontFace(family, `url(${url}) format('woff2')`, { 
      style: 'normal', 
      weight 
    });
    document.fonts.add(font);
    await font.load();
  } else {
    // Load Google font
    await loadGoogleFontForCanvas(family, [weight]);
  }
}

// Initialize renderer
const renderer = buildRenderer(canvas, book);
```

## API Reference

### `readEnvelope(blob: Blob): Promise<Book>`
Reads and parses a manga envelope file.

### `buildRenderer(canvas: HTMLCanvasElement, book: Book): Renderer`
Creates a new renderer instance for the given canvas and book.

### `listFonts(book: Book): Font[]`
Returns an array of required fonts for the book.

### `isLocalFont(family: string): boolean`
Checks if the given font family is a local font.

### `loadGoogleFontForCanvas(family: string, weights: string[]): Promise<void>`
Loads a Google Font for use with canvas.

## License

MIT

## Development Setup

Before building the package, you need to:

1. Clone the FramePlanner2 repository alongside the manga-renderer directory:
```bash
# Your workspace directory
├── manga-renderer/
└── FramePlanner2/  # clone this repository
```

2. Clone FramePlanner2:
```bash
git clone https://github.com/jonigata/FramePlanner2.git FramePlanner
```

3. Run the setup script:
```bash
cd manga-renderer
sh setup.sh
```

This setup process is required because manga-renderer depends on some modules from the FramePlanner2 project.

## Project Structure

```
manga-renderer-npm/
├── src/
│   ├── /lib/layeredCanvas/ -> ../../../FramePlanner/src/lib/layeredCanvas/  (symlink)
│   └── /lib/book/ -> ../../../FramePlanner/src/lib/book/  (symlink)
├── setup.sh
└── package.json
```

Note: The `src/manga-renderer` directory is a symbolic link to the source code in the FramePlanner repository. Changes made to the files in either location will be reflected in both places.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

