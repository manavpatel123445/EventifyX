const fs = require('fs');
const file = 'frontend/src/pages/Home.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import TiltCard')) {
  content = content.replace(
    'import { getAllCategories } from "../services/categoryService";',
    'import { getAllCategories } from "../services/categoryService";\nimport TiltCard from "../components/TiltCard";'
  );
}

// 1. Hero text and search accents
content = content.replace(/text-red-400/g, 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 drop-shadow-sm');
content = content.replace(/focus:ring-red-500/g, 'focus:ring-purple-500');

// 2. Button: Explore Events & Search
content = content.replace(
  /bg-red-500 text-white rounded-lg hover:bg-red-600/g,
  'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] border-none'
);
content = content.replace(
  /bg-red-500 px-8 py-4 font-semibold text-white shadow-lg hover:bg-red-600/g,
  'bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-lg hover:shadow-[0_0_20px_rgba(147,51,234,0.6)] border-none'
);

content = content.replace(
  /hover:text-red-500/g,
  'hover:text-purple-500'
);

// 3. Category scroll
content = content.replace(
  /border-red-500/g,
  'border-purple-500'
);
content = content.replace(
  /bg-white dark:bg-slate-800 rounded-2xl shadow-sm hover:shadow-2xl/g,
  'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/50 dark:border-slate-800 hover:shadow-2xl'
);
content = content.replace(
  /text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300/g,
  'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold hover:opacity-80'
);

// 4. Wrap category link in TiltCard
content = content.replace(
  /<Link\s*key={category\._id}\s*to={`\/events\?category=\${category\._id}`}\s*className="snap-start shrink-0/g,
  '<TiltCard key={category._id} damping={25} stiffness={300} className="snap-start shrink-0">\n<Link to={`/events?category=${category._id}`} className="block w-[220px]'
);
content = content.replace(
  /<\/Link>\n\s*\);\n\s*}\)/g,
  '</Link>\n </TiltCard>\n );\n })'
);

// 5. Wrap event card in TiltCard
// The original starts with <Link key={event._id} to={`/events/${event._id}`} className="block h-full"> 
// And then <div className="bg-white dark:bg-slate-900 rounded-xl...">
content = content.replace(
  /<Link\s*key={event\._id}\s*to={`\/events\/\${event\._id}`}\s*className="block h-full"\s*>\s*<div className="bg-white/g,
  '<TiltCard key={event._id} damping={20} stiffness={200} className="h-full">\n<Link to={`/events/${event._id}`} className="block h-full">\n<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl'
);
content = content.replace(
  /rounded-xl shadow-lg dark:shadow-black\/30/g,
  'rounded-3xl shadow-xl border border-white/40 dark:border-slate-800'
);

content = content.replace(
  /<\/svg>\n\s*<\/button>\n\s*<\/div>\n\s*<\/div>\n\s*<\/Link>\n\s*}\)\)/g,
  '</svg>\n</button>\n</div>\n</div>\n</Link>\n</TiltCard>\n ))'
);

// We need to also catch the case for closing TiltCard properly
// Let us simply replace `</Link>` with `</Link>\n</TiltCard>` if it follows the event card structure.
// Instead of risky regex, let's target the exact string:
content = content.replace(
  `                      </button>\n                       \n                      \n                    </div>\n                  </div>\n                  </Link>\n                ))}`,
  `                      </button>\n                    </div>\n                  </div>\n                  </Link>\n                  </TiltCard>\n                ))}`
);

// 6. Accent colors in Events
content = content.replace(/bg-red-500\/90/g, 'bg-purple-600/90');
content = content.replace(/group-hover:text-red-600 dark:group-hover:text-red-400/g, 'group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600');
content = content.replace(/text-red-500/g, 'text-purple-500');
content = content.replace(/bg-gradient-to-r from-red-50 to-white dark:from-red-950\/40 dark:to-slate-900 p-3 rounded-lg border border-red-50 dark:border-red-900\/40/g, 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-3 rounded-xl border border-white/40 dark:border-slate-700/50');

content = content.replace(
  /bg-gradient-to-r from-red-500 to-red-600 text-white.*hover:from-red-600 hover:to-red-700/g,
  'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] border-none'
);

content = content.replace(
  /bg-transparent border-2 border-red-500 text-red-500 dark:text-red-400 dark:border-red-400.*hover:bg-red-500 hover:text-white/g,
  'bg-transparent border-2 border-purple-500 text-purple-500 dark:text-purple-400 dark:border-purple-400 hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] hover:bg-gradient-to-r hover:from-purple-600 hover:to-blue-600 hover:border-transparent hover:text-white'
);

// CTA Section
content = content.replace(/text-red-400/g, 'text-purple-400');
content = content.replace(/bg-red-500/g, 'bg-purple-600');
content = content.replace(/hover:bg-red-600/g, 'hover:bg-purple-700');


fs.writeFileSync(file, content, 'utf8');
