/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
                <span className="px-3 py-1 bg-gray-200 text-sm rounded-full">
                  {(() => {
                    const now = new Date();
                    const startDate = new Date(event.startDate);
                    const endDate = new Date(event.endDate);
                    if (event.status === 'cancelled') return 'cancelled';
                    if (endDate < now) return 'completed';
                    if (startDate <= now && endDate >= now) return 'ongoing';
                    return 'upcoming';
                  })()}
                </span>
              </div>
            </div>

            {/* About the Event */}
            <div>
              <h2 className="text-xl font-semibold mb-2">About The Event</h2>
              <p className="text-gray-700 leading-relaxed">
                {event.description || "No description available."}
              </p>
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
              <ul className="space-y-3 text-gray-700">
                <li>📅 {new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}</li>
                <li>⏰ {event.startTime} – {event.endTime}</li>
                <li>📍 {event.venue?.name}, {event.venue?.address}, {event.venue?.city}</li>
                {event.venue?.state && (<li>🏙️ {event.venue.state}</li>)}
              </ul>

              <div className="mt-4 text-red-600 font-medium">
                {(() => {
                  const now = new Date();
                  const startDate = new Date(event.startDate);
                  const endDate = new Date(event.endDate);
                  if (event.status === 'cancelled') return 'Event cancelled';
                  if (endDate < now) return 'Event completed';
                  if (startDate <= now && endDate >= now) return 'Event ongoing';
                  return 'Bookings open';
                })()}
              </div>

              <div className="mt-4">
                <p className="text-lg font-bold">{ticketMinPrice > 0 ? `₹${ticketMinPrice} onwards` : 'Free'}</p>
              <Link to={`/checkout?eventId=${event._id}`}> <button
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
                </button></Link>
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