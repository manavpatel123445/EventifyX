import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  User,
  ChevronRight,
  Shield,
  Moon,
  Sun,
  DollarSign,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useTheme } from "../../context/ThemeContext";
import { useLocation } from "react-router-dom";

const SideBar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/admin", 
      icon: <LayoutDashboard className="w-5 h-5" /> 
    },
    { 
      name: "Users", 
      path: "/admin/users", 
      icon: <Users className="w-5 h-5" /> 
    },
    { 
      name: "Events", 
      path: "/admin/events", 
      icon: <Calendar className="w-5 h-5" /> 
    },
    { 
      name: "Payments", 
      path: "/admin/payments", 
      icon: <DollarSign className="w-5 h-5" /> 
    },
    
    { 
      name: "Profile", 
      path: "/admin/profile", 
      icon: <User className="w-5 h-5" /> 
    },
   
  ];

  const handleLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('accessToken');
    
    // Show success message
    toast.success('Successfully logged out');
    
    // Redirect to login page
    window.location.href = '/login';
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 px-4 flex items-center justify-between bg-white dark:bg-[#1B1D2A] border-b border-gray-200 dark:border-gray-700/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-red-500 dark:bg-red-600 rounded-md flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold text-gray-900 dark:text-white">Admin Panel</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="p-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
            aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <button
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={() => setIsMobileOpen(false)}
          aria-label="Close sidebar overlay"
        />
      )}

      <aside
        className={`fixed md:sticky top-14 md:top-0 left-0 z-50 md:z-30 h-[calc(100vh-3.5rem)] md:h-screen w-64 bg-gradient-to-b from-white to-gray-50 dark:from-[#1B1D2A] dark:to-[#16182A] border-r border-gray-200 dark:border-gray-700/50 shadow-sm transform transition-transform duration-300 ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="flex-1 flex flex-col overflow-hidden h-full">
          {/* Logo */}
          <div className="px-6 py-5 flex-shrink-0 hidden md:block">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-500 dark:bg-red-600 rounded-md flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-400 dark:to-orange-400 bg-clip-text text-transparent">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Scrollable Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-3 py-4 space-y-1">
              <div className="px-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Main Menu
                </p>
              </div>

              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                      isActive
                        ? "bg-red-50 dark:bg-red-500/20 text-red-600 dark:text-red-400"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white"
                    }`
                  }
                  end
                >
                  <div className="flex items-center space-x-3">
                    <span className="opacity-70 group-hover:opacity-100">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Theme Toggle */}
          <div className="px-4 py-2 flex-shrink-0 hidden md:block">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-full py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition"
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>

          {/* Sticky Profile Section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700/50 bg-white dark:bg-[#212530] flex-shrink-0">
            <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Admin</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">View Profile</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default SideBar;
