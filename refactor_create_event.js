const fs = require('fs');
const file = 'frontend/src/pages/CreateEventpage.tsx';
let content = fs.readFileSync(file, 'utf8');

// Container
content = content.replace(
  'className="min-h-screen bg-gray-50 dark:bg-[#1B1D2A] py-8"', 
  'className="min-h-screen bg-gray-50/50 dark:bg-slate-950 py-12"'
);

content = content.replace(
  'className="bg-white dark:bg-[#212530] rounded-2xl shadow-lg p-8"',
  'className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 rounded-3xl shadow-2xl p-8 border border-white/50 dark:border-slate-800"'
);

// Sections
content = content.replace(
  /bg-gray-50 dark:bg-gray-800\/50 rounded-lg p-6/g,
  'bg-white/50 backdrop-blur-md dark:bg-slate-800/50 rounded-3xl p-8 shadow-inner border border-white/40 dark:border-slate-700/50'
);

// Inputs
content = content.replace(
  /w-full rounded-lg border px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none transition/g,
  'w-full rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 border border-white/40 dark:border-slate-700 shadow-inner px-4 py-3 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
);

// Ticket Type select specific
content = content.replace(
  /w-full rounded-lg border px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900 outline-none transition/g,
  'w-full rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 border border-white/40 dark:border-slate-700 shadow-inner px-4 py-3 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
);

// category Select
content = content.replace(
  /className=\{`mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:border-red-500 focus:ring focus:ring-red-300 dark:focus:ring-red-900 \$\{(.*?)\}`\}/,
  'className={`mt-1 w-full rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm text-gray-900 dark:text-gray-100 border border-white/40 dark:border-slate-700 shadow-inner px-4 py-3 outline-none transition-all focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 ${$1}`}'
);

// Error input border logic
content = content.replace(/border-red-500 bg-red-50 dark:bg-red-900\/20/g, 'border-red-500/50 bg-red-50 dark:bg-red-900/20');

// Icons 
content = content.replace(/text-red-500 dark:text-red-400/g, 'text-purple-600 dark:text-purple-400');
content = content.replace(/text-red-500/g, 'text-purple-600');

// Submit button
content = content.replace(
  'bg-red-500 dark:bg-red-600 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-red-600 dark:hover:bg-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]',
  'bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 focus:ring-4 focus:ring-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]'
);

// progress bar active step circle
content = content.replace(
  /step\.completed\s*\?\s*"bg-purple-600 dark:bg-red-600 text-white"/g,
  'step.completed\n                            ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/30"'
);
content = content.replace(
  /step\.completed\s*\?\s*"bg-purple-600 dark:bg-red-600"/g,
  'step.completed\n                            ? "bg-gradient-to-r from-purple-600 to-blue-600"'
);

fs.writeFileSync(file, content, 'utf8');
