import React, { useEffect, useState } from "react";
import CheckoutButton from "../components/CheckoutButton";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useLocation, useNavigate } from "react-router-dom";
import { getEventById, type Event } from "../services/eventService";
import { 
  Calendar, MapPin, CheckCircle, ShieldCheck, 
  User, Mail, ShoppingCart, ArrowRight,
  Sparkles, CreditCard, Ticket as TicketIcon, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/TiltCard";

interface Ticket {
  type: "regular" | "vip" | "premium";
  price: number;
  quantity: number;
}

const useQuery = () => new URLSearchParams(useLocation().search);

const CheckoutPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [tickets, setTickets] = useState<Ticket[]>([
    { type: "regular", price: 0, quantity: 1 }
  ]);
  const [buyerDetails, setBuyerDetails] = useState({ name: "", email: "" });
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [eventData, setEventData] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useQuery();
  const navigate = useNavigate();
  const eventId = query.get("eventId") || "";

  useEffect(() => {
    const userStr = localStorage.getItem("user") || sessionStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        setBuyerDetails({ name: u?.name || "", email: u?.email || "" });
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (!eventId) {
        navigate('/');
        return;
      }
      try {
        setLoading(true);
        const resp = await getEventById(eventId);
        const ev: Event = (resp as any)?.data ?? (resp as Event);
        setEventData(ev);
        const regular = Array.isArray(ev.ticketPricing)
          ? ev.ticketPricing.find(t => t.type === "regular")
          : undefined;
        setTickets([{ type: "regular", price: regular?.price ?? 0, quantity: 1 }]);
      } catch (err) {
        console.error("Failed to load event for checkout", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [eventId, navigate]);

  const MAX_TICKETS_PER_BOOKING = 12;
  const GST_RATE = 0.18;
  const BOOKING_FEE_RATE = 0.05;

  const handleQuantityChange = (index: number, value: number) => {
    const updated = [...tickets];
    const otherTotal = tickets.reduce((sum, t, i) => i === index ? sum : sum + t.quantity, 0);
    const newValue = Math.min(Math.max(0, value), MAX_TICKETS_PER_BOOKING - otherTotal);
    updated[index].quantity = newValue;
    setTickets(updated);
  };

  const subtotal = tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
  const bookingFee = Math.round(subtotal * BOOKING_FEE_RATE);
  const gstAmount = Math.round((subtotal + bookingFee) * GST_RATE);
  const totalAmount = subtotal + bookingFee + gstAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Synchronizing Ledger...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 dark:bg-purple-900/10 blur-[120px] -mr-96 -mt-96 animate-pulse" />
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 dark:bg-blue-900/10 blur-[120px] -ml-48 -mb-48" />
      </div>

      <main className="container mx-auto px-6 pt-32 pb-32 relative z-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-16">
          
          {/* Transaction Core */}
          <div className="lg:col-span-8">
            <motion.div 
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               className="mb-16"
            >
              <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[10px] uppercase tracking-[0.3em] mb-8">
                 <ShieldCheck size={14} />
                 Secure Transaction Node
              </div>
              <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 leading-none">
                Experience <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Verification</span>
              </h1>
              <p className="text-xl font-bold text-slate-500 dark:text-slate-400">Secure your portal access to {eventData?.title}</p>
            </motion.div>

            {/* Neural Stepper */}
            <div className="flex items-center gap-10 mb-16">
               <Step index={1} label="Configuration" active={step === 1} completed={step > 1} />
               <div className="h-[2px] flex-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: step > 1 ? "100%" : "0%" }}
                    className="h-full bg-gradient-to-r from-purple-600 to-blue-600"
                  />
               </div>
               <Step index={2} label="Final Validation" active={step === 2} completed={false} />
            </div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                <motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-10"
                >
                  {/* Allocation Hub */}
                  <div className="p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                        <ShoppingCart className="text-purple-600" />
                        Allocation Parameters
                     </h2>
                     <div className="space-y-6">
                        {tickets.map((ticket, i) => (
                          <div key={ticket.type} className="group p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 transition-all hover:border-purple-500/50 flex items-center justify-between">
                             <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                   <Zap size={10} className="text-purple-500" />
                                   Protocol: {ticket.type}
                                </p>
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white">₹{ticket.price.toLocaleString()}</h3>
                             </div>
                             
                             <div className="flex items-center gap-6 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800">
                                <button
                                  onClick={() => handleQuantityChange(i, ticket.quantity - 1)}
                                  disabled={ticket.quantity <= 1}
                                  className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all font-black text-2xl"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center font-black text-xl">{ticket.quantity}</span>
                                <button
                                  onClick={() => handleQuantityChange(i, ticket.quantity + 1)}
                                  disabled={tickets.reduce((sum, t) => sum + t.quantity, 0) >= MAX_TICKETS_PER_BOOKING}
                                  className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all font-black text-2xl"
                                >
                                  +
                                </button>
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>

                  {/* Identity Hub */}
                  <div className="p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-4">
                        <User className="text-blue-600" />
                        Attendee Identity
                     </h2>
                     <div className="grid md:grid-cols-2 gap-8">
                        <InputField 
                           label="Entity Designation" 
                           icon={User} 
                           value={buyerDetails.name} 
                           onChange={(v: string) => setBuyerDetails({ ...buyerDetails, name: v })}
                           placeholder="Full Name"
                        />
                        <InputField 
                           label="Neural Communication Link" 
                           icon={Mail} 
                           value={buyerDetails.email} 
                           onChange={(v: string) => setBuyerDetails({ ...buyerDetails, email: v })}
                           placeholder="Email Address"
                        />
                     </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={totalAmount === 0 || !buyerDetails.name || !buyerDetails.email}
                    className="w-full h-24 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-6 group hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                  >
                    Proceed to Review
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity }}>
                       <ArrowRight size={28} />
                    </motion.div>
                  </button>
                </motion.div>
              ) : (
                <motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  {/* Manifest Review */}
                  <div className="p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl">
                     <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-10">Verification Manifest</h2>
                     
                     <div className="space-y-6 pb-10 border-b border-slate-100 dark:border-slate-800">
                        {tickets.filter(t => t.quantity > 0).map(t => (
                          <div key={t.type} className="flex justify-between items-center">
                            <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-purple-500/30">
                                {t.quantity}
                              </div>
                              <div>
                                 <p className="font-black text-slate-900 dark:text-white text-lg capitalize">{t.type} Access Module</p>
                                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Single ID Allocation</p>
                              </div>
                            </div>
                            <span className="text-xl font-black text-slate-900 dark:text-white">₹{(t.price * t.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                     </div>

                     <div className="pt-10 space-y-6">
                        <div className="flex items-start gap-4 p-8 rounded-[2.5rem] bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20">
                           <div className="relative mt-1">
                              <input
                                id="consent"
                                type="checkbox"
                                checked={consentChecked}
                                onChange={(e) => setConsentChecked(e.target.checked)}
                                className="peer appearance-none w-8 h-8 rounded-xl border-2 border-indigo-500/30 checked:bg-indigo-600 transition-all cursor-pointer"
                              />
                              <CheckCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" size={18} />
                           </div>
                           <label htmlFor="consent" className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                             I acknowledge that all terminal access tokens are non-refundable and tied to the provided biometric identity details. I have reviewed the mission parameters and agree to the operational protocol.
                           </label>
                        </div>

                        <div className="flex flex-col gap-6">
                          {consentChecked ? (
                            <div className="group">
                               <CheckoutButton
                                 tickets={tickets.filter(t => t.quantity > 0)}
                                 eventId={eventId}
                                 buyerDetails={buyerDetails}
                               />
                            </div>
                          ) : (
                            <button
                              disabled
                              className="w-full h-24 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-[2rem] font-black text-xl cursor-not-allowed flex items-center justify-center gap-4 border-2 border-dashed border-slate-300 dark:border-slate-700"
                            >
                               <Sparkles size={24} className="opacity-30" />
                               Accept terms to authenticate
                            </button>
                          )}
                          <button
                            onClick={() => setStep(1)}
                            className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] hover:text-purple-600 transition-colors"
                          >
                            Modify Configuration
                          </button>
                        </div>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Intelligence Ledger (Sidebar) */}
          <div className="lg:col-span-4">
            <div className="sticky top-32 space-y-8">
              {/* Event Visual Link */}
              <TiltCard damping={20}>
                <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] p-10 shadow-2xl relative overflow-hidden group">
                  <div className="flex gap-8 items-center">
                    <div className="relative shrink-0">
                       <img src={eventData?.images?.[0] || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'} className="w-24 h-24 rounded-3xl object-cover shadow-2xl group-hover:scale-110 transition-transform duration-700" alt="" />
                       <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                          <TicketIcon size={14} />
                       </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.4em] mb-2">Target Node</p>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white line-clamp-2 leading-tight tracking-tighter">{eventData?.title}</h3>
                    </div>
                  </div>
                  <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                         <Calendar size={18} />
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{eventData?.startDate ? new Date(eventData.startDate).toLocaleDateString(undefined, { dateStyle: 'full' }) : ''}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                         <MapPin size={18} />
                      </div>
                      <span className="font-bold text-slate-600 dark:text-slate-300 line-clamp-1">{eventData?.venue?.name || 'Global Node'}</span>
                    </div>
                  </div>
                </div>
              </TiltCard>

              {/* Economic Ledger */}
              <div className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[4rem] p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden">
                <motion.div 
                   animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
                   transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                   className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -mr-32 -mt-32" 
                />
                
                <h3 className="text-2xl font-black mb-10 relative flex items-center gap-4">
                   <CreditCard />
                   Ledger Summary
                </h3>
                
                <div className="space-y-6 relative mb-12">
                  <LedgerRow label="Asset Value" value={`₹${subtotal.toLocaleString()}`} />
                  <LedgerRow label="Protocol Surcharge (5%)" value={`₹${bookingFee.toLocaleString()}`} />
                  <LedgerRow label="System Levy (18%)" value={`₹${gstAmount.toLocaleString()}`} />
                  
                  <div className="pt-10 border-t border-white/10 dark:border-slate-100">
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.4em] mb-3">Net Settlement</p>
                    <div className="flex justify-between items-end">
                       <p className="text-5xl font-black tracking-tighter">
                          ₹{totalAmount.toLocaleString()}
                       </p>
                       <div className="w-12 h-12 bg-white/10 dark:bg-slate-900/10 rounded-2xl flex items-center justify-center">
                          <CheckCircle className="text-emerald-400" size={24} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-white/5 dark:bg-slate-900/5 text-[9px] font-black uppercase tracking-[0.4em] opacity-60">
                  <Zap size={12} className="text-yellow-400 animate-pulse" />
                  Authenticated by EventifyX Core v3
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const Step = ({ index, label, active, completed }: any) => (
  <div className="flex items-center gap-4">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all duration-700 relative ${
       active 
       ? "bg-purple-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.5)] scale-110" 
       : completed 
       ? "bg-emerald-500 text-white" 
       : "bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700"
    }`}>
       {completed ? <CheckCircle size={24} /> : index}
       {active && (
         <motion.div 
           layoutId="step-glow"
           className="absolute inset-0 bg-purple-500 rounded-2xl blur-xl opacity-30"
         />
       )}
    </div>
    <div className="hidden md:block">
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Step 0{index}</p>
       <p className={`font-black tracking-tight ${active ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>{label}</p>
    </div>
  </div>
);

const InputField = ({ label, icon: Icon, value, onChange, placeholder }: any) => (
  <div className="space-y-3 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-6 group-focus-within:text-purple-600 transition-all">{label}</label>
    <div className="relative">
      <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors" size={20} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-16 pl-16 pr-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-black transition-all"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const LedgerRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center group">
    <span className="text-xs font-bold opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
    <span className="font-black text-lg group-hover:scale-105 transition-transform">{value}</span>
  </div>
);

export default CheckoutPage;
