// src/pages/ContactUs.tsx
import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { getProfile } from "../services/userService";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const ContactUs: React.FC = () => {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Prefill from backend profile if available
  useEffect(() => {
    const fill = async () => {
      try {
        setLoadingProfile(true);
        const res = await getProfile();
        if (res?.success && res.user) {
          setForm(prev => ({
            ...prev,
            name: res.user.name || prev.name,
            email: res.user.email || prev.email,
          }));
        }
      } catch {
        // ignore if unauthenticated
      } finally {
        setLoadingProfile(false);
      }
    };
    fill();
  }, []);

  const validate = () => {
    const e: { [k: string]: string } = {};
    if (!form.name.trim()) e.name = "Your name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      console.log("📩 Contact form submitted:", form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
      setErrors({});
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  return (
    <>
    <Navbar/>
    <div className="max-w-5xl mx-auto p-8 bg-white shadow-lg rounded-xl mt-10">
      {/* Header */}
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-6">
        We’re here to help! Reach out to us with any questions or feedback.
      </p>

      {/* Contact Info */}
      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Mail className="w-6 h-6 text-red-500" />
          <div>
            <p className="font-semibold">Email</p>
            <p className="text-gray-500 text-sm">support@eventifyx.com</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <Phone className="w-6 h-6 text-green-500" />
          <div>
            <p className="font-semibold">Phone</p>
            <p className="text-gray-500 text-sm">+1 (555) 123-4567</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg shadow-sm">
          <MapPin className="w-6 h-6 text-blue-500" />
          <div>
            <p className="font-semibold">Address</p>
            <p className="text-gray-500 text-sm">123 Event Street, Cityville, CA</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            placeholder="Your Name"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400"
            disabled={loadingProfile}
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <input
            type="email"
            placeholder="Your Email"
            value={form.email}
            onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400"
            disabled={loadingProfile}
          />
          {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
        </div>

        <div>
          <input
            type="text"
            placeholder="Subject"
            value={form.subject}
            onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400"
          />
          {errors.subject && <p className="text-red-500 text-sm">{errors.subject}</p>}
        </div>

        <div>
          <textarea
            placeholder="Your Message"
            rows={4}
            value={form.message}
            onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-400"
          />
          {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
        </div>

        <button
          type="submit"
          className="px-6 py-2 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition"
        >
          Submit
        </button>
      </form>

      {/* ✅ Status Message */}
      {status === "success" && (
        <p className="mt-4 text-green-600 font-semibold">
          ✅ Your message has been sent successfully!
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-red-600 font-semibold">
          ❌ Something went wrong. Please try again later.
        </p>
      )}
    </div>
  <Footer/>
    </>
  );
};

export default ContactUs;
