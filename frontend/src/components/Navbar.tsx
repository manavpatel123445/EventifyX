import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  ChevronDown, User, LogOut, Shield, BarChart3, 
  Ticket, Moon, Sun, Menu, X, Bell} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { ROLES, ROLE_DISPLAY_NAMES, ROLE_COLORS, hasRole, capitalizeFirstLetter } from "../utils/roles";
import { motion, AnimatePresence } from "framer-motion";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const checkAuthStatus = () => {
    return Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
  };
  
  const [isLoggedIn, setIsLoggedIn] = useState(checkAuthStatus());

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getCurrentUser = (): { name: string; email: string; role: string; _id: string } | null => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return (user && user.name && user.email && user.role) ? user : null;
    } catch {
      return null;
    }
  };
  
  const currentUser = getCurrentUser();
  
  const avatarUrl = useMemo(() => {
    try {
      const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      const val = user?.profileImage;
      if (!val) return null;
      if (typeof val === 'string' && (val.startsWith('data:image') || val.startsWith('http'))) return val;
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

  useEffect(() => {
    const onAuthChange = () => setIsLoggedIn(checkAuthStatus());
    window.addEventListener("storage", onAuthChange);
    window.addEventListener("userLogin", onAuthChange);
    return () => {
      window.removeEventListener("storage", onAuthChange);
      window.removeEventListener("userLogin", onAuthChange);
    };
  }, []);
  
  useEffect(() => {
    const handleClickOutside = () => setShowDropdown(false);
    if (showDropdown) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsLoggedIn(false);
    toast.success("Logged out successfully!", {
      style: { borderRadius: '15px', background: '#333', color: '#fff' }
    });
    navigate("/login");
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Events", path: "/events" },
    { label: "Create", path: "/create-event" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      isScrolled 
        ? "py-3 px-4 md:px-8" 
        : "py-6 px-4 md:px-12"
    }`}>
      <div className={`max-w-7xl mx-auto rounded-[2rem] transition-all duration-500 border ${
        isScrolled 
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl border-white/40 dark:border-slate-800" 
          : "bg-transparent border-transparent shadow-none"
      }`}>
        <div className="px-6 py-2 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center group relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative z-10"
            >
              <img
                src="/EventifyXlogo.png"
                alt="EventifyX logo"
                className="h-10 w-10 md:h-12 md:w-12 object-contain drop-shadow-xl"
              />
            </motion.div>
            <span className={`hidden lg:block ml-3 font-black text-xl tracking-tighter ${
              isScrolled ? "text-slate-900 dark:text-white" : "text-slate-900 dark:text-white"
            }`}>
              Eventify<span className="text-purple-600">X</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-1 p-1 bg-slate-100/50 dark:bg-slate-800/30 rounded-2xl border border-white/20 dark:border-slate-700/30">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                  location.pathname === link.path
                    ? "text-white"
                    : "text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-white"
                }`}
              >
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="nav-bg"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 shadow-sm transition-all"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </motion.button>

            {isLoggedIn && currentUser ? (
              <div className="flex items-center gap-3">
                <button className="hidden sm:flex p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300 hover:text-purple-600 transition-colors">
                  <Bell size={20} />
                </button>

                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDropdown(!showDropdown);
                    }}
                    className="flex items-center gap-2 p-1.5 pr-3 bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/40 rounded-2xl hover:shadow-lg transition-all"
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={currentUser.name} className="w-8 h-8 rounded-xl object-cover" />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold">
                        {currentUser.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-3xl shadow-2xl p-2 z-[101]"
                      >
                        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 mb-2">
                          <p className="font-black text-slate-900 dark:text-white truncate">{capitalizeFirstLetter(currentUser.name)}</p>
                          <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                          {userRole && (
                            <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${ROLE_COLORS[userRole]?.bg || 'bg-slate-100'} ${ROLE_COLORS[userRole]?.text || 'text-slate-800'}`}>
                              {ROLE_DISPLAY_NAMES[userRole]}
                            </span>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <DropdownLink to="/profile" icon={User} label="My Profile" onClick={() => setShowDropdown(false)} />
                          <DropdownLink to="/my-tickets" icon={Ticket} label="My Tickets" onClick={() => setShowDropdown(false)} />
                          
                          {hasRole(userRole, ROLES.ADMIN) && (
                            <DropdownLink to="/admin" icon={Shield} label="Admin Panel" color="text-purple-600" onClick={() => setShowDropdown(false)} />
                          )}
                          
                          {hasRole(userRole, ROLES.EVENT_MANAGER) && (
                            <DropdownLink to="/manager" icon={BarChart3} label="Manager Dashboard" color="text-blue-600" onClick={() => setShowDropdown(false)} />
                          )}
                        </div>
                        
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout Session
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="hidden sm:flex px-6 py-2.5 font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:-translate-y-0.5 transition-all"
                >
                  Join Now
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl bg-white/50 dark:bg-slate-800/50 border border-white/40 dark:border-slate-700/40 text-slate-600 dark:text-slate-300"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl rounded-[2rem] border border-white/50 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="p-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-2xl font-bold text-lg ${
                    location.pathname === link.path
                      ? "bg-purple-600/10 text-purple-600"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {!isLoggedIn && (
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-3 rounded-2xl font-bold text-lg text-slate-600 dark:text-slate-300"
                >
                  Log In
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const DropdownLink = ({ to, icon: Icon, label, color = "text-slate-600 dark:text-slate-300", onClick }: any) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold ${color} hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors`}
  >
    <Icon className="w-4 h-4 mr-3" />
    {label}
  </Link>
);

export default Navbar;
