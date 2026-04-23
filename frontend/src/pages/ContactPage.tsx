import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Send, Sparkles, Zap } from "lucide-react";
import { getProfile } from "../services/userService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/TiltCard";
import toast from "react-hot-toast";

const ContactPage: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [, setLoadingProfile] = useState(false);

  useEffect(() => {
    const fill = async () => {
      const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (!accessToken) {
        setLoadingProfile(false);
        return;
      }

      try {
        setLoadingProfile(true);
        const res = await getProfile();
        if (res?.success && res.user) {
          setForm(prev => ({
            ...prev,
            name: res.user.name || prev.name,
            email: res.user.email || prev.email,
          }));
        }
      } catch {
        // ignore if unauthenticated
      } finally {
        setLoadingProfile(false);
      }
    };
    fill();
  }, []);

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!form.name.trim()) e.name = "Entity Designation required";
    if (!form.email.trim()) e.email = "Communication link required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid Protocol Format";
    if (!form.subject.trim()) e.subject = "Subject header required";
    if (form.message.trim().length < 10) e.message = "Transmission too brief (min 10 chars)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setStatus("success");
      toast.success("Transmission Received.");
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
      setStatus("error");
      toast.error("Signal Lost. Sync Failed.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto px-6 py-32 relative">
        {/* Background Ambience */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px] -ml-48 -mb-48" />

        <div className="max-w-7xl mx-auto space-y-24">
          {/* Hero Section */}
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-black text-[10px] uppercase tracking-[0.4em]"
            >
               <Sparkles size={14} />
               Global Support Network
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-none"
            >
              Establish <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-500">Connection</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-slate-500 dark:text-slate-400 text-xl font-bold max-w-2xl mx-auto leading-relaxed"
            >
              Our intelligence team is standing by to resolve any operational anomalies or queries.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Intel Deck */}
            <div className="lg:col-span-5 space-y-8">
              {[
                { icon: Mail, label: "Digital Vector", value: "support@eventifyx.ai", desc: "For secure documentation interchange." },
                { icon: Phone, label: "Neural Link", value: "+1 888 521 4002", desc: "Real-time acoustic communication." },
                { icon: MapPin, label: "Physical Node", value: "Silicon Valley, CA", desc: "Core infrastructure headquarters." }
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <TiltCard damping={15}>
                    <div className="p-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-xl group hover:scale-[1.02] transition-all">
                       <div className="flex items-center gap-8">
                          <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                             <item.icon className="w-8 h-8 text-purple-600" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">{item.label}</p>
                             <p className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-2">{item.value}</p>
                             <p className="text-sm font-bold text-slate-500 opacity-60">{item.desc}</p>
                          </div>
                       </div>
                    </div>
                  </TiltCard>
                </motion.div>
              ))}

              {/* Status Indicator */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-10 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[3rem] shadow-2xl relative overflow-hidden group"
              >
                 <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl -mr-16 -mt-16 animate-pulse" />
                 <div className="relative z-10 flex items-center gap-6">
                    <div className="w-4 h-4 bg-emerald-500 rounded-full animate-ping" />
                    <div>
                       <p className="text-white font-black text-xl mb-1">Systems Operational</p>
                       <p className="text-slate-400 text-sm font-bold">Standard Response: &lt; 4 Hours</p>
                    </div>
                 </div>
              </motion.div>
            </div>

            {/* Transmission Terminal */}
            <div className="lg:col-span-7">
              <TiltCard damping={10}>
                <div className="p-12 md:p-16 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-2xl relative">
                   <div className="flex items-center justify-between mb-12">
                      <div className="flex items-center gap-4">
                         <div className="w-2 h-10 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full" />
                         <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Transmit Query</h2>
                      </div>
                      <Zap className="text-slate-200 dark:text-slate-800 animate-pulse" size={40} />
                   </div>

                   <form onSubmit={onSubmit} className="space-y-8">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <InputField 
                         label="Entity Designation" 
                         placeholder="e.g. Atlas Prime" 
                         value={form.name} 
                         onChange={(v: string) => setForm(p => ({ ...p, name: v }))}
                         error={errors.name}
                       />
                       <InputField 
                         label="Communication Link" 
                         placeholder="entity@network.io" 
                         value={form.email} 
                         onChange={(v: string) => setForm(p => ({ ...p, email: v }))}
                         error={errors.email}
                       />
                     </div>

                     <InputField 
                       label="Transmission Vector" 
                       placeholder="Inquiry Subject" 
                       value={form.subject} 
                       onChange={(v: string) => setForm(p => ({ ...p, subject: v }))}
                       error={errors.subject}
                     />

                     <div className="space-y-3 group">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8 group-focus-within:text-purple-600 transition-colors">Core Signal Content</label>
                        <textarea
                          rows={6}
                          placeholder="Describe the anomaly..."
                          value={form.message}
                          onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))}
                          className="w-full p-8 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all resize-none"
                        />
                        {errors.message && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-8">{errors.message}</p>}
                     </div>

                     <motion.button
                       whileHover={{ scale: 1.02 }}
                       whileTap={{ scale: 0.98 }}
                       type="submit"
                       className="w-full h-24 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-500 text-white rounded-[2.5rem] font-black text-xl shadow-2xl shadow-purple-500/30 flex items-center justify-center gap-6 group overflow-hidden relative"
                     >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <span className="relative z-10 flex items-center gap-4">
                           Initiate Transmission
                           <Send className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                        </span>
                     </motion.button>
                   </form>

                   <AnimatePresence>
                     {status === "success" && (
                       <motion.div
                         initial={{ opacity: 0, y: 20 }}
                         animate={{ opacity: 1, y: 0 }}
                         className="mt-10 p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-4 font-black uppercase text-[10px] tracking-widest"
                       >
                         <Zap size={16} /> Signal Synchronized Successfully
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>
              </TiltCard>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const InputField = ({ label, placeholder, value, onChange, error }: any) => (
  <div className="space-y-3 group">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-8 group-focus-within:text-purple-600 transition-colors">{label}</label>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-16 px-8 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all"
    />
    {error && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest ml-8">{error}</p>}
  </div>
);

export default ContactPage;
