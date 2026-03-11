/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/authService";
import { loginSuccess, setError, setStatus } from "../app/slices/authslice";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Input } from "../lib/Input";
import toast from "react-hot-toast";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

const Loginpage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; api?: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ✅ Validation
  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  // ✅ Mutation
  const mutation = useMutation({
    mutationFn: loginUser,
    onMutate: () => dispatch(setStatus("loading")),
    onSuccess: (data) => {
      if (remember) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
      } else {
        sessionStorage.setItem("accessToken", data.accessToken);
        sessionStorage.setItem("refreshToken", data.refreshToken);
        sessionStorage.setItem("user", JSON.stringify(data.user));
      }

      dispatch(loginSuccess(data));
      dispatch(setStatus("succeeded"));
      toast.success(`Welcome back, ${data.user?.name || "User"}!`);
      if (data.user?.role === "admin") {
        navigate("/admin");
      } else if (data.user?.role === "event_manager") {
        navigate("/manager");
      } else {
        navigate("/");
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Login failed";
      setErrors((prev) => ({ ...prev, api: msg }));
      dispatch(setError(msg));
      dispatch(setStatus("failed"));
      toast.error(msg);
    },
  });

  // ✅ Handle Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    mutation.mutate({ email, password });
  };

  return (
    <>
      <Navbar />
      <div className="h-[calc(100vh-80px)] bg-[#eef0f3] dark:bg-gray-900 px-4 py-4 md:py-6 overflow-hidden">
        <div className="mx-auto w-full max-w-5xl h-full flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-gray-200/70 dark:border-gray-700 w-full max-h-full">
          {/* Left Banner */}
          <div className="hidden md:block h-full">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
              alt="EventifyX banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Right Login Form */}
          <div className="p-6 sm:p-8 md:p-9 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1f2a44] dark:text-white mb-6">
              Sign In to <span className="text-red-500">EventifyX</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              {/* Email */}
              <div>
                <label className="block mb-2 text-gray-600 dark:text-gray-300">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: { target: { value: string; }; }) => setEmail(e.target.value.replace(/\s/g, ""))}
                  placeholder="Enter your email"
                  leftIcon={<FaEnvelope className="h-4 w-4" />}
                  error={!!errors.email}
                  className="h-11 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-600 dark:text-gray-300 mb-2">Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: { target: { value: string; }; }) => setPassword(e.target.value.replace(/\s/g, ""))}
                  placeholder="Enter your password"
                  leftIcon={<FaLock className="h-4 w-4" />}
                  rightIcon={
                    <span onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                      )}
                    </span>
                  }
                  error={!!errors.password}
                  className="h-11 rounded-xl border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-gray-100"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-3 text-gray-600 dark:text-gray-300">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="h-5 w-5 rounded-md text-red-500 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                  />
                  <span>Remember me</span>
                </label>
                <NavLink
                  to="/ForgotPassword"
                  className="text-red-500 hover:underline"
                >
                  Forgot Password?
                </NavLink>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-red-500 text-white rounded-xl text-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing In..." : "Sign In"}
              </button>

              {errors.api && <p className="text-red-500 text-xs mt-2">{errors.api}</p>}
            </form>

            {/* Register */}
            <p className="text-center text-gray-600 dark:text-gray-300 mt-6 text-base">
              Don’t have an account?{" "}
              <NavLink
                to="/register"
                className="text-red-500 font-semibold hover:underline"
              >
                Sign Up
              </NavLink>
            </p>
          </div>
        </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Loginpage;
