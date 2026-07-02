# Manrope Font Download Instructions

The FloorX theme requires Manrope font files in `.woff2` format for optimal performance.

## Required Files

Place these files in the `/assets/` directory:
- `manrope-300.woff2` (Light)
- `manrope-400.woff2` (Regular)
- `manrope-500.woff2` (Medium)
- `manrope-600.woff2` (SemiBold)
- `manrope-700.woff2` (Bold)
- `manrope-800.woff2` (ExtraBold)

## Download Options

### Option 1: Google Fonts (Recommended)
1. Visit: https://fonts.google.com/specimen/Manrope
2. Click "Download family"
3. Extract the ZIP file
4. Convert TTF to WOFF2 using: https://cloudconvert.com/ttf-to-woff2
5. Rename files to match the format above

### Option 2: Fontsource
```bash
npm install @fontsource/manrope
```
Then copy the `.woff2` files from `node_modules/@fontsource/manrope/files/` to `/assets/`

### Option 3: GitHub Repository
Download from: https://github.com/davelab6/manrope
Or: https://github.com/FifthTry/manrope-font

## After Downloading

1. Place all 6 `.woff2` files in the `assets/` folder
2. Verify the files are named exactly as listed above
3. The `@font-face` declarations in `floorx-main.css` will automatically reference them
4. Test by loading your site — the Manrope font should appear

## License

Manrope is licensed under the SIL Open Font License (OFL), which allows free use in both personal and commercial projects.
