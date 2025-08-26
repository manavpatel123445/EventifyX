import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { NavLink } from "react-router-dom";

const Loginpage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, remember });
    // 🔗 Call your backend API here
  };

  return (

  

    <>
    <Navbar/>
    <div className=" h-140 flex items-center justify-center bg-gray-50">
      <div className=" grid grid-cols-1 md:grid-cols-2 bg-white shadow-lg rounded-2xl overflow-hidden">
        
        {/* Left Banner Image */}
        <div className="hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
            alt="EventifyX banner"
            className="w-full h-full object-cover"
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
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-600 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                required
              />
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
              <NavLink to="/ForgotPassword" className="text-sm text-red-500 hover:underline">
                Forgot Password?
              </NavLink>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Sign In
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <hr className="flex-1 border-gray-300" />
            <span className="px-2 text-gray-400 text-sm">OR</span>
            <hr className="flex-1 border-gray-300" />
          </div>

          {/* Register */}
          <p className="text-center text-gray-600">
            Don’t have an account?{" "}
            <a href="/register" className="text-red-500 font-semibold hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default Loginpage;
