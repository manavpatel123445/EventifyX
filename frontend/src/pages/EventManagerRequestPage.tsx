import React, { useEffect, useState } from "react";
import { ShieldCheck, Calendar, Users, BarChart3, ArrowRight, CheckCircle2, Clock, XCircle, Sparkles, Zap, GraduationCap, Briefcase } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import TiltCard from "../components/TiltCard";
import { getUserRequest, submitEventManagerRequest, type EventManagerRequest } from "../services/eventManagerRequestService";
import toast from "react-hot-toast";

const EventManagerRequestPage: React.FC = () => {
  const [request, setRequest] = useState<EventManagerRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ reason: "", experience: "" });

  const fetchStatus = async () => {
    try {
      const res = await getUserRequest();
      if (res?.success) setRequest(res.data);
    } catch (err) {
      console.error("Error fetching request status:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim() || !formData.experience.trim()) {
      toast.error("Please fill in all neural data points.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitEventManagerRequest(formData);
      if (res?.success) {
        toast.success("Application Transmitted Successfully");
        fetchStatus();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Signal failure during transmission");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto px-6 py-32 relative">
        {/* Background Atmosphere */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

        <div className="max-w-7xl mx-auto">
          {request ? (
            <StatusView request={request} />
          ) : (
             <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-center">
               {/* Hero Info */}
               <div className="lg:col-span-6 space-y-10">
                 <motion.div
                   initial={{ opacity: 0, x: -30 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-extrabold text-[10px] uppercase tracking-[0.4em]"
                 >
                    <Sparkles size={14} /> Global Expansion Program
                 </motion.div>
                 
                 <motion.h1 
                   initial={{ opacity: 0, y: 30 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]"
                 >
                   Become an <br />
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-500">Event Architect</span>
                 </motion.h1>
                 
                 <motion.p 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.1 }}
                   className="text-slate-500 dark:text-slate-400 text-xl font-bold max-w-xl leading-relaxed"
                 >
                   Unlock the capability to manifest large-scale events, manage neural-gate ticket scans, and direct global narratives.
                 </motion.p>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                   {[
                     { icon: Calendar, label: "Immersive Creation", desc: "Design multi-dimensional event experiences." },
                     { icon: Users, label: "Neural Gate", desc: "Real-time attendee telemetry and analytics." },
                     { icon: BarChart3, label: "Revenue Matrix", desc: "Direct payment integration and settlement." },
                     { icon: ShieldCheck, label: "Oracle Trust", desc: "Certified management identification." }
                   ].map((feature, idx) => (
                     <motion.div
                       key={idx}
                       initial={{ opacity: 0, y: 20 }}
                       animate={{ opacity: 1, y: 0 }}
                       transition={{ delay: 0.2 + idx * 0.1 }}
                       className="flex items-start gap-4"
                     >
                       <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 shadow-xl flex items-center justify-center shrink-0">
                          <feature.icon className="w-5 h-5 text-purple-600" />
                       </div>
                       <div>
                          <p className="font-black text-slate-900 dark:text-white text-sm tracking-tight">{feature.label}</p>
                          <p className="text-xs font-bold text-slate-500 opacity-60 leading-tight">{feature.desc}</p>
                       </div>
                     </motion.div>
                   ))}
                 </div>
               </div>

               {/* Application Form */}
               <div className="lg:col-span-6">
                 <TiltCard damping={10}>
                    <div className="p-12 md:p-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-2xl relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-8">
                          <Zap className="text-slate-200 dark:text-slate-800 animate-pulse" size={32} />
                       </div>
                       
                       <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">Submit Credentials</h2>
                       
                       <form onSubmit={handleSubmit} className="space-y-8">
                          <div className="space-y-3 group">
                             <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8 group-focus-within:text-purple-600 transition-colors">
                               <Briefcase size={10} /> Professional Trajectory
                             </label>
                             <textarea
                               rows={4}
                               value={formData.experience}
                               onChange={(e) => setFormData(p => ({ ...p, experience: e.target.value }))}
                               placeholder="Describe your previous event management protocols..."
                               className="w-full p-8 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all resize-none"
                             />
                          </div>

                          <div className="space-y-3 group">
                             <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8 group-focus-within:text-purple-600 transition-colors">
                               <GraduationCap size={10} /> Manifestation Rationale
                             </label>
                             <textarea
                               rows={4}
                               value={formData.reason}
                               onChange={(e) => setFormData(p => ({ ...p, reason: e.target.value }))}
                               placeholder="Why do you wish to architect on the EventifyX network?"
                               className="w-full p-8 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all resize-none"
                             />
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            disabled={submitting}
                            className="w-full h-20 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-[2rem] font-black tracking-tighter text-xl shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-4 group transition-all disabled:opacity-50"
                          >
                             {submitting ? "Transmitting..." : (
                               <>
                                 Initiate Protocol
                                 <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                               </>
                             )}
                          </motion.button>
                       </form>
                    </div>
                 </TiltCard>
               </div>
             </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

const StatusView = ({ request }: { request: EventManagerRequest }) => {
  const statusConfig = {
    pending: { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10", label: "Protocol Pending Review", desc: "Our Council is currently evaluating your credentials. Expected sync time: 24-48h." },
    approved: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10", label: "Credentials Verified", desc: "Welcome, Architect. Your neural link is now enabled with Manager privileges." },
    rejected: { icon: XCircle, color: "text-red-500", bg: "bg-red-500/10", label: "Transmission Denied", desc: "The Council has flagged your application for inconsistencies. Please revise and retry." }
  };

  const current = statusConfig[request.status];

  return (
    <div className="max-w-4xl mx-auto">
      <TiltCard damping={15}>
        <div className="p-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-2xl text-center space-y-10 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-2 bg-gradient-to-r from-transparent via-purple-600 to-transparent opacity-50" />
          
          <div className={`w-32 h-32 mx-auto rounded-[2.5rem] ${current.bg} flex items-center justify-center`}>
            <current.icon className={`w-16 h-16 ${current.color}`} />
          </div>

          <div className="space-y-4">
            <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{current.label}</h2>
            <p className="text-xl font-bold text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
              {current.desc}
            </p>
          </div>

          {request.adminResponse && (
            <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-200 dark:border-slate-800 text-left">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Council Feedback</p>
               <p className="text-slate-700 dark:text-slate-300 font-bold italic line-clamp-3">"{request.adminResponse}"</p>
            </div>
          )}

          <div className="pt-6">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Application ID</p>
             <p className="text-slate-900 dark:text-white font-mono font-bold">#{request._id.toUpperCase()}</p>
          </div>

          {request.status === 'approved' && (
            <button
              onClick={() => window.location.href = '/create-event'}
              className="px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all"
            >
              Initialize First Manifestation
            </button>
          )}
        </div>
      </TiltCard>
    </div>
  );
};

export default EventManagerRequestPage;
