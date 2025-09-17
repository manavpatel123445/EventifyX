import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  User,
} from "lucide-react";
import { toast } from "react-hot-toast";

const SideBar: React.FC = () => {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Events", path: "/admin/eventlist", icon: <Calendar size={20} /> },
    { name: "Users", path: "/admin/userlist", icon: <Users size={20} /> },
    { name: "Profile", path: "/admin/profile", icon: <User size={20} /> },
  ];

  return (
    <aside className="h-screen sticky top-0 bg-white shadow-md w-64 p-6 flex flex-col ">
      {/* Logo */}
      <div className="p-6 text-2xl font-bold text-red-500">
        EventifyX
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                isActive
                  ? "bg-red-100 text-red-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Footer with Logout */}
      <div className="mt-auto p-4 border-t">
        <button
          onClick={() => {
            // Clear authentication tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
            
            // Show success message
            toast.success('Successfully logged out');
            
            // Redirect to login page
            window.location.href = '/login';
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
