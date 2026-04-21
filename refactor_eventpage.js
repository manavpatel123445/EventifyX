const fs = require('fs');
const file = 'frontend/src/pages/EventPage.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import TiltCard')) {
  content = content.replace(
    'import type { Event } from "../services/eventService";',
    'import type { Event } from "../services/eventService";\nimport TiltCard from "../components/TiltCard";'
  );
}

// 1. Hero background
content = content.replace(
  /bg-gradient-to-r from-red-500 to-pink-500 dark:from-red-600 dark:to-pink-600/g,
  'bg-gradient-to-r from-purple-600 to-blue-600 drop-shadow-md'
);

// 2. Search & Filter
content = content.replace(
  /bg-red-500 dark:bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition/g,
  'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-full hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all font-semibold'
);
content = content.replace(
  /dark:bg-\[#212530\]/g,
  'dark:bg-slate-900/50 backdrop-blur-xl border dark:border-slate-800'
);
content = content.replace(
  /bg-white dark:bg-gray-800/g,
  'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md'
);
content = content.replace(
  /focus:ring-red-500/g,
  'focus:ring-purple-500'
);
content = content.replace(
  /border-gray-300 dark:border-gray-600/g,
  'border-white/40 dark:border-slate-700'
);

// 3. Grid & Cards
content = content.replace(
  /<Link\s*key={event\._id}\s*to={`\/events\/\${event\._id}`}\s*className="bg-white dark:bg-\[#212530\]/g,
  '<TiltCard key={event._id} damping={25} stiffness={300}>\n<Link to={`/events/${event._id}`} className="block bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl'
);
content = content.replace(
  /rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden/g,
  'rounded-3xl shadow-xl hover:shadow-2xl dark:shadow-slate-900/50 transition-all duration-300 overflow-hidden border border-white/50 dark:border-slate-800 group'
);

content = content.replace(
  /w-full h-48 object-cover/g,
  'w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500'
);

content = content.replace(
  /text-red-500 dark:text-red-400 font-medium/g,
  'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold'
);

// Add closing tag for TiltCard
content = content.replace(
  `                        <div className="text-xs text-gray-500 dark:text-gray-400">\n                          {event.eventManager?.name || 'Organizer'}\n                        </div>\n                      </div>\n                    </div>\n                  </Link>\n                ))}`,
  `                        <div className="text-xs text-gray-500 dark:text-gray-400">\n                          {event.eventManager?.name || 'Organizer'}\n                        </div>\n                      </div>\n                    </div>\n                  </Link>\n                  </TiltCard>\n                ))}`
);

// 4. No Events & Spinners
content = content.replace(
  /border-red-500 dark:border-red-400/g,
  'border-purple-500 dark:border-purple-400'
);
// Make sure to only replace the EXACT 'px-6 py-3 bg-red-500 dark:bg-red-600 ...' string to avoid mismatches
content = content.replace(
  /px-6 py-3 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition/g,
  'px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all font-semibold border-none'
);

// 5. Pagination
content = content.replace(
  /bg-red-500 dark:bg-red-600 text-white border-red-500 dark:border-red-600/g,
  'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-[0_0_10px_rgba(147,51,234,0.4)]'
);

fs.writeFileSync(file, content, 'utf8');
