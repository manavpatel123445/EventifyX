import React, { useState, Suspense } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../services/authService";
import { loginSuccess, setError, setStatus } from "../app/slices/authslice";
// Lazy load Navbar
const Navbar = React.lazy(() => import("../components/Navbar"));
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
      <Suspense fallback={<div>Loading Navbar...</div>}>
        <Navbar />
      </Suspense>
      <div className="h-150  flex items-center justify-center bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden w-full max-w-4xl">
          {/* Left Banner */}
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
              alt="EventifyX banner"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Right Login Form */}
          <div className="p-10 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">
              Sign In to <span className="text-red-500">EventifyX</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e: { target: { value: string; }; }) => setEmail(e.target.value.replace(/\s/g, ""))}
                  placeholder="Enter your email"
                  leftIcon={<FaEnvelope className="h-4 w-4" />}
                  error={!!errors.email}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-600 mb-1">Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e: { target: { value: string; }; }) => setPassword(e.target.value.replace(/\s/g, ""))}
                  placeholder="Enter your password"
                  leftIcon={<FaLock className="h-4 w-4" />}
                  rightIcon={
                    <span onClick={() => setShowPassword((v) => !v)}>
                      {showPassword ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </span>
                  }
                  error={!!errors.password}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-gray-600">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-red-500"
                  />
                  <span>Remember me</span>
                </label>
                <NavLink
                  to="/ForgotPassword"
                  className="text-sm text-red-500 hover:underline"
                >
                  Forgot Password?
                </NavLink>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Signing In..." : "Sign In"}
              </button>

              {errors.api && <p className="text-red-500 text-xs mt-2">{errors.api}</p>}
            </form>

            {/* Register */}
            <p className="text-center text-gray-600 mt-6">
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
    </>
  );
};

export default Loginpage;
