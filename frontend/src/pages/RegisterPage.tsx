/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../services/authService";
import { loginSuccess, setError, setStatus } from "../app/slices/authslice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import TiltCard from "../components/TiltCard";
import { User, Mail, Lock, Fingerprint, RefreshCw, ArrowRight, Star, Zap, ShieldCheck } from "lucide-react";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  
  const togglePasswordsVisibility = () => setShowPasswords(!showPasswords);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    api?: string;
  }>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors: any = {};
    if (!name) newErrors.name = "Identity Label Required";
    if (!email) {
      newErrors.email = "Identity Hash Required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid Protocol Format";
    }
    if (!password) {
      newErrors.password = "Security Code Required";
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 Characters";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Security Mismatch";
    }
    if (!terms) {
      newErrors.terms = "Agreement Required";
    }
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      dispatch(setStatus("loading"));
      const data = await registerUser({ name, email, password });

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(loginSuccess(data));
      dispatch(setStatus("succeeded"));

      toast.success(`Identity Synchronized: Welcome ${data.user?.name || "Entity"}`);
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Protocol Failure";
      setErrors((prev) => ({ ...prev, api: msg }));
      dispatch(setError(msg));
      dispatch(setStatus("failed"));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <div className="relative flex items-center justify-center p-6 min-h-screen overflow-hidden pt-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-1000 pointer-events-none" />

        <motion.div
           initial={{ opacity: 0, scale: 0.95, y: 20 }}
           animate={{ opacity: 1, scale: 1, y: 0 }}
           className="w-full max-w-6xl relative z-10"
        >
          <TiltCard damping={20} stiffness={120}>
            <div className="grid grid-cols-1 lg:grid-cols-12 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[4rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden min-h-[750px]">
              
              {/* Left Bio-Metric Panel */}
              <div className="lg:col-span-5 relative hidden lg:flex flex-col justify-between p-16 overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-slate-900 to-purple-900/30" />
                
                <div className="relative z-10">
                   <span className="px-5 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8 inline-block">
                      Protocol Initiation
                   </span>
                   <h1 className="text-5xl font-black text-white leading-tight mb-8 tracking-tighter">
                      Secure <br />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Identity Creation</span>
                   </h1>
                   <p className="text-slate-400 font-bold max-w-sm leading-relaxed text-lg">
                      Forge your access token for the global event network.
                   </p>
                </div>

                <div className="relative z-10 space-y-6">
                   <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
                         <ShieldCheck size={24} />
                      </div>
                      <div>
                         <p className="text-white font-black text-sm tracking-tight">Vault Encryption</p>
                         <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Quantum Resistant</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all group">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/20">
                         <Star size={24} fill="currentColor" />
                      </div>
                      <div>
                         <p className="text-white font-black text-sm tracking-tight">Full Access Pass</p>
                         <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Global Discovery</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Registration Interface */}
              <div className="lg:col-span-7 p-12 md:p-16 flex flex-col justify-center">
                <div className="mb-10 text-center md:text-left">
                   <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">Identity Synthesis</h3>
                   <p className="text-slate-500 dark:text-slate-400 font-bold">Input your parameters to initialize your node.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <PremiumInput 
                        label="Full Identity Name" 
                        icon={User} 
                        value={name} 
                        onChange={setName} 
                        error={errors.name} 
                        placeholder="Alex Nexus"
                      />
                      <PremiumInput 
                        label="Digital Network Hub" 
                        icon={Mail} 
                        value={email} 
                        onChange={setEmail} 
                        error={errors.email} 
                        placeholder="nexus@eventifyx.io"
                      />
                   </div>

                   <div className="grid md:grid-cols-2 gap-6">
                      <PremiumInput 
                        label="Security Code" 
                        type={showPasswords ? "text" : "password"}
                        icon={Fingerprint} 
                        value={password} 
                        onChange={setPassword} 
                        error={errors.password} 
                        placeholder="••••••••••••"
                      />
                      <PremiumInput 
                        label="Verify Security Code" 
                        type={showPasswords ? "text" : "password"}
                        icon={Lock} 
                        value={confirmPassword} 
                        onChange={setConfirmPassword} 
                        error={errors.confirmPassword} 
                        placeholder="••••••••••••"
                        rightIcon={
                          <button type="button" onClick={togglePasswordsVisibility} className="text-slate-400 hover:text-purple-600 transition-colors">
                             {showPasswords ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                          </button>
                        }
                      />
                   </div>

                   <div className="px-5 py-4 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-start gap-4 group">
                      <input 
                        type="checkbox" 
                        id="terms" 
                        checked={terms} 
                        onChange={(e) => setTerms(e.target.checked)} 
                        className="mt-1 w-5 h-5 rounded-lg border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer"
                      />
                      <label htmlFor="terms" className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed cursor-pointer select-none">
                         I acknowledge the <span className="text-blue-600 hover:underline">Nexus Protocols</span> and <span className="text-blue-600 hover:underline">Identity Protection Rules</span>.
                      </label>
                   </div>
                   {errors.terms && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-5">{errors.terms}</p>}

                   <button 
                     type="submit" 
                     disabled={loading}
                     className="w-full h-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-[2.5rem] font-black text-xl uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                   >
                     {loading ? <RefreshCw className="animate-spin" size={24} /> : <Zap size={24} />}
                     {loading ? "Synthesizing..." : "Initialize Identity"}
                   </button>
                </form>

                <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                   <p className="text-slate-500 dark:text-slate-400 font-bold">Already a node?</p>
                   <NavLink 
                     to="/login" 
                     className="px-8 py-3 bg-blue-500/10 text-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all flex items-center gap-3 group"
                   >
                     Access Port
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

const PremiumInput = ({ label, type = "text", value, onChange, icon: Icon, error, placeholder, rightIcon }: any) => (
  <div className="space-y-2 group">
    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-4 transition-colors ${error ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}>
       {label}
    </label>
    <div className="relative">
      <div className={`absolute left-6 top-1/2 -translate-y-1/2 transition-colors ${error ? 'text-red-500' : 'text-slate-400 group-focus-within:text-blue-600'}`}>
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full h-16 pl-14 pr-12 bg-slate-50 dark:bg-slate-950 border rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/10 text-slate-900 dark:text-white font-bold transition-all ${error ? 'border-red-500' : 'border-slate-200 dark:border-slate-800 focus:border-blue-500'}`}
      />
      {rightIcon && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2">
           {rightIcon}
        </div>
      )}
    </div>
    {error && <p className="text-[10px] font-black text-red-500 uppercase tracking-widest ml-4">{error}</p>}
  </div>
);

export default RegisterPage;
