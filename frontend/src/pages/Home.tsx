import React, { useState, useEffect, useRef, Suspense } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getAllEvents, type Event } from "../services/eventService";
import { formatINR } from "../utils/currency";
import { getAllCategories } from "../services/categoryService";
// Lazy load Navbar and Footer
const Navbar = React.lazy(() => import("../components/Navbar"));
const Footer = React.lazy(() => import("../components/Footer"));

interface Category {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  status?: string;
}

const Home = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const categoryScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll categories every 2.0 seconds
  useEffect(() => {
    const container = categoryScrollRef.current;
    if (!container) return;

    const scrollStep = 240; // pixels per step (approx one card)
    const interval = setInterval(() => {
      if (!container) return;
      const nearEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 5;
      if (nearEnd) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: scrollStep, behavior: "smooth" });
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Events Query with TanStack Query
  const {
    data: eventsResponse,
    isLoading: eventsLoading,
    error: eventsError,
    refetch: refetchEvents
  } = useQuery({
    queryKey: ['events', 'active', { limit: 9 }],
    queryFn: async () => {
      const response = await getAllEvents({ limit: 9 });
      return response;
    },
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
      }
      return failureCount < 2;
    }
  });

  // Categories Query with TanStack Query
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ['categories', 'active'],
    queryFn: async () => {
      const response = await getAllCategories();
      return response;
    },
    staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes (categories change less frequently)
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });

  // Process events data
  const events: Event[] = (() => {
    if (!eventsResponse) return [];
    
    let eventsData = [];
    if (eventsResponse?.success && eventsResponse?.data?.events) {
      eventsData = eventsResponse.data.events;
    } else if (eventsResponse?.data?.events) {
      eventsData = eventsResponse.data.events;
    } else {
      eventsData = eventsResponse?.events || [];
    }
    
    return eventsData;
  })();

  // Process categories data
  const categories: Category[] = (() => {
    if (!categoriesResponse) return [];
    
    let categoriesData = [];
    if (categoriesResponse?.success && categoriesResponse?.data) {
      categoriesData = categoriesResponse.data;
    } else if (categoriesResponse?.data) {
      categoriesData = categoriesResponse.data;
    } else if (Array.isArray(categoriesResponse)) {
      categoriesData = categoriesResponse;
    }
    
    // Filter only active categories
    const activeCategories = categoriesData.filter((cat: Category) => 
      !cat.status || cat.status === 'active'
    );
    
    return activeCategories;
  })();

  // Computed loading states
  const loading = eventsLoading;
  const hasEventsError = !!eventsError;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCity) params.append('city', selectedCity);
    window.location.href = `/events?${params.toString()}`;
  };

  return (
    <>
      <Suspense fallback={<div>Loading Navbar...</div>}>
        <Navbar />
      </Suspense>
      
      {/* Enhanced Hero Section */}
      <section
        className="relative flex items-center justify-center h-[500px] md:h-[600px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
        <div className="relative z-10 text-center text-white max-w-4xl px-6">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg">
            Welcome to <span className="text-red-400">EventifyX</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 drop-shadow max-w-2xl mx-auto leading-relaxed">
            Discover amazing events, connect with your community, and create unforgettable experiences.
          </p>
          
          {/* Search Bar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <input
                type="text"
                placeholder="City..."
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="md:w-40 px-4 py-3 rounded-lg border border-gray-300 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                onClick={handleSearch}
                className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                Search Events
              </button>
            </div>
          </div>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/events"
              className="inline-block rounded-lg bg-red-500 px-8 py-4 font-semibold text-white shadow-lg hover:bg-red-600 transition-all transform hover:scale-105"
            >
              Browse Events
            </Link>
            <Link
              to="/create-event"
              className="inline-block rounded-lg bg-transparent border-2 border-white px-8 py-4 font-semibold text-white shadow-lg hover:bg-white hover:text-red-500 transition-all transform hover:scale-105"
            >
              Create Event
            </Link>
          </div>
        </div>
      </section>
      <div className="bg-gray-50">
        {/* Categories Section */}
        <section className="py-16 px-6 md:px-16 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">Explore by Category</h2>
            <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Find events that match your interests across various categories
            </p>
            {categoriesLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
                <span className="ml-3 text-gray-600">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📁</div>
                <p className="text-gray-500">No categories available</p>
              </div>
            ) : (
              <>
                <div
                  ref={categoryScrollRef}
                  className="relative overflow-x-auto no-scrollbar mb-8"
                  style={{ scrollBehavior: "smooth" }}
                >
                  <div className="flex gap-4 pr-4 snap-x snap-mandatory">
                    {categories.slice(0, 20).map((category) => {
                      const categoryColor = category.color || '#6B7280';
                      const categoryIcon = category.icon || '📁';
                      return (
                        <Link
                          key={category._id}
                          to={`/events?category=${category._id}`}
                          className="snap-start shrink-0 w-[220px] group text-center p-6 bg-gray-50 rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-current transform hover:scale-105"
                          style={{
                            '--category-color': categoryColor,
                            borderColor: 'transparent'
                          } as React.CSSProperties}
                          onMouseEnter={(e) => {
                            (e.target as HTMLElement).style.borderColor = categoryColor;
                          }}
                          onMouseLeave={(e) => {
                            (e.target as HTMLElement).style.borderColor = 'transparent';
                          }}
                        >
                          <div
                            className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-md"
                            style={{
                              backgroundColor: `${categoryColor}15`,
                              border: `2px solid ${categoryColor}30`
                            }}
                          >
                            <span
                              className="text-3xl"
                              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                            >
                              {categoryIcon}
                            </span>
                          </div>
                          <h3
                            className="font-bold text-sm mb-2 group-hover:text-current transition-colors"
                            style={{ color: categoryColor }}
                          >
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-xs text-gray-500 group-hover:text-gray-600 transition-colors line-clamp-2">
                              {category.description}
                            </p>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                {categories.length > 20 && (
                  <div className="text-center">
                    <Link
                      to="/events"
                      className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-semibold transition-colors"
                    >
                      View All Categories
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Featured Events Section */}
        <section className="py-16 px-6 md:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Featured Events</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Don't miss out on these amazing upcoming events happening in your area
              </p>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
                <p className="ml-4 text-gray-600">Loading amazing events...</p>
              </div>
            ) : hasEventsError ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-xl text-gray-500 mb-4">Unable to load events</p>
                <p className="text-gray-400 mb-6">There was an issue connecting to our servers</p>
                <button
                  onClick={() => refetchEvents()}
                  className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎭</div>
                <p className="text-xl text-gray-500 mb-4">No events available right now</p>
                <p className="text-gray-400 mb-6">Be the first to create an amazing event!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    to="/create-event"
                    className="inline-block bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Create First Event
                  </Link>
                  <button
                    onClick={() => refetchEvents()}
                    className="inline-block bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Refresh Events
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                
                {events.slice(0, 9).map((event) => (
                   <Link
                     key={event._id}
                     to={`/events/${event._id}`}
                     className="block h-full"
                   >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 group h-full flex flex-col">
                    <div className="relative overflow-hidden">
                      <img
                        src={event.images?.[0] || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=400&q=80"}
                        alt={event.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-red-500/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                          {event.category?.name || 'General'}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-gray-800 line-clamp-2 group-hover:text-red-600 transition-colors mb-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                      
                      <div className="space-y-3 mb-4 flex-1">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          {(() => {
                            const startDate = event.startDate;
                            const endDate = event.endDate;
                            const isSameDate = startDate && endDate &&
                              new Date(startDate).toDateString() === new Date(endDate).toDateString();

                            if (isSameDate) {
                              // Same date - show single entry with time range
                              return (
                                <>
                                  <div className="flex items-start">
                                    <span className="text-red-500 mt-0.5 mr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </span>
                                    <div className="flex-1">
                                      <div className="text-xs font-medium text-gray-500 mb-1">DATE & TIME</div>
                                      <div className="text-sm text-gray-800">
                                        {new Date(event.startDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                        <span className="mx-2 text-gray-300">•</span>
                                        {new Date(`2000-01-01T${event.startTime || '00:00'}`).toLocaleTimeString('en-US', {
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })} - {new Date(`2000-01-01T${event.endTime || '00:00'}`).toLocaleTimeString('en-US', {
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </div>
                                    </div>
                                  </div>
                                </>
                              );
                            } else {
                              // Different dates - show separate start and end
                              return (
                                <>
                                  <div className="flex items-start">
                                    <span className="text-red-500 mt-0.5 mr-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </span>
                                    <div className="flex-1">
                                      <div className="text-xs font-medium text-gray-500 mb-1">START</div>
                                      <div className="text-sm text-gray-800">
                                        {new Date(event.startDate).toLocaleDateString('en-US', {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric'
                                        })}
                                        <span className="mx-2 text-gray-300">•</span>
                                        {new Date(`2000-01-01T${event.startTime || '00:00'}`).toLocaleTimeString('en-US', {
                                          hour: 'numeric',
                                          minute: '2-digit',
                                          hour12: true
                                        })}
                                      </div>
                                    </div>
                                  </div>

                                  {event.endDate && (
                                    <div className="flex items-start mt-2 pt-2 border-t border-gray-100">
                                      <span className="text-red-500 mt-0.5 mr-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </span>
                                      <div className="flex-1">
                                        <div className="text-xs font-medium text-gray-500 mb-1">END</div>
                                        <div className="text-sm text-gray-800">
                                          {new Date(event.endDate).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                          <span className="mx-2 text-gray-300">•</span>
                                          {new Date(`2000-01-01T${event.endTime || '00:00'}`).toLocaleTimeString('en-US', {
                                            hour: 'numeric',
                                            minute: '2-digit',
                                            hour12: true
                                          })}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            }
                          })()}
                        </div>

                        <div className="flex items-center text-sm text-gray-600">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-2 ml-3 " fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-1">{event.venue?.city || 'Location TBD'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-white p-3 rounded-lg border border-red-50">
                          <div className="flex items-center text-sm font-medium text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            From {typeof event.ticketPricing?.[0]?.price === 'number' 
                              ? formatINR(event.ticketPricing[0].price)
                              : 'Free'}
                          </div>
                         
                        </div>
                      </div>
                     
                      <button className="w-full mt-auto bg-gradient-to-r from-red-500 to-red-600 text-white py-2.5 px-4 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-300 font-semibold text-sm flex items-center justify-center space-x-2 group-hover:shadow-lg">
                        <span>View Event</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </button>
                       
                      
                    </div>
                  </div>
                  </Link>
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link
                to="/events"
                className="inline-block bg-transparent border-2 border-red-500 text-red-500 px-8 py-3 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 font-semibold"
              >
                View All Events
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-6 md:px-16 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Why Choose EventifyX?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Everything you need to discover, create, and manage amazing events
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔍</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Discover Events</h3>
                <p className="text-gray-600">
                  Find amazing events happening near you with our powerful search and filtering system.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✨</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Create Events</h3>
                <p className="text-gray-600">
                  Easily create and manage your own events with our intuitive event creation tools.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎟️</span>
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">Secure Ticketing</h3>
                <p className="text-gray-600">
                  Safe and secure ticket purchasing with integrated payment processing and QR codes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 px-6 md:px-16 bg-gradient-to-r from-red-500 to-red-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of event creators and attendees on EventifyX
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="inline-block bg-white text-red-600 px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors font-semibold shadow-lg"
              >
                Sign Up Now
              </Link>
              <Link
                to="/events"
                className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-red-600 transition-colors font-semibold"
              >
                Browse Events
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Suspense fallback={<div>Loading Footer...</div>}>
        <Footer />
      </Suspense>
    </>
  );
};

export default Home;