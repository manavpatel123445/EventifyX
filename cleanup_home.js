const fs = require('fs');
const file = 'frontend/src/pages/Home.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace left over reds
content = content.replace(/bg-red-100/g, 'bg-purple-100');
content = content.replace(/bg-red-50/g, 'bg-purple-50');
content = content.replace(/dark:bg-red-900\/30/g, 'dark:bg-purple-900/30');

// Replace CTA Section background
content = content.replace(
  /bg-gradient-to-r from-red-500 to-red-600/g,
  'bg-gradient-to-r from-purple-600 to-blue-600'
);

// CTA Section Buttons
content = content.replace(
  /text-red-600/g,
  'text-purple-600'
);
content = content.replace(
  /hover:text-red-600/g,
  'hover:text-purple-600'
);
content = content.replace(
  /text-red-700/g,
  'text-purple-700'
);

// Any stray text-red-500 -> text-purple-500
content = content.replace(
  /text-red-500/g,
  'text-purple-500'
);
content = content.replace(
  /border-red-500/g,
  'border-purple-500'
);
content = content.replace(
  /bg-red-500/g,
  'bg-purple-600'
);
content = content.replace(
  /hover:bg-red-500/g,
  'hover:bg-purple-600'
);
content = content.replace(
  /hover:bg-red-600/g,
  'hover:bg-purple-700'
);

// The CTA View Events button inside red section originally: text-red-500
// now we changed the background to purple/blue, so it should be text-purple-600
// It is the one that says `text-purple-500` now because of global replacement.

fs.writeFileSync(file, content, 'utf8');
