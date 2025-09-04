import React from "react";
import { Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Users,
  LogOut,
  User,
} from "lucide-react";

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

      {/* Footer */}
      <div className="p-4 border-t text-center text-sm text-gray-500">
         <Link to="/" className="hover:underline">
        <LogOut className="w-4 h-4 mr-2" />
                          
        </Link>
      </div>
    </aside>
  );
};

export default SideBar;
