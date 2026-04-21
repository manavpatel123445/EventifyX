const fs = require('fs');
const file = 'frontend/src/pages/MyTicketsPage.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('import TiltCard')) {
  content = content.replace(
    "import { resolveApiRoot } from '../services/apiRoot';",
    "import { resolveApiRoot } from '../services/apiRoot';\nimport TiltCard from '../components/TiltCard';"
  );
}

content = content.replace(
  'className="min-h-screen bg-gray-50 py-12"',
  'className="min-h-screen bg-gray-50/50 dark:bg-slate-950 py-12"'
);

// Header
content = content.replace(
  'text-gray-900 mb-2">Your Tickets</h1>',
  'text-gray-900 dark:text-white mb-2">Your Tickets</h1>'
);
content = content.replace(
  'className="text-gray-600">Manage and view your event tickets</p>',
  'className="text-gray-600 dark:text-gray-400">Manage and view your event tickets</p>'
);

// Filter
content = content.replace(
  /className="text-sm text-gray-600"/g,
  'className="text-sm text-gray-600 dark:text-gray-400"'
);

content = content.replace(
  /className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"/g,
  'className="border border-white/40 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500"'
);

content = content.replace(
  /className="border border-gray-300 rounded-md px-2 py-1 text-sm"/g,
  'className="border border-white/40 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-gray-900 dark:text-gray-100 rounded-xl px-3 py-2 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-purple-500"'
);

// Ticket Card
content = content.replace(
  '<div key={ticket._id} className="relative overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">',
  '<TiltCard key={ticket._id} damping={25} stiffness={300}>\n              <div className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl dark:shadow-slate-900/50 border border-white/50 dark:border-slate-800 transition-all duration-300">'
);
content = content.replace(
  '</p>\n                  <p className="text-xs text-gray-500 mt-1">\n                    Ticket ID: {ticket._id.slice(-8).toUpperCase()}\n                  </p>\n                </div>\n              </div>\n            </div>',
  '</p>\n                  <p className="text-xs text-gray-500 mt-1">\n                    Ticket ID: {ticket._id.slice(-8).toUpperCase()}\n                  </p>\n                </div>\n              </div>\n            </div>\n            </TiltCard>'
);

// Blue gradient
content = content.replace(
  'from-blue-500 to-purple-600',
  'from-purple-600 to-blue-600 shadow-[0_0_15px_rgba(147,51,234,0.5)]'
);

// Admit one
content = content.replace(
  'bg-yellow-400',
  'bg-gradient-to-r from-amber-400 to-amber-600 shadow-lg'
);

// Event Image Left Section bg
content = content.replace(
  'className="md:w-1/3 bg-gray-100 p-6 flex items-center justify-center"',
  'className="md:w-1/3 bg-gray-100/50 dark:bg-slate-800/30 p-6 flex items-center justify-center border-r border-white/40 dark:border-slate-700/50"'
);

content = content.replace(
  'className="w-full h-48 object-cover rounded-lg"',
  'className="w-full h-48 object-cover rounded-2xl shadow-md"'
);

// Ticket Title
content = content.replace(
  'text-gray-900 mb-1 hover:text-blue-600',
  'text-gray-900 dark:text-white mb-1 hover:text-purple-500 transition-colors'
);
content = content.replace(
  'text-gray-600 text-sm',
  'text-gray-600 dark:text-gray-400 text-sm'
);
content = content.replace(
  'bg-blue-50 text-blue-800',
  'bg-purple-100/80 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50'
);

// Grid stats
content = content.replace(
  /bg-gray-50 p-3 rounded-lg/g,
  'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-3 rounded-xl border border-white/40 dark:border-slate-700/50'
);
content = content.replace(
  /text-gray-500 mb-1/g,
  'text-gray-500 dark:text-gray-400 mb-1'
);
content = content.replace(
  /<p className="font-medium">/g,
  '<p className="font-semibold text-gray-900 dark:text-gray-100">'
);

// border-t
content = content.replace(
  'border-t border-gray-100',
  'border-t border-gray-200/50 dark:border-slate-700/50'
);

content = content.replace(
  /text-gray-500">Purchased/g,
  'text-gray-500 dark:text-gray-400">Purchased'
);
content = content.replace(
  /text-gray-500">{ticket.user/g,
  'text-gray-500 dark:text-gray-400">{ticket.user'
);

// Download logic
content = content.replace(
  'bg-blue-600 hover:bg-blue-700',
  'bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 border-none transition-all'
);

content = content.replace(
  'bg-white hover:bg-gray-50',
  'bg-white/80 dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-slate-700 border-gray-200 dark:border-slate-700'
);

// QR Container
content = content.replace(
  'className="flex-shrink-0 text-center p-6 border-l border-gray-200 bg-gray-50 flex flex-col items-center justify-center"',
  'className="flex-shrink-0 text-center p-6 border-l border-white/40 dark:border-slate-700/50 bg-gray-50/50 dark:bg-slate-800/30 flex flex-col items-center justify-center"'
);
content = content.replace(
  'bg-white p-4 rounded-lg border border-gray-200 shadow-sm',
  'bg-white p-4 rounded-2xl border border-gray-200 shadow-inner'
);
content = content.replace(
  'text-sm font-medium text-gray-700',
  'text-sm font-medium text-gray-700 dark:text-gray-300'
);

// Pagination
content = content.replace(
  /className="px-3 py-2 border rounded-md bg-white disabled:opacity-50"/g,
  'className="px-3 py-2 border border-white/40 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-200 disabled:opacity-50 hover:bg-white dark:hover:bg-slate-800 transition-all font-medium"'
);

// Empty State
content = content.replace(
  'className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4"',
  'className="mx-auto w-16 h-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border border-white/40 dark:border-slate-700/50 mb-4"'
);
content = content.replace(
  'className="w-8 h-8 text-gray-400"',
  'className="w-8 h-8 text-gray-400 dark:text-gray-500"'
);
content = content.replace(
  'className="text-lg font-medium text-gray-900 mb-1">No tickets yet</h3>',
  'className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">No tickets yet</h3>'
);
content = content.replace(
  'className="text-gray-500">Your purchased tickets will appear here</p>',
  'className="text-gray-500 dark:text-gray-400">Your purchased tickets will appear here</p>'
);
content = content.replace(
  'className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"',
  'className="mt-4 inline-flex items-center px-4 py-2 border-none text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"'
);

fs.writeFileSync(file, content, 'utf8');
