# manga-renderer-npm

NPM package for manga-renderer functionality, extracted from FramePlanner.

## Development Setup

1. Clone this repository next to your FramePlanner repository:
   ```
   your-workspace/
   ├── FramePlanner/
   │   └── src/
   │       └── /lib/layeredCanvas
   └── manga-renderer/    <- you are here
   ```

2. Run the setup script:
   ```bash
   sh setup.sh
   ```

   This will:
   - Create necessary directories
   - Set up symbolic links to the FramePlanner source
   - Configure .gitignore

3. Install dependencies:
   ```bash
   npm install
   ```

## Project Structure

```
manga-renderer-npm/
├── src/lib/
│   └── layeredCanvas/ -> ../../../FramePlanner/src/lib/layeredCanvas/  (symlink)
├── setup.sh
└── package.json
```

Note: The `src/manga-renderer` directory is a symbolic link to the source code in the FramePlanner repository. Changes made to the files in either location will be reflected in both places.
