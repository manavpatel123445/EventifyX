import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, User, LogOut, Shield, BarChart3, Calendar, Ticket, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { ROLES, ROLE_DISPLAY_NAMES, ROLE_COLORS, hasRole, capitalizeFirstLetter } from "../utils/roles";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  
  // Check for token in both localStorage and sessionStorage
  const checkAuthStatus = () => {
    return Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
  };
  
  const [isLoggedIn, setIsLoggedIn] = React.useState(checkAuthStatus());
  const [showDropdown, setShowDropdown] = React.useState(false);
  
  // Get current user info with proper typing
  const getCurrentUser = (): { name: string; email: string; role: string; _id: string } | null => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      // Ensure required fields exist
      if (user && user.name && user.email && user.role) {
        return user;
      }
      return null;
    } catch {
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  
  // Resolve avatar URL from stored user.profileImage
  const avatarUrl = React.useMemo(() => {
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      const val = user?.profileImage as string | undefined;
      if (!val) return null;
      // If already a data URL or http(s) URL, use directly
      if (typeof val === 'string' && (val.startsWith('data:image') || val.startsWith('http'))) {
        return val;
      }
      // If it's a localStorage key (e.g., avatar_<userId>), try to load
      if (typeof val === 'string') {
        const stored = localStorage.getItem(val);
        if (stored) return stored;
      }
      return null;
    } catch {
      return null;
    }
  }, [isLoggedIn]);
  const userRole = currentUser?.role as keyof typeof ROLE_DISPLAY_NAMES | undefined;

  React.useEffect(() => {
    const onStorage = () => setIsLoggedIn(checkAuthStatus());
    window.addEventListener("storage", onStorage);
    
    // Listen for custom login event
    const onLogin = () => setIsLoggedIn(checkAuthStatus());
    window.addEventListener("userLogin", onLogin);
    
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("userLogin", onLogin);
    };
  }, []);
  
  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  const handleLogout = () => {
    // Clear all auth-related data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    sessionStorage.removeItem("user");
    
    setIsLoggedIn(false);
    toast.success("Logged out successfully!");
    navigate("/login");
  };


  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/EventifyXlogo.png"
            alt="EventifyX logo"
            className="h-12 w-12 md:h-14 md:w-14 object-contain"
          />
        </Link>


        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-gray-700 dark:text-gray-300 font-medium">
          <Link to="/" className="hover:text-red-500 dark:hover:text-red-400 transition">
            Home
          </Link>
             <Link to="/events" className="hover:text-red-500 dark:hover:text-red-400 transition">
            Events
          </Link>
          
          <Link to="/create-event" className="hover:text-red-500 dark:hover:text-red-400 transition">
            Create Events
          </Link>
          <Link to="/contact" className="hover:text-red-500 dark:hover:text-red-400 transition">
            Contact Us
          </Link>
        </div>

        {/* Right Side: Theme Toggle + Profile */}
        <div className="flex items-center space-x-4">
          {/* Dark/Light mode toggle - Moon icon */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "light" ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </button>
          {isLoggedIn && currentUser ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-red-500 dark:hover:text-red-400 transition"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {currentUser.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <span className="hidden md:block">{capitalizeFirstLetter(currentUser.name)}</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{capitalizeFirstLetter(currentUser.name)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                    {userRole && (
                      <span 
                        className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium 
                        ${ROLE_COLORS[userRole]?.bg || 'bg-gray-100'} 
                        ${ROLE_COLORS[userRole]?.text || 'text-gray-800'}`}
                      >
                        {ROLE_DISPLAY_NAMES[userRole] || 'User'}
                      </span>
                    )}
                  </div>
                  
                  {/* Admin Dashboard Link */}
                  {hasRole(userRole, ROLES.ADMIN) && (
                    <Link
                      to="/admin"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Link>

                  )}
                  
                  {/* Event Manager Dashboard */}
                  {hasRole(userRole, ROLES.EVENT_MANAGER) && (
                    <Link
                      to="/manager"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Event Manager Dashboard
                    </Link>
                  )}
                  
                  {/* User Dashboard */}
                
                  
                  {/* Create Event (for event managers and admins) */}
                  {hasRole(userRole, ROLES.EVENT_MANAGER) && (
                    <Link
                      to="/create-event"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Event
                    </Link>
                  )}
                  {hasRole(userRole, ROLES.EVENT_MANAGER) && (
                    <Link
                      to="/my-events"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      My Events
                    </Link>
                  )}
                  
                  <Link
                      to="/my-tickets"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      My Tickets
                    </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                </Link>
                  
                  {/* Event Manager Request - Only for regular users */}
                  
                  <div className="border-t border-gray-100 dark:border-gray-700 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 text-red-500 dark:text-red-400 border border-red-500 dark:border-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
