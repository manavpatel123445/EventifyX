import React, { useState } from "react";
import { forgotPassword } from "../services/authService";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Input } from "../lib/Input";
import { FaEnvelope, FaChevronLeft, FaKey } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/TiltCard";
import toast from "react-hot-toast";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setMessage(response.message);
        toast.success(response.message);
        if (response.resetToken) {
          setResetToken(response.resetToken);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "An error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <div className="relative flex items-center justify-center p-4 min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Decorative Orbs */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="w-full max-w-4xl"
        >
          <TiltCard damping={25} stiffness={150}>
            <div className="grid grid-cols-1 md:grid-cols-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[500px]">
              
              {/* Left Side Aesthetic */}
              <div className="relative hidden md:flex flex-col justify-end p-12 overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?q=80&w=2070&auto=format&fit=crop"
                  alt="Security background"
                  className="absolute inset-0 w-full h-full object-cover opacity-40 scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                
                <div className="relative z-10 text-white">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/30 backdrop-blur-xl border border-purple-500/30 flex items-center justify-center mb-6">
                    <FaKey className="text-purple-400 text-xl" />
                  </div>
                  <h1 className="text-3xl font-extrabold mb-4">Security First.</h1>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    We use military-grade encryption to ensure your account remains yours and yours only.
                  </p>
                </div>
              </div>

              {/* Right Side Form */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <div className="mb-8">
                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Forgot Password?</h2>
                  <p className="text-slate-500 dark:text-slate-400">No worries, we'll send you reset instructions.</p>
                </div>

                <AnimatePresence mode="wait">
                  {message ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6 py-4"
                    >
                      <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{message}</p>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Please check your inbox and spam folder.</p>
                      </div>

                      {resetToken && (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-2xl">
                          <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Dev Debug Mode</p>
                          <Link 
                            to={`/reset-password/${resetToken}`}
                            className="bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold inline-block hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                          >
                            Reset Password Now
                          </Link>
                        </div>
                      )}

                      <Link to="/login" className="flex items-center justify-center gap-2 text-purple-600 font-bold hover:gap-3 transition-all mt-4">
                        <FaChevronLeft className="text-xs" /> Back to Sign In
                      </Link>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                        <Input
                          type="email"
                          placeholder="name@company.com"
                          value={email}
                          onChange={(e: any) => setEmail(e.target.value)}
                          required
                          leftIcon={<FaEnvelope className="h-4 w-4 text-purple-600" />}
                          className="h-14 rounded-2xl bg-white/50 dark:bg-slate-800/50"
                        />
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium"
                        >
                          {error}
                        </motion.div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-bold shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 disabled:opacity-50 text-lg flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : "Send Reset Link"}
                      </motion.button>

                      <Link to="/login" className="flex items-center justify-center gap-2 text-slate-500 hover:text-purple-600 font-bold transition-all pt-4">
                        <FaChevronLeft className="text-xs" /> Back to Sign In
                      </Link>
                    </form>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </TiltCard>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;
