// src/pages/ResetPasswordPage.tsx
import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword } from "../services/authService";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!token) {
      setError("Invalid reset token");
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword(token, formData.password);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred. Please try again.");
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

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset Successful!</h2>
            <p className="text-gray-600 mb-4">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
            <Link to="/login" className="text-red-500 font-medium hover:underline">
              Go to Login Now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-4xl rounded-2xl bg-white shadow-lg overflow-hidden">
        {/* Left Side Image */}
        <div className="hidden md:block w-1/2">
          <img
            src="https://images.unsplash.com/photo-1556740758-90de374c12ad"
            alt="Reset Password EventifyX"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Reset <span className="text-red-500">Password</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Enter your new password below to reset your account password.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter your new password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300 disabled:opacity-50"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
                disabled={loading}
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300 disabled:opacity-50"
              />
            </div>

            {/* Password Requirements */}
            <div className="text-xs text-gray-500">
              <p>Password must be at least 6 characters long</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-red-500 py-2 font-medium text-white shadow-md hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remember your password?{" "}
            <Link to="/login" className="text-red-500 font-medium hover:underline">
              Back to Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
