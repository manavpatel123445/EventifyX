const fs = require('fs');

function refactorMyEventReq() {
  const file = 'frontend/src/pages/MyEventRequests.tsx';
  let content = fs.readFileSync(file, 'utf8');

  if (!content.includes('import TiltCard')) {
    content = content.replace(
      'import { Link } from "react-router-dom";',
      'import { Link } from "react-router-dom";\nimport TiltCard from "../components/TiltCard";'
    );
  }

  // Wrappers
  content = content.replace(/min-h-screen bg-gray-50/g, 'min-h-screen bg-gray-50/50 dark:bg-slate-950');

  // Text colors
  content = content.replace(/text-gray-900/g, 'text-gray-900 dark:text-gray-100');
  content = content.replace(/text-gray-600/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/text-gray-700/g, 'text-gray-700 dark:text-gray-300');
  content = content.replace(/text-gray-500/g, 'text-gray-500 dark:text-gray-400');

  // Primary Buttons
  content = content.replace(
    /bg-red-500 text-white rounded-lg hover:bg-red-600/g,
    'bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-[0_0_15px_rgba(147,51,234,0.5)] border-none'
  );
  content = content.replace(
    /bg-green-500 text-white hover:bg-green-600/g,
    'bg-emerald-500 text-white hover:bg-emerald-600 hover:shadow-[0_0_15px_rgba(16,185,129,0.5)] border-none'
  );
  content = content.replace(
    /bg-gray-200 text-gray-700/g,
    'bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm text-gray-700 dark:text-gray-200 border border-white/40 dark:border-slate-700'
  );

  // Cards
  content = content.replace(
    /bg-white rounded-lg shadow-md overflow-hidden/g,
    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-800 overflow-hidden'
  );
  content = content.replace(
    /bg-white rounded-lg shadow-md/g,
    'bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-800'
  );

  // Apply TiltCard to individual event request cards 
  content = content.replace(
    /<div key=\{request\._id\} className="bg-white\/80 dark:bg-slate-900\/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white\/40 dark:border-slate-800 overflow-hidden">/g,
    '<TiltCard key={request._id} damping={25} stiffness={300}>\n<div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-xl border border-white/40 dark:border-slate-800 overflow-hidden">'
  );

  content = content.replace(
    /<\/Link>\n\s*\)\}\n\s*<\/div>\n\s*<\/div>\n\s*\)\}/g,
    '</Link>\n                      )}\n                    </div>\n                  </div>\n                  </TiltCard>\n                )'
  );
  
  content = content.replace(
    /<\/span>\n\s*<\/div>\n\s*\)\}/g,
     `</span>\n                      </div>\n                      )}`
  );
  // Re-adjust the replacement to be safer since the regex might be tricky
  // Look for the end of the request mapping block:
  content = content.replace(
    `                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>`,
    `                      )}
                    </div>
                  </div>
                </div>
                </TiltCard>
              ))}
            </div>`
  );

  // Other minor
  content = content.replace(/border-red-500/g, 'border-purple-500');

  fs.writeFileSync(file, content, 'utf8');
}

refactorMyEventReq();
