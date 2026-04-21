import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Calendar, MapPin, CreditCard, ArrowRight, Sparkles, Zap, Ticket as TicketIcon } from 'lucide-react';
import { resolveApiRoot } from '../services/apiRoot';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
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

const CheckoutSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const API_ROOT = resolveApiRoot();

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetchTickets = async () => {
      if (!sessionId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_ROOT}/payments/tickets/session/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setTickets(Array.isArray(data) ? data : []);
        } else {
           // Poll if not immediately ready
           const poll = setInterval(async () => {
             const r = await fetch(`${API_ROOT}/payments/tickets/session/${sessionId}`);
             if (r.ok) {
               const d = await r.json();
               setTickets(d);
               setLoading(false);
               clearInterval(poll);
             }
           }, 3000);
           setTimeout(() => clearInterval(poll), 30000); // 30s timeout
        }
      } catch (err) {
        console.error('Error fetching tickets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [sessionId, API_ROOT]);

  const downloadTicket = (ticket: Ticket) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1200;
    canvas.height = 800;
    ctx.fillStyle = '#0f172a'; // Deep slate
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Aesthetic pattern
    ctx.strokeStyle = 'rgba(147, 51, 234, 0.2)';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 60px Inter, Arial';
    ctx.textAlign = 'left';
    ctx.fillText('EVNTX/NODE', 80, 100);
    
    ctx.font = 'bold 32px Inter, Arial';
    ctx.fillText(ticket.event.title.toUpperCase(), 80, 200);
    
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = '20px Inter, Arial';
    ctx.fillText(`ID: ${ticket._id.toUpperCase()}`, 80, 240);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, Arial';
    ctx.fillText(`DATE: ${new Date(ticket.event.date).toLocaleDateString()}`, 80, 320);
    ctx.fillText(`VENU: ${ticket.event.location.toUpperCase()}`, 80, 360);
    ctx.fillText(`SEAT: ${ticket.seatNumber.toUpperCase()}`, 80, 400);

    const qrImg = new Image();
    qrImg.crossOrigin = "anonymous";
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 800, 100, 300, 300);
      const link = document.createElement('a');
      link.download = `ticket-eventifyx-${ticket._id.slice(-6)}.png`;
      link.href = canvas.toDataURL();
      link.click();
    };
    qrImg.src = ticket.qrCode;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-16 h-16 border-t-4 border-purple-600 rounded-full"
        />
      </div>
    );
  }

  const successEvent = tickets[0]?.event;
  const totalPaid = tickets.reduce((sum, t) => sum + t.price, 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto px-6 py-24 relative">
        {/* Background Spark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-purple-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto space-y-20">
          {/* Celebratory Hero */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 10, stiffness: 100 }}
              className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-[2rem] mx-auto flex items-center justify-center shadow-2xl shadow-emerald-500/30"
            >
               <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>
            
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 font-black text-[10px] uppercase tracking-[0.4em]"
              >
                 <Sparkles size={12} /> Transaction Synchronized
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter"
              >
                Manifested <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-500">Successfully</span>
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-slate-500 dark:text-slate-400 text-xl font-bold max-w-xl mx-auto"
              >
                Your node has been secured in the event lattice. Digital credentials generated.
              </motion.p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Ledger Summary */}
            <div className="lg:col-span-4 space-y-6">
              <TiltCard damping={15}>
                <div className="p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                     <TicketIcon className="text-slate-100 dark:text-slate-800" size={80} />
                  </div>
                  
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10 tracking-tight">Ledger Summary</h2>
                  
                  <div className="space-y-6 relative z-10">
                    <LedgerItem icon={Calendar} label="Temporal Node" value={new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} />
                    <LedgerItem icon={CreditCard} label="Total Settlement" value={`₹${totalPaid.toLocaleString()}`} />
                    <LedgerItem icon={MapPin} label="Geospatial Link" value={successEvent?.location || "Central Grid"} />
                  </div>

                  <div className="pt-10 flex flex-col gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/my-tickets')}
                      className="w-full h-16 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 group"
                    >
                      Access Vault <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                    </motion.button>
                    <button
                      onClick={() => navigate('/')}
                      className="w-full h-16 bg-white dark:bg-slate-800 text-slate-600 dark:text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all"
                    >
                      Return to Hub
                    </button>
                  </div>
                </div>
              </TiltCard>

              {/* Security Badge */}
              <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2.5rem] shadow-2xl flex items-center gap-6">
                 <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center shadow-inner">
                    <Zap className="text-purple-400 w-6 h-6" />
                 </div>
                 <div>
                    <p className="text-white font-black text-sm">Encrypted Connection</p>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">TLS 1.3 Certified</p>
                 </div>
              </div>
            </div>

            {/* Credential Vault */}
            <div className="lg:col-span-8">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <AnimatePresence>
                   {tickets.map((ticket, idx) => (
                     <motion.div
                       key={ticket._id}
                       initial={{ opacity: 0, y: 30 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                     >
                       <TiltCard damping={20}>
                          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden group">
                             <div className="h-2 bg-gradient-to-r from-purple-600 to-blue-600" />
                             
                             <div className="p-10">
                                <div className="flex justify-between items-start mb-8">
                                   <div>
                                      <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.3em] mb-2">{ticket.type} Access</p>
                                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{ticket.event.title}</h3>
                                   </div>
                                   <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">
                                      <span className="text-[10px] font-mono font-black text-slate-400">#{ticket._id.slice(-6).toUpperCase()}</span>
                                   </div>
                                </div>

                                <div className="p-6 bg-white rounded-[2rem] shadow-inner mb-8 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
                                   <img 
                                     src={ticket.qrCode} 
                                     alt="QR" 
                                     className="w-40 h-40" 
                                     onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + ticket._id; }}
                                   />
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                   <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Seat</p>
                                      <p className="font-black text-slate-900 dark:text-white uppercase">{ticket.seatNumber}</p>
                                   </div>
                                   <div className="p-5 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                                      <p className="font-black text-emerald-500 uppercase">Secured</p>
                                   </div>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => downloadTicket(ticket)}
                                  className="w-full h-16 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 transition-all"
                                >
                                   <Download size={14} /> Local Mirror (PNG)
                                </motion.button>
                             </div>
                          </div>
                       </TiltCard>
                     </motion.div>
                   ))}
                 </AnimatePresence>
               </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const LedgerItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50">
    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center shrink-0">
      <Icon className="w-6 h-6 text-purple-600" />
    </div>
    <div className="overflow-hidden">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
      <p className="text-lg font-black text-slate-900 dark:text-white tracking-tighter truncate">{value}</p>
    </div>
  </div>
);

export default CheckoutSuccessPage;
