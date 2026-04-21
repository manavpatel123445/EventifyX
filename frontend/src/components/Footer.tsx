import React from "react";
import { Link, NavLink } from "react-router-dom";
import { 
  Facebook, Twitter, Instagram, Linkedin, 
  Send, Sparkles, Globe 
} from "lucide-react";
import { motion } from "framer-motion";

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-slate-950 text-slate-400 py-20 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link to="/" className="flex items-center mb-8 group">
              <div className="relative">
                <img
                  src="/EventifyXlogo.png"
                  alt="EventifyX logo"
                  className="h-12 w-12 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <span className="ml-3 text-3xl font-black text-white tracking-tighter">
                Eventify<span className="text-purple-600">X</span>
              </span>
            </Link>
            <p className="text-lg leading-relaxed mb-10 max-w-sm">
              The world's leading decentralized event ecosystem. 
              Discover, host, and verify experiences with zero friction.
            </p>
            <div className="flex gap-4">
              <SocialIcon Icon={Facebook} href="#" />
              <SocialIcon Icon={Twitter} href="https://x.com/eventifyx" />
              <SocialIcon Icon={Instagram} href="#" />
              <SocialIcon Icon={Linkedin} href="#" />
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Navigation</h3>
            <ul className="space-y-4 font-bold">
              <FooterLink to="/">Home Universe</FooterLink>
              <FooterLink to="/events">Event Horizon</FooterLink>
              <FooterLink to="/create-event">Create Reality</FooterLink>
              <FooterLink to="/contact">Neural Support</FooterLink>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Ecosystem</h3>
            <ul className="space-y-4 font-bold">
              <FooterLink to="/terms">Directives</FooterLink>
              <FooterLink to="/privacy">Privacy Shield</FooterLink>
              <FooterLink to="/faq">Brain Trust</FooterLink>
              <FooterLink to="/help">Control Center</FooterLink>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-4">
            <h3 className="text-white font-black uppercase tracking-widest text-xs mb-8">Join the Pulse</h3>
            <p className="mb-6 font-medium">Subscribe to receive exclusive drops and early-bird access to global events.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="neuro@link.com"
                className="w-full h-16 bg-slate-900 border border-slate-800 rounded-2xl px-6 outline-none focus:ring-2 focus:ring-purple-600 transition-all font-bold text-white pr-16"
              />
              <button className="absolute right-2 top-2 bottom-2 w-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Global Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10 border-y border-slate-900 mb-10">
           <Stat label="Total Events" value="12.4k+" />
           <Stat label="Global Users" value="850k" />
           <Stat label="Countries" value="124" />
           <Stat label="Network Status" value="Online" color="text-emerald-500" />
        </div>

        {/* Bottom Credits */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm font-bold opacity-40">
            © {new Date().getFullYear()} EventifyX Network. All Rights Reserved. Built with ❤️ for the Community.
          </p>
          <div className="flex items-center gap-6 text-xs font-black uppercase tracking-[0.2em] opacity-40">
             <span className="flex items-center gap-2"><Globe size={14} /> Global Node</span>
             <span className="flex items-center gap-2"><Sparkles size={14} /> Beta v2.4.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink = ({ to, children }: any) => (
  <li>
    <NavLink 
      to={to} 
      className={({ isActive }) => 
        `transition-colors duration-300 hover:text-purple-500 ${isActive ? 'text-purple-600' : ''}`
      }
    >
      {children}
    </NavLink>
  </li>
);

const SocialIcon = ({ Icon, href }: any) => (
  <motion.a
    href={href}
    whileHover={{ scale: 1.1, y: -5 }}
    whileTap={{ scale: 0.9 }}
    className="w-12 h-12 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-400 hover:text-purple-500 hover:border-purple-500/50 transition-all"
  >
    <Icon size={20} />
  </motion.a>
);

const Stat = ({ label, value, color = "text-white" }: any) => (
  <div className="text-center md:text-left">
    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-1">{label}</p>
    <p className={`text-2xl font-black ${color}`}>{value}</p>
  </div>
);

export default Footer;
