/* eslint-disable @typescript-eslint/no-unused-vars */
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAllEvents, type Event } from "../services/eventService";
import { formatINR } from "../utils/currency";
import { getAllCategories } from "../services/categoryService";
import TiltCard from "../components/TiltCard";
import { motion } from "framer-motion";
import { 
  Search, MapPin, Calendar, ArrowRight, Zap, 
  ShieldCheck, Star, Users, Play, Globe, Sparkles 
} from "lucide-react";

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: string;
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Categories Query
  const { data: categoriesResponse, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: async () => {
      const response = await getAllCategories();
      return response;
    },
    staleTime: 10 * 60 * 1000,
  });

  // Events Query
  const { data: eventsResponse, isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'active', { limit: 8 }],
    queryFn: async () => {
      const response = await getAllEvents({ limit: 8 });
      return response;
    },
    staleTime: 5 * 60 * 1000,
  });

  const events: Event[] = eventsResponse?.data?.events || eventsResponse?.events || [];
  const categories: Category[] = categoriesResponse?.data || categoriesResponse || [];
  const activeCategories = categories.filter((cat: Category) => !cat.status || cat.status === 'active');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    window.location.href = `/events?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-x-hidden">
      <Navbar />
      
      {/* 🎭 Cinematic Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-32">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1920&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover scale-110 blur-sm brightness-[0.4] dark:brightness-[0.3]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/20 to-slate-950" />
        </div>

        {/* Animated Particles/Blobs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />

        <div className="relative z-10 container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Transforming your Event Experiences</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
              Discover <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">Extraordinary</span> <br />
              Experiences
            </h1>
            <p className="text-slate-300 text-xl md:text-2xl max-w-xl mb-12 leading-relaxed">
              Join millions of people discovering events, festivals, and workshops tailored to your soul's calling.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link
                to="/events"
                className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group"
              >
                Start Exploring
                <ArrowRight className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <button className="px-10 py-5 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-[2rem] font-black text-lg hover:bg-white/20 transition-all flex items-center gap-3">
                <Play className="fill-white" size={20} />
                Watch How it Works
              </button>
            </div>
            
            <div className="mt-12 flex items-center gap-6">
               <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-12 h-12 rounded-full border-4 border-slate-900 shadow-xl" />
                 ))}
                 <div className="w-12 h-12 rounded-full bg-indigo-600 border-4 border-slate-900 flex items-center justify-center text-white font-bold text-xs">9k+</div>
               </div>
               <p className="text-slate-400 text-sm font-bold tracking-wide uppercase">Trusted by Event Creators Globally</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <TiltCard damping={10} stiffness={100}>
               <div className="relative rounded-[3rem] overflow-hidden border border-white/20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]">
                 <img
                   src="https://images.unsplash.com/photo-1514525253361-bee8a187499b?auto=format&fit=crop&w=600&q=80"
                   className="w-full h-full object-cover"
                   alt="Featured Experience"
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                 <div className="absolute bottom-10 left-10 right-10">
                   <div className="px-4 py-1 bg-purple-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest inline-block mb-4">Trending Now</div>
                   <h3 className="text-3xl font-black text-white mb-2 leading-tight">Lunar Light Music Festival 2026</h3>
                   <div className="flex items-center gap-4 text-slate-300">
                      <div className="flex items-center gap-2"><MapPin size={16} className="text-purple-400" /> <span className="text-xs font-bold uppercase tracking-widest leading-none">Los Angeles, CA</span></div>
                      <div className="flex items-center gap-2"><Calendar size={16} className="text-purple-400" /> <span className="text-xs font-bold uppercase tracking-widest leading-none">Aug 24-26</span></div>
                   </div>
                 </div>
               </div>
            </TiltCard>
            
            {/* Flying Glass Cards */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-10 -right-10 p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl z-10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/50">
                  <ShieldCheck size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Secure Payments</p>
                   <p className="text-sm font-bold text-white leading-none">Verified Merchant</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl z-10"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/50">
                  <Users size={24} />
                </div>
                <div>
                   <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Connect</p>
                   <p className="text-sm font-bold text-white leading-none">12.5k Joined</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 🔍 Premium Search Hub */}
      <section className="relative z-20 mt-[-100px] container mx-auto px-6">
        <motion.div
           initial={{ y: 50, opacity: 0 }}
           whileInView={{ y: 0, opacity: 1 }}
           viewport={{ once: true }}
           className="p-8 md:p-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-2xl flex flex-col lg:flex-row items-center gap-8"
        >
          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">What's the vibe?</label>
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-purple-600" size={24} />
              <input
                type="text"
                placeholder="Concerts, Tech Conferences, Digital Art..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-20 pl-16 pr-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xl font-bold focus:ring-4 focus:ring-purple-500/20 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 w-full space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-4">Where to?</label>
            <div className="relative group">
              <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-purple-600" size={24} />
              <input
                type="text"
                placeholder="New York, Remote, Tokyo..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full h-20 pl-16 pr-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xl font-bold focus:ring-4 focus:ring-purple-500/20 outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            className="w-full lg:w-auto h-20 px-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20"
          >
            Find Experience
          </button>
        </motion.div>
      </section>

      {/* 📁 Glassmorphic Categories */}
      <section className="py-32 container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
           <div>
             <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Industries</span></h2>
             <p className="text-slate-500 dark:text-slate-400 text-xl font-medium max-w-xl">Dive into curated universes of specialized events and global communities.</p>
           </div>
           <Link to="/events" className="group flex items-center gap-3 text-lg font-black text-purple-600 hover:text-purple-700 transition-colors">
              Browse Everything <ArrowRight className="group-hover:translate-x-2 transition-transform" />
           </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
           {categoriesLoading ? (
             [1,2,3,4,5].map(i => <div key={i} className="h-64 rounded-[2.5rem] bg-slate-200 dark:bg-slate-800 animate-pulse" />)
           ) : activeCategories.slice(0, 10).map((cat, idx) => (
             <motion.div
               key={cat._id}
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: idx * 0.05 }}
               viewport={{ once: true }}
             >
               <TiltCard damping={15} stiffness={150}>
                 <Link to={`/events?category=${cat._id}`} className="group relative block aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-white/70 dark:bg-slate-900/70 border border-white/40 dark:border-slate-800 p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500"
                      style={{ backgroundColor: cat.color || '#8b5cf6' }}
                    />
                    <div 
                      className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-all duration-500"
                      style={{ backgroundColor: `${cat.color || '#8b5cf6'}15`, color: cat.color || '#8b5cf6' }}
                    >
                      {cat.icon || '🛸'}
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-2">{cat.name}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-bold line-clamp-2 leading-relaxed opacity-60 group-hover:opacity-100">{cat.description || "Discover niche experiences in this category."}</p>
                    <div className="absolute bottom-8 right-8 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:translate-x-0 translate-x-4 transition-all duration-500">
                       <ArrowRight size={20} className="text-slate-900 dark:text-white" />
                    </div>
                 </Link>
               </TiltCard>
             </motion.div>
           ))}
        </div>
      </section>

      {/* 🚀 Showcase Events */}
      <section className="py-32 bg-slate-100 dark:bg-slate-900/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
             >
               <p className="text-purple-600 font-black uppercase tracking-[0.3em] text-xs mb-4">Curation</p>
               <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter">Live & <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Upcoming</span></h2>
               <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Hand-picked experiences selected by our neural algorithms for maximum impact.</p>
             </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {eventsLoading ? (
              [1,2,3,4].map(i => <div key={i} className="h-96 rounded-[3rem] bg-slate-200 dark:bg-slate-800 animate-pulse" />)
            ) : events.slice(0, 8).map((event, idx) => (
              <motion.div
                key={event._id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <TiltCard damping={25} stiffness={200} className="h-full">
                  <Link to={`/events/${event._id}`} className="group block h-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="relative aspect-video overflow-hidden">
                       <img src={event.images?.[0] || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                       <div className="absolute top-6 left-6 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/30">
                         {event.category?.name || 'Experience'}
                       </div>
                    </div>
                    <div className="p-8">
                       <h3 className="text-xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight group-hover:text-purple-600 transition-colors">
                         {event.title}
                       </h3>
                       <div className="space-y-3 opacity-60 group-hover:opacity-100 transition-opacity">
                         <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                           <Calendar size={16} className="text-purple-500" />
                           {new Date(event.startDate).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400">
                           <MapPin size={16} className="text-blue-500" />
                           {event.venue?.city || 'Virtual'}
                         </div>
                       </div>
                       <div className="mt-8 flex items-center justify-between">
                         <p className="text-2xl font-black text-slate-900 dark:text-white">
                            {typeof event.ticketPricing?.[0]?.price === 'number' ? formatINR(event.ticketPricing[0].price) : 'Free'}
                         </p>
                         <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <ArrowRight size={20} />
                         </div>
                       </div>
                    </div>
                  </Link>
                </TiltCard>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-24">
            <Link to="/events" className="px-12 py-5 border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white rounded-full font-black text-lg hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all active:scale-95">
              Explore All 2.5k+ Events
            </Link>
          </div>
        </div>
      </section>

      {/* 🔮 Why Section */}
      <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-purple-600/10 blur-[150px] -mr-48" />
        <div className="container mx-auto px-6 relative z-10">
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             <div className="lg:col-span-1">
               <h2 className="text-6xl font-black mb-8 leading-tight tracking-tighter">Why <br />Eventify<span className="text-purple-500">X</span>?</h2>
               <p className="text-slate-400 text-xl font-medium leading-relaxed mb-12">Building the future of human connection through secure, immersive, and borderless event management.</p>
               <Link to="/register" className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black text-lg hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] transition-all inline-block">Join the Evolution</Link>
             </div>
             
             <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="w-16 h-16 bg-purple-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Globe size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Global Access</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Book events anywhere in the world with localized currency support and secure blockchain verification.</p>
               </div>
               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Zap size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Instant Identity</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Check-in with a single neural-link or QR. No paper, no lines, no friction. Just experience.</p>
               </div>
               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Users size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Network Growth</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Connect with fellow attendees via the EventifyX neural network. Grow your circle instantly.</p>
               </div>
               <div className="p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 hover:border-white/20 transition-all group">
                  <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Star size={32} />
                  </div>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">Creator Tools</h3>
                  <p className="text-slate-400 font-medium leading-relaxed">Enterprise-grade analytics and management tools for event organizers of all sizes.</p>
               </div>
             </div>
           </div>
        </div>
      </section>

      {/* 📣 Community Feed Banner */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden text-center group cursor-pointer">
         <motion.div
            animate={{ x: [-100, 100] }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear", repeatType: "mirror" }}
            className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
         >
            <h2 className="text-[20rem] font-black whitespace-nowrap">COMMUNITY FEED</h2>
         </motion.div>
         <div className="relative z-10 container mx-auto px-6">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tighter">Ready to become an Organizer?</h2>
            <p className="text-white/80 text-xl font-bold mb-10 max-w-2xl mx-auto">Start building your community events today with our zero-commission trial.</p>
            <Link to="/create-event" className="inline-block px-12 py-5 bg-white text-purple-600 rounded-full font-black text-xl shadow-2xl shadow-black/20 transform hover:-translate-y-1 transition-all">Host Your First Event</Link>
         </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;