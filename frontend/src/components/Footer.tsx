import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-10 mt-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Logo + About */}
        <div>
          <h2 className="text-2xl font-bold text-red-500 mb-4">EventifyX</h2>
          <p className="text-sm leading-6">
            Your one-stop platform to discover, book, and manage events.  
            From concerts to workshops — we’ve got you covered!
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><NavLink to="/" className="hover:text-red-500">Home</NavLink></li>
            <li><NavLink to="/events" className="hover:text-red-500">Events</NavLink></li>
            <li><NavLink to="/create-event" className="hover:text-red-500">Create Event</NavLink></li>
            <li><NavLink to="/Contect" className="hover:text-red-500">Contect Us</NavLink></li>
            <li><NavLink to="/login" className="hover:text-red-500">Home</NavLink></li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
          <ul className="space-y-2 text-sm">
            <li><a href="/help" className="hover:text-red-500">Help Center</a></li>
            <li><a href="/terms" className="hover:text-red-500">Terms & Conditions</a></li>
            <li><a href="/privacy" className="hover:text-red-500">Privacy Policy</a></li>
            <li><a href="/faq" className="hover:text-red-500">FAQs</a></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Follow Us</h3>
          <div className="flex space-x-4 text-xl">
            <a href="#" className="hover:text-red-500"><FaFacebookF /></a>
            <a href="https://x.com/home?lang=en" className="hover:text-red-500"><FaTwitter /></a>
            <a href="#" className="hover:text-red-500"><FaLinkedinIn /></a>
            <a href="#" className="hover:text-red-500"><FaInstagram /></a>
           
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-700 mt-10 pt-6 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} EventifyX. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
