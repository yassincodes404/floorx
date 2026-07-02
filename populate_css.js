const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'assets', 'floorx-main.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// A simple parsing logic to grab chunks based on comments.
// We'll just look for standard sections in our CSS file.
function extractSection(content, startComment, endComment) {
    const startIndex = content.indexOf(startComment);
    if (startIndex === -1) return '';
    const endIndex = endComment ? content.indexOf(endComment, startIndex + startComment.length) : content.length;
    if (endIndex === -1) return content.slice(startIndex);
    return content.slice(startIndex, endIndex);
}

const colors = extractSection(cssContent, '  /* Backgrounds */', '  /* Typography */');
const typography = extractSection(cssContent, '  /* Typography */', '  /* Spacing */');
const spacing = extractSection(cssContent, '  /* Spacing */', '  /* Motion */');
const motion = extractSection(cssContent, '  /* Motion */', '}\n\n/* ==========================================================================');
const buttons = extractSection(cssContent, '/* Buttons */', '/* Cards */');
const cards = extractSection(cssContent, '/* Cards */', '/* Forms */');
const forms = extractSection(cssContent, '/* Forms */', '/* ==========================================================================');

const header = extractSection(cssContent, '/* Header */', '/* Hero Section */');
const hero = extractSection(cssContent, '/* Hero Section */', '/* Featured Product Section */');
const product = extractSection(cssContent, '/* Featured Product Section */', '/* Before/After Section */');
const comparison = extractSection(cssContent, '/* Before/After Section */', '/* FAQ Section */');
const faq = extractSection(cssContent, '/* FAQ Section */', '/* Gallery Section */');
const gallery = extractSection(cssContent, '/* Gallery Section */', '/* Footer Section */');
const footer = extractSection(cssContent, '/* Footer Section */', '/* Phase 8: Page Transitions Override */');

function writeFile(relPath, contentStr) {
    fs.writeFileSync(path.join(__dirname, relPath), contentStr);
}

writeFile('assets/floorx-tokens/colors.css', ':root {\n' + colors + '}\n');
writeFile('assets/floorx-tokens/typography.css', ':root {\n' + typography + '}\n');
writeFile('assets/floorx-tokens/spacing.css', ':root {\n' + spacing + '}\n');
writeFile('assets/floorx-tokens/motion.css', ':root {\n' + motion + '}\n');
writeFile('assets/floorx-components/buttons.css', buttons);
writeFile('assets/floorx-components/cards.css', cards);
writeFile('assets/floorx-components/forms.css', forms);
writeFile('assets/floorx-sections/header.css', header);
writeFile('assets/floorx-sections/hero.css', hero);
writeFile('assets/floorx-sections/product.css', product);
writeFile('assets/floorx-sections/comparison.css', comparison);
writeFile('assets/floorx-sections/faq.css', faq);
writeFile('assets/floorx-sections/gallery.css', gallery);
writeFile('assets/floorx-sections/footer.css', footer);

console.log('Successfully populated the individual CSS files from floorx-main.css');
