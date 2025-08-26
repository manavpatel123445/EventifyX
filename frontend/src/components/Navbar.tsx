import React from "react";
import { Link } from "react-router-dom";

const Navbar: React.FC = () => {
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
            Contact asp
          </Link>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
