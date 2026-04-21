import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";
import Navbar from "../components/Navbar";
import { Input } from "../lib/Input";
import { FaLock, FaEye, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/TiltCard";
import toast from "react-hot-toast";

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      toast.error("Password too short");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      toast.error("Invalid token");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, formData.password);
      if (response.success) {
        setSuccess(true);
        toast.success("Password reset successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "An error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <div className="relative flex items-center justify-center p-4 min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Animated Orbs */}
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-purple-500/10 rounded-full blur-[110px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-[130px] pointer-events-none animate-pulse delay-1000" />

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="w-full max-w-4xl"
        >
          <TiltCard damping={15} stiffness={100}>
            <div className="grid grid-cols-1 md:grid-cols-2 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[550px]">
              
              {/* Left Aesthetic Panel */}
              <div className="relative hidden md:flex flex-col justify-end p-12 overflow-hidden bg-slate-900">
                <img
                  src="https://images.unsplash.com/photo-1558486012-817176f84c6d?q=80&w=2048&auto=format&fit=crop"
                  alt="Reset security"
                  className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
                
                <div className="relative z-10 text-white">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30 flex items-center justify-center mb-6">
                    <FaShieldAlt className="text-blue-400 text-2xl" />
                  </div>
                  <h1 className="text-3xl font-extrabold mb-4 leading-tight">Fortify Your Access.</h1>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                    Choose a strong, unique password to keep your event experiences secure and private.
                  </p>
                </div>
              </div>

              {/* Right Form Panel */}
              <div className="p-10 md:p-14 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  {success ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center space-y-6"
                    >
                      <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                        <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Success!</h2>
                        <p className="text-slate-500 dark:text-slate-400">
                          Your password has been reset. Redirecting you to login in 3 seconds...
                        </p>
                      </div>
                      <Link 
                        to="/login"
                        className="inline-block py-3 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all"
                      >
                        Login Now
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div key="form" className="w-full">
                      <div className="mb-8">
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Reset Password</h2>
                        <p className="text-slate-500 dark:text-slate-400">Please enter your new credentials below.</p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            leftIcon={<FaLock className="h-4 w-4 text-purple-600" />}
                            className="h-14 rounded-2xl bg-white/50 dark:bg-slate-800/50"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                          <Input
                            type={showPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                            leftIcon={<FaLock className="h-4 w-4 text-purple-600" />}
                            rightIcon={
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-2">
                                {showPassword ? <FaEyeSlash className="text-slate-400" /> : <FaEye className="text-slate-400" />}
                              </button>
                            }
                            className="h-14 rounded-2xl bg-white/50 dark:bg-slate-800/50"
                          />
                        </div>

                        {error && (
                          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm font-medium">
                            {error}
                          </div>
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
                          ) : "Update Password"}
                        </motion.button>
                      </form>
                    </motion.div>
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

export default ResetPasswordPage;
