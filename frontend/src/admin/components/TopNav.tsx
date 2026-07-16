import React from "react";
import { Search, Bell, MessageSquare, Moon, Sun, Command } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const TopNav: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-admin-background/80 backdrop-blur-xl border-b border-slate-200 dark:border-admin-border px-8 py-4 flex items-center justify-between">
      <div className="flex-1 max-w-2xl">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2.5 border border-slate-200 dark:border-admin-border rounded-xl bg-slate-50 dark:bg-admin-surface text-sm placeholder-slate-400 dark:placeholder-admin-text-secondary text-slate-900 dark:text-admin-text focus:outline-none focus:ring-2 focus:ring-admin-primary/50 focus:border-admin-primary/50 transition-all shadow-sm"
            placeholder="Search anywhere..."
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <kbd className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[10px] font-medium text-slate-500 dark:text-admin-text-secondary">
              <Command className="w-3 h-3" /> K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4 ml-8">
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-admin-text-secondary dark:hover:bg-admin-surface transition-colors">
          <MessageSquare className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-admin-primary rounded-full border-2 border-white dark:border-admin-background" />
        </button>
        <button className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-admin-text-secondary dark:hover:bg-admin-surface transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-admin-error rounded-full border-2 border-white dark:border-admin-background" />
        </button>
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:text-admin-text-secondary dark:hover:bg-admin-surface transition-colors"
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
        
        <div className="h-6 w-px bg-slate-200 dark:bg-admin-border mx-2" />
        
        <button className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-admin-surface transition-colors">
          <img 
            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Admin`} 
            alt="Admin" 
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800"
          />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
