/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getEventById } from "../services/eventService";
import type { Event } from "../services/eventService";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import TiltCard from "../components/TiltCard";
import Skeleton from "../components/Skeleton";

const Eventdetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: eventData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      if (!id) throw new Error("Event ID not found");
      const response = await getEventById(id);
      if ((response as any)?.success) {
        return (response as any).data as Event;
      }
      // Some callers might return the object directly
      return (response as unknown) as Event;
    }
  });

  useEffect(() => {
    if (isError) {
      toast.error("Event not found");
      const t = setTimeout(() => navigate("/events"), 2000);
      return () => clearTimeout(t);
    }
  }, [isError, navigate]);

  // Always call hooks consistently; derive values guarded by undefined data
  const event = eventData as Event | undefined;

  const banner = useMemo(() => {
    if (event && Array.isArray(event.images) && event.images.length > 0) return event.images[0].replace('.jpg', '');
    return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1200";
  }, [event]);

  const galleryImages = useMemo(() => {
    if (event && Array.isArray(event.images) && event.images.length > 1) return event.images.slice(1);
    return [] as string[];
  }, [event]);

  const ticketMinPrice = useMemo(() => {
    if (!event || !Array.isArray(event.ticketPricing) || event.ticketPricing.length === 0) return 0;
    return event.ticketPricing.reduce((min, t) => Math.min(min, t.price), event.ticketPricing[0].price);
  }, [event]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen font-poppins">
          <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              <Skeleton className="w-full h-[500px] rounded-3xl" />
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-8 space-y-4">
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-4 w-1/4" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 w-20 rounded-full" />
                  <Skeleton className="h-8 w-24 rounded-full" />
                </div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/80 rounded-3xl p-8 space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
            <div className="space-y-6">
              <Skeleton className="h-[600px] w-full rounded-3xl" />
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (isError || !event) {
    return (
      <>
        <Navbar />
        <div className="bg-white dark:bg-[#1B1D2A] min-h-screen font-poppins flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Event Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error?.message || "The event you are looking for does not exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/events")}
              className="px-6 py-3 bg-red-500 dark:bg-red-600 text-white rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition"
            >
              Back to Events
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar/>
      <div className="bg-gray-50/50 dark:bg-slate-950 min-h-screen font-poppins">
        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Poster */}
            <img
              src={banner}
              alt={event.title + " Banner"}
              className="w-full rounded-3xl shadow-2xl dark:shadow-purple-900/10 object-cover max-h-[500px]"
            />

            {/* Title + Tags */}
            <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 rounded-3xl p-8 shadow-xl shadow-purple-900/5 border border-white/50 dark:border-slate-800">
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400">{event.title}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Produced by {event.eventManager?.name || "EventifyX Manager"}</p>
              <div className="mt-4 flex gap-3 flex-wrap">
                <span className="px-4 py-1.5 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-full">
                  {typeof event.category === "object" && event.category !== null ? (event.category as any).name : "General"}
                </span>
                <span className={`px-4 py-1.5 text-sm font-medium rounded-full ${
                  (() => {
                    const now = new Date();
                    const endDate = new Date(event.endDate);
                    if (event.status === 'cancelled') return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300';
                    if (endDate < now) return 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
                    if (new Date(event.startDate) <= now && endDate >= now) return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
                    return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
                  })()
                }`}>
                  {(() => {
                    const now = new Date();
                    const startDate = new Date(event.startDate);
                    const endDate = new Date(event.endDate);
                    if (event.status === 'cancelled') return 'Cancelled';
                    if (endDate < now) return 'Completed';
                    if (startDate <= now && endDate >= now) return 'Happening Now';
                    return 'Upcoming';
                  })()}
                </span>
              </div>
            </div>

            {/* About the Event */}
            <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 rounded-3xl p-8 shadow-xl shadow-purple-900/5 border border-white/50 dark:border-slate-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">About The Event</h2>
              </div>
              <div className="relative">
                <p className={`text-gray-700 dark:text-gray-300 leading-relaxed ${event.description && event.description.length > 200 ? 'line-clamp-4' : ''}`}>
                  {event.description || "No description available."}
                </p>
                {event.description && event.description.length > 200 && (
                  <button 
                    onClick={(e) => {
                      e.currentTarget.previousElementSibling?.classList.toggle('line-clamp-4');
                      e.currentTarget.textContent = e.currentTarget.textContent === 'Read More' ? 'Show Less' : 'Read More';
                    }}
                    className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium mt-2 text-sm focus:outline-none transition-colors"
                  >
                    Read More
                  </button>
                )}
              </div>
            

            {/* Organizer Info */}
            <div className="mt-8 border-t border-gray-100 dark:border-slate-800 pt-8">
              <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center">
                <span className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </span>
                About the Organizer
              </h2>
              <div className="flex items-start gap-5 bg-gray-50/50 dark:bg-slate-800/50 p-6 rounded-2xl border border-white/40 dark:border-slate-700/50">
                <div className="flex-shrink-0">
                  {event.eventManager?.profileImage ? (
                    <img 
                      src={event.eventManager.profileImage} 
                      alt={event.eventManager.name || 'Organizer'}
                      className="w-16 h-16 rounded-2xl object-cover shadow-md"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjcyOEEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhMTAgMTAgMCAwMC0xMC0xMFMwIDkgMCAxMXYyYTIgMiAwIDAwMiAyaDE2YTIgMiAwIDAwLTJ6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="pt-1">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{event.eventManager?.name || 'EventifyX Team'}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {event.eventManager?.email || 'Contact information not available'}
                  </p>
                </div>
              </div>
            </div>
            </div>

            {/* Gallery */}
            <div className="bg-white/80 backdrop-blur-xl dark:bg-slate-900/80 rounded-3xl p-8 shadow-xl shadow-purple-900/5 border border-white/50 dark:border-slate-800">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Gallery</h2>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {galleryImages.length > 0 ? (
                  galleryImages.map((imgUrl: string, idx: number) => (
                    <TiltCard key={idx} tiltAmount={5}>
                      <img src={imgUrl} className="rounded-2xl object-cover h-32 w-full shadow-md" />
                    </TiltCard>
                  ))
                ) : (
                  <TiltCard tiltAmount={5}>
                    <img src={banner} className="rounded-2xl object-cover h-32 w-full shadow-md" />
                  </TiltCard>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Booking Panel */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <TiltCard tiltAmount={4}>
              <div className="bg-white/90 backdrop-blur-2xl dark:bg-slate-900/90 rounded-3xl p-8 shadow-2xl shadow-purple-900/10 border border-white/50 dark:border-slate-800 sticky top-10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 pointer-events-none group-hover:bg-purple-500/20 transition-all duration-500"></div>
                <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-slate-700/50 relative z-10 transition-colors group-hover:bg-gray-50/80 dark:group-hover:bg-slate-800/80">
                {event.eventManager?.profileImage ? (
                  <img 
                    src={event.eventManager.profileImage} 
                    alt={event.eventManager.name || 'Organizer'}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiwjNkI3MjhBIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTIwIDIxdi0yYTEwIDEwIDAgMDAtMTAtMTBTMCA5IDAgMTF2MmEyIDIgMCAwMDIgMmgxNmEyIDIgMCAwMDItMnoiLz48Y2lyY2xlIGN4PSIxMiIgY3k9IjciIHI9IjQiLz48L3N2Zz4=';
                    }}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-0.5">Organized by</p>
                  <p className="font-bold text-gray-900 dark:text-white">{event.eventManager?.name || 'EventifyX Team'}</p>
                </div>
              </div>
              <ul className="space-y-5 text-gray-700 dark:text-gray-300 relative z-10">
                <li>
                  📅 {(() => {
                    const sd = new Date(event.startDate);
                    const ed = new Date(event.endDate);
                    const sameDay = sd.toDateString() === ed.toDateString();
                    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    return sameDay ? fmt(sd) : `${fmt(sd)} – ${fmt(ed)}`;
                  })()}
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-3 mt-0.5">⏰</span>
                  <span>
                    {new Date(`2000-01-01T${event.startTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    {event.endTime ? ` – ${new Date(`2000-01-01T${event.endTime}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}` : ''}
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-xl mr-3 mt-0.5">📍</span>
                  <span>{event.venue?.name}, {event.venue?.address}, {event.venue?.city}</span>
                </li>
                {event.venue?.state && (
                  <li className="flex items-start">
                    <span className="text-xl mr-3 mt-0.5">🏙️</span>
                    <span>{event.venue.state}</span>
                  </li>
                )}
              </ul>

              <div className={`mt-6 font-semibold inline-block px-4 py-1.5 rounded-full relative z-10 ${
                (() => {
                  const now = new Date();
                  const endDate = new Date(event.endDate);
                  if (event.status === 'cancelled') return 'text-yellow-600 dark:text-yellow-400';
                  if (endDate < now) return 'text-gray-600 dark:text-gray-400';
                  if (new Date(event.startDate) <= now && endDate >= now) return 'text-green-600 dark:text-green-400';
                  return 'text-blue-600 dark:text-blue-400';
                })()
              }`}>
                {(() => {
                  const now = new Date();
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  if (event.status === 'cancelled') return 'Event Cancelled';
                  if (endDate < now) return 'Event Completed';
                  if (startDate <= now && endDate >= now) return 'Event in Progress';
                  return 'Bookings Open';
                })()}
              </div>

              <div className="mt-8 border-t border-gray-100 dark:border-slate-800 pt-6 relative z-10">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Starting from</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white">
                  {ticketMinPrice > 0 ? `₹${ticketMinPrice}` : 'Free'}
                </p>
                <button
                  onClick={() => {
                    const isAuthenticated = Boolean(localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"));
                    if (!isAuthenticated) {
                      toast.error("Please login to book tickets");
                      navigate("/login", { state: { from: `/event/${id}` } });
                      return;
                    }
                    navigate(`/checkout?eventId=${event._id}`);
                  }}
                  disabled={(() => {
                    const now = new Date();
                    const startDate = new Date(event.startDate);
                    const endDate = new Date(event.endDate);
                    if (event.status === 'cancelled') return true;
                    if (endDate < now) return true;
                    if (startDate <= now && endDate >= now) return false; // Allow booking for ongoing events
                    return event.status !== 'upcoming';
                  })()}
                  className="mt-6 w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  Book Now
                </button>
              </div>

              {Array.isArray(event.ticketPricing) && event.ticketPricing.length > 0 && (
                <div className="mt-6 p-5 bg-gray-50/50 dark:bg-slate-800/50 rounded-2xl border border-white/40 dark:border-slate-700/50 relative z-10">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wider">Ticket Types</h3>
                  <ul className="space-y-2 text-sm">
                    {event.ticketPricing.map((t, i) => (
                      <li key={i} className="flex justify-between items-center py-1">
                        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">{t.type}</span>
                        <div className="text-right">
                          <span className="block font-bold text-gray-900 dark:text-white">₹{t.price}</span>
                          <span className="text-xs text-purple-600 dark:text-purple-400">{t.quantity - (t.sold ?? 0)} left</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Eventdetail;