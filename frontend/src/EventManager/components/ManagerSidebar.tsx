import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  PieChart,
  User,
  LogOut,
  Moon,
  Sun,
  PlusCircle,
  Settings
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const ManagerSideBar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/manager", 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      name: "My Events", 
      path: "/manager/eventlist", 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      name: "Revenue", 
      path: "/manager/sale-revenue", 
      icon: <PieChart className="w-5 h-5" /> 
    },
    { 
      name: "Settings", 
      path: "/manager/settings", 
      icon: <Settings className="w-5 h-5" /> 
    },
    { 
      name: "Profile", 
      path: "/manager/profile", 
      icon: <User className="w-5 h-5" /> 
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate("/login");
  };

  return (
    <div className="flex flex-col h-screen sticky top-0 bg-white dark:bg-slate-900 w-72 border-r border-slate-200 dark:border-slate-800 transition-all duration-500 z-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="px-8 py-8 flex-shrink-0">
          <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/home')}>
            <div className="w-10 h-10 bg-gradient-to-tr from-red-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-black text-xl">EX</span>
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">
              Eventify<span className="text-red-600">X</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 custom-scrollbar">
          <div className="mb-4 px-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Orchestration</p>
          </div>
          
          <nav className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
                    isActive
                      ? "bg-red-600 text-white shadow-xl shadow-red-600/20"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                  }`
                }
                end
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-4">
                      <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`}>
                        {item.icon}
                      </span>
                      <span className="tracking-tight">{item.name}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="activeIndicatorManager"
                        className="w-1.5 h-1.5 rounded-full bg-white" 
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button className="mt-8 w-full flex items-center gap-3 px-4 py-3 bg-red-600/10 dark:bg-red-600/5 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest border border-red-600/20 hover:bg-red-600 hover:text-white transition-all group">
            <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            Quick Event
          </button>
        </div>

        {/* Footer Area */}
        <div className="p-6 mt-auto space-y-4">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-full py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700/50"
          >
            {theme === "light" ? (
              <div className="flex items-center gap-3 font-bold text-xs">
                <Moon className="w-4 h-4" /> Dark Mode
              </div>
            ) : (
              <div className="flex items-center gap-3 font-bold text-xs">
                <Sun className="w-4 h-4" /> Light Mode
              </div>
            )}
          </button>

          <div className="p-4 rounded-3xl bg-slate-900 dark:bg-slate-800 border border-white/5 shadow-2xl shadow-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-black text-white">Manager</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Verified Organizer</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-500 transition-all group"
                title="Logout"
              >
                <LogOut className="w-4 h-4 group-hover:scale-110" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerSideBar;
