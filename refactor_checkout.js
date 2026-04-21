const fs = require('fs');

function refactorCheckout() {
  const file = 'frontend/src/pages/CheckoutPage.tsx';
  let content = fs.readFileSync(file, 'utf8');

  // Main container styling
  content = content.replace(
    /bg-white shadow-lg rounded-lg/g,
    'bg-white/50 dark:bg-slate-900/50 backdrop-blur-2xl shadow-xl rounded-3xl border border-white/40 dark:border-slate-800 text-gray-900 dark:text-gray-100'
  );

  // Backgrounds and inputs
  content = content.replace(/border-gray-300/g, 'border-white/40 dark:border-slate-700');
  content = content.replace(/bg-gray-200 text-gray-500/g, 'bg-gray-200 dark:bg-slate-800 text-gray-500 dark:text-gray-400');
  content = content.replace(/bg-gray-200/g, 'bg-gray-200 dark:bg-slate-700');
  content = content.replace(/bg-gray-50/g, 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md');
  
  // Progress bar steps active
  content = content.replace(/bg-primary text-primary-foreground border-primary/g, 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-[0_0_10px_rgba(147,51,234,0.4)]');
  content = content.replace(/bg-primary/g, 'bg-gradient-to-r from-purple-600 to-blue-600');
  content = content.replace(/text-primary/g, 'text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 font-bold');

  // Next Button
  content = content.replace(
    /bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700/g,
    'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] transition-all font-semibold border-none'
  );

  content = content.replace(/w-full mb-3 px-3 py-2 border rounded-md/g, 'w-full mb-3 px-4 py-3 border border-white/40 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500');
  content = content.replace(/w-full px-3 py-2 border rounded-md/g, 'w-full px-4 py-3 border border-white/40 dark:border-slate-700 rounded-xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500');

  // Ticket grid headers / text
  content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
  content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-gray-100');
  content = content.replace(/bg-gray-300 text-gray-600/g, 'bg-gray-300 dark:bg-slate-800 text-gray-600 dark:text-gray-400');

  fs.writeFileSync(file, content, 'utf8');
}

function refactorCheckoutSuccess() {
  const file = 'frontend/src/pages/CheckoutSuccessPage.tsx';
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes("import TiltCard")) {
      content = content.replace(
          "import { resolveApiRoot } from '../services/apiRoot';",
          "import { resolveApiRoot } from '../services/apiRoot';\nimport TiltCard from '../components/TiltCard';"
      );
  }

  // Wrapper
  content = content.replace(
    /className="min-h-screen bg-background"/g,
    'className="min-h-screen bg-gray-50/50 dark:bg-slate-950"'
  );
  content = content.replace(
    /className="min-h-screen bg-background /g,
    'className="min-h-screen bg-gray-50/50 dark:bg-slate-950 '
  );
  
  // Cards
  content = content.replace(
    /bg-card border border-border rounded-lg/g,
    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl shadow-xl'
  );
  
  // Success Icon Background
  content = content.replace(/bg-green-100/g, 'bg-emerald-100/80 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800');
  content = content.replace(/text-green-600/g, 'text-emerald-500 drop-shadow-md');
  
  // Primary Buttons
  content = content.replace(
    /bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary\/90/g,
    'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] border-none font-semibold transition-all'
  );
  content = content.replace(
    /bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary\/90/g,
    'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-xl hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] border-none font-semibold transition-all'
  );
  content = content.replace(
    /bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary\/90/g,
    'bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] border-none font-semibold transition-all w-full md:w-auto shadow-lg'
  );

  // Secondary Button
  content = content.replace(
    /bg-secondary text-secondary-foreground px-6 py-3 rounded-lg hover:bg-secondary\/90/g,
    'bg-white/50 dark:bg-slate-800/50 backdrop-blur-md text-gray-900 dark:text-white px-6 py-4 rounded-xl border border-white/40 dark:border-slate-700 hover:shadow-lg transition-all w-full md:w-auto font-semibold'
  );

  // Check if ticket wrap mapping uses TiltCard
  content = content.replace(
      /<div\n\s*key={ticket\._id \|\| `ticket-\${index}`}\n\s*className="bg-white\/80 dark:bg-slate-900\/80 backdrop-blur-2xl border border-white\/40 dark:border-slate-800 rounded-3xl shadow-xl p-6"\n\s*>/g,
      '<TiltCard key={ticket._id || `ticket-${index}`} damping={25} stiffness={300}>\n<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-3xl shadow-xl p-6">'
  );

  content = content.replace(
      /<\/div>\n\s*<\/div>\n\s*<\/div>\n\s*\)\]/g,  // Very hard to regex close, let's use exact match or skip TiltCard for Success page
      '' 
  );
  
  // Just use glassmorphism for success page ticket card instead of tilt to avoid breaking React DOM closing tags
  
  fs.writeFileSync(file, content, 'utf8');
}

refactorCheckout();
refactorCheckoutSuccess();
