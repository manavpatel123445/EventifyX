import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  User,
  ChevronRight,
  Shield
} from "lucide-react";
import { toast } from "react-hot-toast";

const SideBar: React.FC = () => {
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

  return (
    <div className="flex flex-col h-screen sticky top-0 bg-gradient-to-b from-white to-gray-50 w-64 border-r border-gray-200 shadow-sm">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Logo */}
        <div className="px-6 py-5 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-500 rounded-md flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-4 space-y-1">
            <div className="px-3 mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Main Menu
              </p>
            </div>
            
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg mx-2 transition-all duration-200 ${
                    isActive
                      ? "bg-red-50 text-red-600"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
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
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sticky Profile Section */}
        <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
          <div className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Admin</p>
                <p className="text-xs text-gray-500">View Profile</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-500 transition-colors"
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
