// src/pages/ForgotPassword.tsx
import React from "react";

const ForgotPassword: React.FC = () => {
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

          {/* Form */}
          <form className="mt-6 space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-red-500 py-2 font-medium text-white shadow-md hover:bg-red-600 transition"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Remembered your password?{" "}
            <a href="/login" className="text-red-500 font-medium hover:underline">
              Back to Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
