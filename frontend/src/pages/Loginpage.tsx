/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/authService";
import { loginSuccess, setError, setStatus } from "../app/slices/authslice";
import Navbar from "../components/Navbar";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";
import TiltCard from "../components/TiltCard";
import { Zap, Shield, Globe, ArrowRight, Fingerprint, Key, Mail, RefreshCw } from "lucide-react";

const Loginpage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Identity Hash Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid Protocol Format";
    }
    if (!password) {
      newErrors.password = "Access Key Required";
    }
    return newErrors;
  };

  const mutation = useMutation({
    mutationFn: loginUser,
    onMutate: () => dispatch(setStatus("loading")),
    onSuccess: (data) => {
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("accessToken", data.accessToken);
      storage.setItem("refreshToken", data.refreshToken);
      storage.setItem("user", JSON.stringify(data.user));

      dispatch(loginSuccess(data));
      dispatch(setStatus("succeeded"));
      toast.success(`Welcome to the Nexus, ${data.user?.name || "Entity"}`);
      
      const rolePath = data.user?.role === "admin" ? "/admin" : data.user?.role === "event_manager" ? "/manager" : "/";
      navigate(rolePath);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Authentication Denied";
      setErrors((prev) => ({ ...prev, api: msg }));
      dispatch(setError(msg));
      dispatch(setStatus("failed"));
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    mutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <div className="relative flex items-center justify-center p-6 min-h-screen overflow-hidden pt-20">
        {/* Cinematic Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />

        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           className="w-full max-w-6xl relative z-10"
        >
          <TiltCard damping={20} stiffness={120}>
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden min-h-[700px]">
              
              {/* Artistic Tech Panel */}
              <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-16 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-slate-900 to-blue-900/30" />
                
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-10">
                      <div className="w-12 h-12 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-white/20">
                         <Zap className="text-purple-400" fill="currentColor" />
                      </div>
                      <span className="text-white font-black text-2xl tracking-tighter">Eventify<span className="text-purple-500">X</span></span>
                   </div>
                   
                   <motion.div 
                     initial={{ opacity: 0, x: -20 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.2 }}
                   >
                     <h2 className="text-5xl font-black text-white leading-tight mb-6 tracking-tighter">
                        Nexus <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-emerald-400">Authorization</span>
                     </h2>
                     <p className="text-slate-400 font-bold max-w-sm leading-relaxed">
                        Access your global event identity. Securely encrypted and decentralized.
                     </p>
                   </motion.div>
                </div>

                <div className="relative z-10 grid grid-cols-2 gap-6">
                   <StatItem icon={Shield} label="End-to-End" sub="Encryption" />
                   <StatItem icon={Globe} label="Global" sub="Syncing" />
                </div>
              </div>

              {/* Login Interface */}
              <div className="lg:col-span-7 p-12 md:p-20 flex flex-col justify-center">
                <div className="mb-12">
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">Identity Retrieval</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-bold">Initiate secure authentication handshake.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                   <div className="space-y-2 group">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-5 group-focus-within:text-purple-600 transition-colors">Digital Handle</label>
                      <div className="relative">
                         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                            <Mail size={20} />
                         </div>
                         <input 
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value.replace(/\s/g, ""))}
                           placeholder="nexus@eventifyx.io"
                           className="w-full h-16 pl-16 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all text-lg"
                         />
                      </div>
                      {errors.email && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-5">{errors.email}</p>}
                   </div>

                   <div className="space-y-2 group">
                      <div className="flex justify-between items-center px-5">
                         <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 group-focus-within:text-purple-600 transition-colors">Security Code</label>
                         <NavLink to="/ForgotPassword" className="text-[10px] font-black text-purple-600 hover:text-blue-500 uppercase tracking-widest transition-colors">Override Password</NavLink>
                      </div>
                      <div className="relative">
                         <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
                            <Fingerprint size={20} />
                         </div>
                         <input 
                           type={showPassword ? "text" : "password"}
                           value={password}
                           onChange={(e) => setPassword(e.target.value.replace(/\s/g, ""))}
                           placeholder="••••••••••••"
                           className="w-full h-16 pl-16 pr-16 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all text-lg"
                         />
                         <button 
                           type="button" 
                           onClick={() => setShowPassword(!showPassword)}
                           className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-purple-600 transition-colors"
                         >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                         </button>
                      </div>
                      {errors.password && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-5">{errors.password}</p>}
                   </div>

                   <div className="flex items-center gap-3 px-5">
                      <input 
                        type="checkbox" 
                        id="rem" 
                        checked={remember} 
                        onChange={(e) => setRemember(e.target.checked)} 
                        className="w-5 h-5 rounded-lg border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-purple-600 focus:ring-purple-500 transition-all cursor-pointer"
                      />
                      <label htmlFor="rem" className="text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer select-none">Maintain Active Connection</label>
                   </div>

                   <button 
                     type="submit" 
                     disabled={mutation.isPending}
                     className="w-full h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                     {mutation.isPending ? <RefreshCw className="animate-spin" size={24} /> : <Key size={24} />}
                     {mutation.isPending ? "Ciphering..." : "Access Nexus"}
                   </button>
                </form>

                <div className="mt-12 pt-12 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                   <p className="text-slate-500 dark:text-slate-400 font-bold">New to the grid?</p>
                   <NavLink 
                     to="/register" 
                     className="px-8 py-3 bg-purple-500/10 text-purple-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all flex items-center gap-3 group"
                   >
                     Create Identity
                     <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                   </NavLink>
                </div>
              </div>

            </div>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, sub }: any) => (
  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] hover:bg-white/10 transition-all group">
     <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <Icon size={18} />
     </div>
     <p className="text-white font-black text-sm tracking-tight">{label}</p>
     <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">{sub}</p>
  </div>
);

export default Loginpage;
