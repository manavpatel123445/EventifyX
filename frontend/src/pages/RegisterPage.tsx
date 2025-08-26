// src/pages/Register.tsx
import React from "react";
import Navbar from "../components/Navbar";

const RegisterPage: React.FC = () => {
  return (
    <>
    <Navbar/>
    <div className="flex h-160 items-center justify-center bg-gray-50 px-4">
      <div className="flex w-full max-w-5xl rounded-2xl bg-white shadow-lg overflow-hidden">
        {/* Left Side Image */}
        <div className="hidden md:block w-1/2">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="Register EventifyX"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Sign Up for <span className="text-red-500">EventifyX</span>
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Create your account to start planning amazing events.
          </p>

          {/* Form */}
          <form className="mt-6 space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>

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

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                className="mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300"
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                id="terms"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-red-500 focus:ring-red-400"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                I agree to the{" "}
                <a href="#" className="text-red-500 hover:underline">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="#" className="text-red-500 hover:underline">
                  Privacy Policy
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full rounded-lg bg-red-500 py-2 font-medium text-white shadow-md hover:bg-red-600 transition"
            >
              Sign Up
            </button>
          </form>

          {/* Redirect to login */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <a href="/login" className="text-red-500 font-medium hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default RegisterPage;
