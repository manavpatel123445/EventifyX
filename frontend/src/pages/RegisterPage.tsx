/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { registerUser } from "../services/authService";
import { loginSuccess, setError, setStatus } from "../app/slices/authslice";
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import { cn } from "../lib/utils";

// ✅ Reusable Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          type={type}
          {...props} // ✅ ensures value & onChange work
          className={cn(
            "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm",
            "placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-red-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-10",
            rightIcon && "pr-10",
            error && "border-red-500 focus-visible:ring-red-500",
            className
          )}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

const RegisterPage: React.FC = () => {
  // ✅ State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  // Single state to control both password fields' visibility
  const [showPasswords, setShowPasswords] = useState(false);
  
  // Toggle both password fields' visibility
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

  // ✅ Validation
  const validate = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
      terms?: string;
    } = {};

    if (!name) newErrors.name = "Full name is required";
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
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!terms) {
      newErrors.terms = "You must accept terms & conditions";
    }
    return newErrors;
  };

  // ✅ Handle Submit
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

      // Save tokens
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch(loginSuccess(data));
      dispatch(setStatus("succeeded"));

      toast.success(`Welcome to EventifyX, ${data.user?.name || "User"}!`);

      window.dispatchEvent(new CustomEvent("userLogin"));
      navigate("/");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed";
      setErrors((prev) => ({ ...prev, api: msg }));
      dispatch(setError(msg));
      dispatch(setStatus("failed"));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className=" flex items-center justify-center bg-gray-50 px-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden max-w-4xl w-full">
          {/* Left side image */}
          <div className="hidden md:block">
            <img
              src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
              alt="Register banner"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Register Form */}
          <div className="p-6 md:p-8 flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Create an <span className="text-red-500">EventifyX</span> Account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-gray-600 mb-1">Full Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  leftIcon={<FaUser className="h-4 w-4" />}
                  error={!!errors.name}
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-600 mb-1">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  leftIcon={<FaEnvelope className="h-4 w-4" />}
                  error={!!errors.email}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-600 mb-1">Password</label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  leftIcon={<FaLock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={togglePasswordsVisibility}
                      className="focus:outline-none"
                    >
                      {showPasswords ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  }
                  error={!!errors.password}
                  required
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-gray-600 mb-1">
                  Confirm Password
                </label>
                <Input
                  type={showPasswords ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  leftIcon={<FaLock className="h-4 w-4" />}
                  rightIcon={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={togglePasswordsVisibility}
                      className="focus:outline-none"
                    >
                      {showPasswords ? (
                        <FaEyeSlash className="h-4 w-4 text-gray-400" />
                      ) : (
                        <FaEye className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  }
                  error={!!errors.confirmPassword}
                  required
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={terms}
                  onChange={(e) => setTerms(e.target.checked)}
                  className="w-4 h-4 text-red-500"
                />
                <span className="text-gray-600 text-sm">
                  I agree to the{" "}
                  <a href="/terms" className="text-red-500 hover:underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-red-500 hover:underline">
                    Privacy Policy
                  </a>
                </span>
              </div>
              {errors.terms && (
                <p className="text-red-500 text-xs mt-1">{errors.terms}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {loading ? "Registering..." : "Sign Up"}
              </button>

              {errors.api && (
                <p className="text-red-500 text-xs mt-2">{errors.api}</p>
              )}
            </form>

            {/* Divider */}
            <div className="my-4 flex items-center">
              <hr className="flex-1 border-gray-300" />
              <span className="px-2 text-gray-400 text-sm">OR</span>
              <hr className="flex-1 border-gray-300" />
            </div>

            {/* Redirect to Login */}
            <p className="text-center text-gray-600">
              Already have an account?{" "}
              <NavLink
                to="/login"
                className="text-red-500 font-semibold hover:underline"
              >
                Login
              </NavLink>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default RegisterPage;
