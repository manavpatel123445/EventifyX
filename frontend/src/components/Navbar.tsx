import React from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { ChevronDown, User, LogOut, Shield, BarChart3, Calendar, Ticket } from "lucide-react";
import { ROLES, ROLE_DISPLAY_NAMES, ROLE_COLORS, hasRole, capitalizeFirstLetter } from "../utils/roles";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  
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
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-red-500">
          EventifyX
        </Link>


        {/* Nav Links */}
        <div className="hidden md:flex items-center space-x-8 text-gray-700 font-medium">
          <Link to="/" className="hover:text-red-500 transition">
            Home
          </Link>
             <Link to="/events" className="hover:text-red-500 transition">
            Events
          </Link>
          
          <Link to="/create-event" className="hover:text-red-500 transition">
            Create Events
          </Link>
          <Link to="/contact" className="hover:text-red-500 transition">
            Contact Us
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
          {isLoggedIn && currentUser ? (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(!showDropdown);
                }}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-red-500 transition"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={currentUser.name || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
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
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{capitalizeFirstLetter(currentUser.name)}</p>
                    <p className="text-xs text-gray-500">{currentUser.email}</p>
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
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
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
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
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
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Create Event
                    </Link>
                  )}
                  {hasRole(userRole, ROLES.EVENT_MANAGER) && (
                    <Link
                      to="/my-events"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      My Events
                    </Link>
                  )}
                  
                  <Link
                      to="/my-tickets"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                      onClick={() => setShowDropdown(false)}
                    >
                      <Ticket className="w-4 h-4 mr-2" />
                      My Tickets
                    </Link>
                  
                  <Link
                    to="/profile"
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                    onClick={() => setShowDropdown(false)}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile
                </Link>
                  
                  {/* Event Manager Request - Only for regular users */}
                  
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
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
                className="px-4 py-2 text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
