// src/pages/ForgotPassword.tsx
import React, { useState } from "react";
import { forgotPassword } from "../services/authService";
import { Link } from "react-router-dom";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resetToken, setResetToken] = useState(""); // For development only

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await forgotPassword(email);
      if (response.success) {
        setMessage(response.message);
        // For development - show reset token
        if (response.resetToken) {
          setResetToken(response.resetToken);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-4xl rounded-2xl bg-white shadow-lg overflow-hidden">
        {/* Left Side Image */}
        <div className="hidden md:block w-1/2">
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad"
            alt="Forgot Password EventifyX"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Forgot <span className="text-red-500">Password?</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your registered email address and we’ll send you instructions
            to reset your password.
          </p>

          {/* Success/Error Messages */}
          {message && (
            <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {message}
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Development - Show Reset Token */}
          {resetToken && (
            <div className="mt-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
              <Link 
                to={`/reset-password/${resetToken}`}
                className="inline-block mt-2 text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Click here to reset password
              </Link>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300 disabled:opacity-50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-500 py-2 font-medium text-white shadow-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <Link to="/login" className="text-red-500 font-medium hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
