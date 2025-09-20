/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getEventById } from "../services/eventService";
import type { Event } from "../services/eventService";
import toast from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";

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
    if (event && Array.isArray(event.images) && event.images.length > 0) return event.images[0];
    return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&auto=format&fit=crop&q=60";
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
        <div className="bg-white min-h-screen font-poppins flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event details...</p>
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
        <div className="bg-white min-h-screen font-poppins flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Event Not Found</h1>
            <p className="text-gray-600 mb-4">
              {error?.message || "The event you are looking for does not exist or has been removed."}
            </p>
            <button
              onClick={() => navigate("/events")}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
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
      <div className="bg-white min-h-screen font-poppins">
        {/* Main Layout */}
        <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Poster */}
            <img
              src={banner}
              alt={event.title + " Banner"}
              className="w-full rounded-xl shadow-lg"
            />

            {/* Title + Tags */}
            <div>
              <h1 className="text-3xl font-bold">{event.title}</h1>
              <p className="text-gray-500">Produced by {event.eventManager?.name || "EventifyX Manager"}</p>
              <div className="mt-2 flex gap-3">
                <span className="px-3 py-1 bg-gray-200 text-sm rounded-full">
                  {typeof event.category === "object" && event.category !== null ? (event.category as any).name : "General"}
                </span>
                <span className={`px-3 py-1 text-sm rounded-full ${
                  (() => {
                    const now = new Date();
                    const endDate = new Date(event.endDate);
                    if (event.status === 'cancelled') return 'bg-yellow-100 text-yellow-800';
                    if (endDate < now) return 'bg-gray-200 text-gray-800';
                    if (new Date(event.startDate) <= now && endDate >= now) return 'bg-green-100 text-green-800';
                    return 'bg-blue-100 text-blue-800';
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
            <div>
              <h2 className="text-xl font-semibold mb-3">About The Event</h2>
              <div className="relative">
                <p className={`text-gray-700 leading-relaxed ${event.description && event.description.length > 200 ? 'line-clamp-4' : ''}`}>
                  {event.description || "No description available."}
                </p>
                {event.description && event.description.length > 200 && (
                  <button 
                    onClick={(e) => {
                      e.currentTarget.previousElementSibling?.classList.toggle('line-clamp-4');
                      e.currentTarget.textContent = e.currentTarget.textContent === 'Read More' ? 'Show Less' : 'Read More';
                    }}
                    className="text-red-500 hover:text-red-600 font-medium mt-1 text-sm focus:outline-none"
                  >
                    Read More
                  </button>
                )}
              </div>
            </div>

            {/* Organizer Info */}
            <div className="mt-8 border-t pt-6">
              <h2 className="text-xl font-semibold mb-3">About the Organizer</h2>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {event.eventManager?.profileImage ? (
                    <img 
                      src={event.eventManager.profileImage} 
                      alt={event.eventManager.name || 'Organizer'}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM2QjcyOEEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cGF0aCBkPSJNMjAgMjF2LTJhMTAgMTAgMCAwMC0xMC0xMFMwIDkgMCAxMXYyYTIgMiAwIDAwMiAyaDE2YTIgMiAwIDAwLTJ6Ii8+PGNpcmNsZSBjeD0iMTIiIGN5PSI3IiByPSI0Ii8+PC9zdmc+';
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{event.eventManager?.name || 'EventifyX Team'}</h3>
                  <p className="text-gray-500 mt-1">
                    {event.eventManager?.email || 'Contact information not available'}
                  </p>
                </div>
              </div>
            </div>

            {/* Gallery */}
            <div>
              <h2 className="text-xl font-semibold mb-3">Gallery</h2>
              <div className="grid grid-cols-3 gap-3">
                {galleryImages.length > 0 ? (
                  galleryImages.map((imgUrl: string, idx: number) => (
                    <img key={idx} src={imgUrl} className="rounded-lg" />
                  ))
                ) : (
                  <img src={banner} className="rounded-lg" />
                )}
              </div>
            </div>
          </div>

          {/* Right Booking Panel */}
          <div className="space-y-6">
            <div className="border rounded-xl p-6 shadow-lg sticky top-10">
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
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
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Organized by</p>
                  <p className="font-medium">{event.eventManager?.name || 'EventifyX Team'}</p>
                </div>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li>📅 {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} – {new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</li>
                <li>⏰ {new Date(`2000-01-01T${event.startTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} – {new Date(`2000-01-01T${event.endTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</li>
                <li>📍 {event.venue?.name}, {event.venue?.address}, {event.venue?.city}</li>
                {event.venue?.state && (<li>🏙️ {event.venue.state}</li>)}
              </ul>

              <div className={`mt-4 font-medium ${
                (() => {
                  const now = new Date();
                  const endDate = new Date(event.endDate);
                  if (event.status === 'cancelled') return 'text-yellow-600';
                  if (endDate < now) return 'text-gray-600';
                  if (new Date(event.startDate) <= now && endDate >= now) return 'text-green-600';
                  return 'text-blue-600';
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

              <div className="mt-4">
                <p className="text-lg font-bold">{ticketMinPrice > 0 ? `₹${ticketMinPrice} onwards` : 'Free'}</p>
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
                  className="mt-3 w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                >
                  Book Now
                </button>
              </div>

              {Array.isArray(event.ticketPricing) && event.ticketPricing.length > 0 && (
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Ticket Types</h3>
                  <ul className="space-y-1 text-sm text-gray-700">
                    {event.ticketPricing.map((t, i) => (
                      <li key={i} className="flex justify-between">
                        <span className="capitalize">{t.type}</span>
                        <span>₹{t.price} · {t.quantity - (t.sold ?? 0)} left</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
};

export default Eventdetail;