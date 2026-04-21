/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Download, Calendar, MapPin, Ticket as TicketIcon, Search, Filter, ArrowRight, Smartphone, Star, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import { resolveApiRoot } from '../services/apiRoot';
import TiltCard from '../components/TiltCard';
import { motion, AnimatePresence } from 'framer-motion';

interface Ticket {
  _id: string;
  type: string;
  price: number;
  status: string;
  qrCode: string;
  seatNumber: string;
  event: {
    _id: string;
    title: string;
    date: string;
    location: string;
    image: string;
  };
  payment: {
    _id: string;
    amount: number;
    currency: string;
    status: string;
  };
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

const MyTicketsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(6);

  const sessionId = searchParams.get('session_id');
  const API_ROOT = resolveApiRoot();

  // Unique event options from tickets
  const eventOptions = useMemo(() => {
    const map = new Map<string, { id: string; title: string }>();
    for (const t of tickets) {
      const id = t.event?._id;
      if (id && !map.has(id)) {
        map.set(id, { id, title: t.event?.title || 'Event' });
      }
    }
    return Array.from(map.values());
  }, [tickets]);

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    if (selectedEventId === 'all') return tickets;
    return tickets.filter(t => t.event?._id === selectedEventId);
  }, [tickets, selectedEventId]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredTickets.length / pageSize)), [filteredTickets.length, pageSize]);
  
  useEffect(() => { setPage(1); }, [selectedEventId, pageSize]);
  
  const pagedTickets = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, page, pageSize]);

  const normalizeTicket = (t: any): Ticket => {
    const ev = t?.event || {};
    const payment = t?.payment || {};
    return {
      _id: String(t?._id || ''),
      type: String(t?.type || 'regular'),
      price: Number(t?.price || 0),
      status: String(t?.status || 'active'),
      qrCode: String(t?.qrCode || ''),
      seatNumber: String(t?.seatNumber || ''),
      event: {
        _id: String(ev?._id || ''),
        title: String(ev?.title || 'Event'),
        date: String(ev?.date || ev?.startDate || ev?.endDate || new Date().toISOString()),
        location: String(ev?.location || ev?.venue?.name || ev?.venue?.city || 'Virtual Nexus'),
        image: String(ev?.image || (Array.isArray(ev?.images) ? ev.images[0] : '') || ''),
      },
      payment: {
        _id: String(payment?._id || payment || ''),
        amount: Number(payment?.amount || 0),
        currency: String(payment?.currency || 'USD'),
        status: String(payment?.status || 'succeeded'),
      },
      user: {
        name: String(t?.user?.name || 'You'),
        email: String(t?.user?.email || ''),
      },
      createdAt: String(t?.createdAt || new Date().toISOString()),
    };
  };

  useEffect(() => {
    const fetchTickets = async () => {
      const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      try {
        const response = await fetch(`${API_ROOT}/payments/tickets${sessionId ? `/session/${sessionId}` : ''}`, { headers });
        if (response.ok) {
          const data = await response.json();
          setTickets(Array.isArray(data) ? data.map(normalizeTicket) : []);
        } else {
          setError('No Active Access Passes Detected');
        }
      } catch (err) {
        setError('Transmission Protocol Error');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [sessionId, API_ROOT]);

  const downloadTicket = (_ticket: Ticket) => {
    toast.success('Compiling Physical Identity Token...');
    // Existing logic...
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10">
      <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
      <p className="text-purple-400 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Vault...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-10 text-center">
      <div className="w-20 h-20 bg-red-500/10 rounded-[2.5rem] border border-red-500/20 flex items-center justify-center mb-8 shadow-2xl shadow-red-500/5">
        <Globe size={40} className="text-red-500 animate-pulse" />
      </div>
      <h3 className="text-3xl font-black text-white tracking-tighter mb-4">{error}</h3>
      <p className="text-slate-400 font-bold max-w-sm mb-10">We couldn't establish a secure connection to your ticket vault. Please verify your credentials and try again.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-10 py-5 bg-white text-slate-950 rounded-[2rem] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all"
      >
        Retry Connection
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />

      <main className="pt-32 pb-24">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Futuristic Page Header */}
          <div className="mb-16">
             <motion.div 
               initial={{ opacity: 0, x: -30 }} 
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-4 mb-3"
             >
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-600 to-transparent rounded-full" />
                <span className="text-purple-600 dark:text-purple-400 font-black text-xs uppercase tracking-[0.4em]">Personal Vault</span>
             </motion.div>
             <motion.h1 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter mb-4"
             >
               Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-500">Access Passes</span>
             </motion.h1>
             <p className="text-slate-500 dark:text-slate-400 max-w-2xl font-bold">
               Secure portal for all your digital event identities. Download, share, and manage your encrypted entry tokens.
             </p>
          </div>

          {/* Filtering Hub */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row items-center gap-8"
          >
             <div className="flex-1 flex items-center gap-4 w-full">
                <Search className="text-slate-400" size={20} />
                <select 
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="bg-transparent border-none outline-none font-black text-slate-900 dark:text-white text-lg w-full cursor-pointer appearance-none"
                >
                   <option value="all">Global Stream View</option>
                   {eventOptions.map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                </select>
             </div>
             
             <div className="h-10 w-[1px] bg-slate-200 dark:bg-slate-800 hidden md:block" />

             <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                   <Filter size={18} className="text-purple-600" />
                   <span className="text-xs font-black uppercase tracking-widest text-slate-400">Page Sync:</span>
                   <select 
                     value={pageSize}
                     onChange={(e) => setPageSize(Number(e.target.value))}
                     className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-xl text-xs font-black outline-none cursor-pointer"
                   >
                      {[4, 6, 8, 12].map(n => <option key={n} value={n}>{n} Nodes</option>)}
                   </select>
                </div>
                <div className="px-6 py-2 bg-emerald-500/10 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                   Vault Secure
                </div>
             </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {pagedTickets.length > 0 ? (
              <motion.div 
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-10"
              >
                {pagedTickets.map((ticket, idx) => (
                  <TicketCard key={ticket._id} ticket={ticket} download={downloadTicket} idx={idx} />
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-24 text-center"
              >
                 <div className="w-32 h-32 bg-slate-100 dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 flex items-center justify-center mx-auto mb-8 shadow-inner">
                    <TicketIcon size={48} className="text-slate-300 dark:text-slate-700" />
                 </div>
                 <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-4">No Access Passes Detected</h3>
                 <p className="text-slate-500 dark:text-slate-400 font-bold mb-10 max-w-sm mx-auto">Your vault is currently empty. Initialize a connection to an event to generate a token.</p>
                 <button 
                   onClick={() => navigate('/events')}
                   className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 mx-auto"
                 >
                    Initialize Discovery
                    <ArrowRight size={20} />
                 </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* New Modern Pagination */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-6">
               <PaginationButton 
                 active={page > 1} 
                 onClick={() => setPage(page - 1)} 
                 label="Prev Signal" 
               />
               <div className="flex items-center gap-2">
                 {Array.from({ length: totalPages }).map((_, i) => (
                   <button 
                     key={i}
                     onClick={() => setPage(i + 1)}
                     className={`w-10 h-10 rounded-full font-black text-xs transition-all ${
                       page === i + 1 
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-purple-600'
                     }`}
                   >
                     {i + 1}
                   </button>
                 ))}
               </div>
               <PaginationButton 
                 active={page < totalPages} 
                 onClick={() => setPage(page + 1)} 
                 label="Next Signal" 
               />
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
};

const TicketCard = ({ ticket, idx }: any) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
    >
      <TiltCard damping={15}>
        <div className="relative group overflow-hidden bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[3rem] border border-white/50 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row">
          
          {/* Punched Side Decoration */}
          <div className="absolute left-[33.33%] top-0 bottom-0 w-[1px] bg-dashed-border pointer-events-none hidden md:block" />
          <div className="absolute left-[33.33%] -top-4 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border border-white/50 dark:border-slate-800 z-10 hidden md:block" />
          <div className="absolute left-[33.33%] -bottom-4 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-950 border border-white/50 dark:border-slate-800 z-10 hidden md:block" />

          {/* Preview Section */}
          <div className="md:w-1/3 relative overflow-hidden group">
             <img 
               src={ticket.event.image || 'https://images.unsplash.com/photo-1540575861501-7ad05823c9f5?w=800&q=80'} 
               className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80" />
             <div className="absolute bottom-6 left-6 right-6">
                <span className="px-4 py-1 bg-white/20 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-widest rounded-full border border-white/30 mb-2 inline-block">
                   Token Locked
                </span>
                <h4 className="text-white font-black text-2xl tracking-tighter line-clamp-2">{ticket.event.title}</h4>
             </div>
          </div>

          {/* Info Section */}
          <div className="flex-1 p-10 flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
                         <Star size={18} fill="currentColor" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Premium Entity</p>
                         <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{ticket.type.toUpperCase()}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Entry UID</p>
                      <p className="font-black text-purple-600 dark:text-purple-400 text-sm tracking-tight">#{ticket._id.slice(-8).toUpperCase()}</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-10">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <Calendar size={10} /> Arrival Date
                      </p>
                      <p className="font-extrabold text-slate-900 dark:text-white tracking-tight">{new Date(ticket.event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <MapPin size={10} /> Signal Origin
                      </p>
                      <p className="font-extrabold text-slate-900 dark:text-white tracking-tight truncate">{ticket.event.location}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <Smartphone size={10} /> Digital Seat
                      </p>
                      <p className="font-extrabold text-slate-900 dark:text-white tracking-tight">{ticket.seatNumber || 'DYNAMIC GA'}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                         <Globe size={10} /> Cost Node
                      </p>
                      <p className="font-extrabold text-slate-900 dark:text-white tracking-tight">${ticket.price.toFixed(2)} USD</p>
                   </div>
                </div>
             </div>

             <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => navigate(`/events/${ticket.event._id}`)}
                  className="h-12 px-6 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                   Discovery Page
                </button>
                <button 
                  className="h-12 px-6 bg-purple-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:shadow-purple-500/20 transition-all flex items-center gap-2"
                >
                   <Download size={14} /> Download PDF
                </button>
             </div>
             
             {/* Decorative Background Icon */}
             <TicketIcon size={120} className="absolute -bottom-10 -right-10 text-slate-950/5 dark:text-white/5 -rotate-12 pointer-events-none" />
          </div>

          {/* QR Section */}
          <div className="md:w-1/4 p-10 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-950/50 relative overflow-hidden">
             <div className="w-full aspect-square bg-white rounded-3xl p-4 shadow-inner relative group/qr overflow-hidden">
                <img 
                  src={ticket.qrCode} 
                  className="w-full h-full object-contain relative z-10" 
                  onError={(e: any) => e.target.src = '/qr-fallback.png'}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-purple-500/10 via-transparent to-purple-500/10 pointer-events-none z-20 animate-scan" />
             </div>
             <p className="mt-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
                Scan for Neural Entry
             </p>
             <div className="mt-4 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Link</span>
             </div>
          </div>

        </div>
      </TiltCard>
    </motion.div>
  );
};

const PaginationButton = ({ active, onClick, label }: any) => (
  <button 
    disabled={!active}
    onClick={onClick}
    className={`h-12 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
      active 
        ? 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white shadow-xl hover:-translate-y-1' 
        : 'opacity-30 cursor-not-allowed text-slate-400 border border-transparent'
    }`}
  >
    {label}
  </button>
);

export default MyTicketsPage;
