import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  User,
  Shield,
  Moon,
  Sun,
  DollarSign,
  Activity,
  ChevronRight,
  Settings,
  Bell
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { motion } from "framer-motion";

const SideBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/admin", 
      icon: <LayoutDashboard className="w-4 h-4" /> 
    },
    { 
      name: "Users", 
      path: "/admin/users", 
      icon: <Users className="w-4 h-4" /> 
    },
    { 
      name: "Events", 
      path: "/admin/events", 
      icon: <Calendar className="w-4 h-4" /> 
    },
    { 
      name: "Payments", 
      path: "/admin/payments", 
      icon: <DollarSign className="w-4 h-4" /> 
    },
    { 
      name: "System Logs", 
      path: "/admin/logs", 
      icon: <Activity className="w-4 h-4" /> 
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    toast.success('Successfully logged out');
    window.location.href = '/login';
  };

  return (
    <div className="flex flex-col h-screen sticky top-0 bg-white dark:bg-admin-background w-64 border-r border-slate-200 dark:border-admin-border transition-all duration-300 z-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="px-6 py-6 flex-shrink-0">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-8 h-8 bg-admin-primary rounded-[10px] flex items-center justify-center shadow-lg shadow-admin-primary/20 group-hover:scale-105 transition-transform duration-300">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-slate-900 dark:text-admin-text">
              Nexus<span className="text-admin-primary">.</span>
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-3 custom-scrollbar mt-2">
          <div className="mb-2 px-3">
            <p className="text-[11px] font-medium text-slate-400 dark:text-admin-text-secondary uppercase tracking-wider">Overview</p>
          </div>
          
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-slate-100 dark:bg-admin-surface text-slate-900 dark:text-admin-text shadow-sm"
                      : "text-slate-500 dark:text-admin-text-secondary hover:bg-slate-50 dark:hover:bg-admin-surface/50 hover:text-slate-900 dark:hover:text-admin-text"
                  }`
                }
                end
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <span className={`${isActive ? "text-slate-900 dark:text-admin-text" : "text-slate-400 dark:text-admin-text-secondary group-hover:text-slate-900 dark:group-hover:text-admin-text"} transition-colors`}>
                        {item.icon}
                      </span>
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <motion.div 
                        layoutId="activeTab"
                        className="w-1 h-4 rounded-full bg-admin-primary" 
                      />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="mt-8 mb-2 px-3">
            <p className="text-[11px] font-medium text-slate-400 dark:text-admin-text-secondary uppercase tracking-wider">Settings</p>
          </div>
          <nav className="space-y-1">
            <NavLink
              to="/admin/profile"
              className={({ isActive }) =>
                `group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-slate-100 dark:bg-admin-surface text-slate-900 dark:text-admin-text shadow-sm"
                    : "text-slate-500 dark:text-admin-text-secondary hover:bg-slate-50 dark:hover:bg-admin-surface/50 hover:text-slate-900 dark:hover:text-admin-text"
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Settings className="w-4 h-4 text-slate-400 dark:text-admin-text-secondary group-hover:text-slate-900 dark:group-hover:text-admin-text transition-colors" />
                <span>Settings</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Footer Area */}
        <div className="p-4 mt-auto border-t border-slate-200 dark:border-admin-border bg-slate-50/50 dark:bg-admin-background">
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-admin-text-secondary dark:hover:bg-admin-surface transition-colors"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-200 dark:text-admin-text-secondary dark:hover:bg-admin-surface transition-colors">
              <Bell className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-admin-surface transition-colors cursor-pointer group">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-admin-primary to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                A
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-900 dark:text-admin-text leading-tight">Admin User</span>
                <span className="text-xs text-slate-500 dark:text-admin-text-secondary">admin@nexus.com</span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
              className="text-slate-400 hover:text-admin-error transition-colors opacity-0 group-hover:opacity-100"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
