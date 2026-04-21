/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllEvents } from "../services/eventService";
import { getAllCategories } from "../services/categoryService";
import type { Event } from "../services/eventService";
import TiltCard from "../components/TiltCard";
import { motion } from "framer-motion";
import { 
  Search, MapPin, 
  SlidersHorizontal, ArrowLeft, ArrowRight, 
  X, Sparkles, Globe, Ticket
} from "lucide-react";

interface EventsData {
  events: Event[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; status?: string }>>([]);
  const location = useLocation();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        city: selectedCity || undefined,
        page: currentPage,
        limit: 9
      };

      const response = await getAllEvents(params);
      if (response.success) {
        const data: EventsData = response.data;
        const now = new Date();
        const activeEvents = data.events.filter(event => {
          const end = event?.endDate ? new Date(event.endDate) : (event?.startDate ? new Date(event.startDate) : null);
          if (!end) return true;
          return end >= now && event.status !== 'cancelled';
        });
        setEvents(activeEvents);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategories();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        const active = list.filter((c: any) => !c.status || c.status === 'active');
        setCategories(active);
      } catch (e) {
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get('search') || "");
    setSelectedCity(params.get('city') || "");
    setSelectedCategory(params.get('category') || "");
    setCurrentPage(parseInt(params.get('page') || "1", 10) || 1);
  }, [location.search]);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, selectedCategory, selectedCity]);


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      {/* Cinematic Pulse Header */}
      <div className="relative h-[600px] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-fixed bg-center opacity-30 dark:opacity-20 scale-105" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/0 via-slate-50/50 to-slate-50 dark:from-slate-950/0 dark:via-slate-950/50 dark:to-slate-950" />
        
        <div className="relative z-10 text-center container mx-auto px-6 pt-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-[10px] uppercase tracking-[0.4em] mb-10"
          >
             <Sparkles size={14} />
             Global Experience Portal
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter"
          >
            Discover the <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">Unforgettable</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 dark:text-slate-400 text-xl font-bold max-w-2xl mx-auto leading-relaxed"
          >
            Join a global community of explorers. Access exclusive festivals, 
            high-tech conferences, and immersive performances.
          </motion.p>
        </div>
      </div>

      <main className="container mx-auto px-6 -mt-32 relative z-20 pb-32">
        {/* Intelligence Search Hub */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
             <div className="lg:col-span-4 relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Experience ID or Keyword..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-black transition-all"
                />
             </div>
             <div className="lg:col-span-3 relative group">
                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder="Geospatial Node..." 
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-black transition-all"
                />
             </div>
             <div className="lg:col-span-3 relative group">
                <SlidersHorizontal className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-emerald-500/10 text-slate-900 dark:text-white font-black transition-all appearance-none cursor-pointer"
                >
                   <option value="">All Architectures</option>
                   {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
                </select>
             </div>
             <div className="lg:col-span-2">
                <button 
                  onClick={() => { setSearchTerm(""); setSelectedCity(""); setSelectedCategory(""); }}
                  className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <X size={18} />
                  Reset
                </button>
             </div>
          </div>
        </motion.div>

        {/* Results Deck */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {[1,2,3,4,5,6].map(i => (
               <div key={i} className="h-[500px] rounded-[4rem] bg-slate-100 dark:bg-white/5 animate-pulse" />
             ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
             {events.map((event, idx) => (
               <ExperienceCard key={event._id} event={event} idx={idx} />
             ))}
          </div>
        ) : (
          <div className="py-40 flex flex-col items-center justify-center text-center">
             <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-[2rem] flex items-center justify-center mb-10 shadow-inner">
                <Globe className="text-slate-300 dark:text-slate-700" size={40} />
             </div>
             <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-6 text-balance">Perspective Shift Required</h2>
             <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mb-12">We couldn't locate any active experiences matching your current coordinates or filters.</p>
             <button 
               onClick={() => { setSearchTerm(""); setSelectedCity(""); setSelectedCategory(""); }}
               className="h-20 px-12 bg-purple-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-purple-500/40 hover:scale-105 active:scale-95 transition-all"
             >
                Reset Network Filter
             </button>
          </div>
        )}

        {/* Temporal Navigation (Pagination) */}
        {totalPages > 1 && (
           <div className="mt-32 flex items-center justify-center gap-4">
              <NavButton disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} icon={ArrowLeft} />
              <div className="flex gap-2">
                 {[...Array(totalPages)].map((_, i) => (
                   <button 
                     key={i}
                     onClick={() => setCurrentPage(i + 1)}
                     className={`w-14 h-14 rounded-2xl font-black text-lg transition-all ${
                       currentPage === i + 1 
                       ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl" 
                       : "bg-white/50 dark:bg-slate-900/50 text-slate-400 hover:text-slate-900 dark:hover:text-white border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                     }`}
                   >
                      {i + 1}
                   </button>
                 ))}
              </div>
              <NavButton disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} icon={ArrowRight} />
           </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const ExperienceCard = ({ event, idx }: { event: Event; idx: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: idx * 0.05 }}
  >
    <TiltCard damping={15}>
      <Link to={`/events/${event._id}`} className="group block relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] overflow-hidden shadow-xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] transition-all duration-700 h-[580px] flex flex-col">
        {/* Visual Portal */}
        <div className="relative h-64 overflow-hidden mask-bottom-fade">
           <motion.img 
             whileHover={{ scale: 1.1 }}
             transition={{ duration: 1 }}
             src={event.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'} 
             className="w-full h-full object-cover"
           />
           <div className="absolute top-8 left-8">
              <span className="px-5 py-2 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl">
                 {event.category?.name || 'Experience'}
              </span>
           </div>
           
           <div className="absolute inset-0 bg-gradient-to-t from-white/70 dark:from-slate-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Intellectual Core */}
        <div className="p-10 flex-1 flex flex-col">
           <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0">
                 <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                    {new Date(event.startDate).toLocaleString('en-US', { month: 'short' })}
                 </span>
                 <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                    {new Date(event.startDate).getDate()}
                 </span>
              </div>
              <div className="h-8 w-[2px] bg-slate-200 dark:bg-slate-800" />
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-bold text-sm">
                 <MapPin size={16} className="text-purple-600" />
                 {event.venue?.city || 'Global Network'}
              </div>
           </div>

           <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 line-clamp-2 leading-[1.1] tracking-tighter group-hover:text-purple-600 transition-colors">
              {event.title}
           </h3>

           <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between gap-6">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <Ticket size={12} className="text-emerald-500" />
                    Entry Configuration
                 </p>
                 <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                   {event.ticketPricing?.length ? (
                     <span className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-400">₹</span>
                        {Math.min(...event.ticketPricing.map(t => t.price))}
                     </span>
                   ) : 'Gratis'}
                 </p>
              </div>

              <div className="w-14 h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-2xl">
                 <ChevronRight size={24} />
              </div>
           </div>
        </div>
      </Link>
    </TiltCard>
  </motion.div>
);

const NavButton = ({ disabled, onClick, icon: Icon }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className="w-16 h-16 flex items-center justify-center rounded-[1.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white disabled:opacity-30 transition-all hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 active:scale-90 shadow-xl"
  >
    <Icon size={24} />
  </button>
);

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6" />
  </svg>
);

export default EventPage;
