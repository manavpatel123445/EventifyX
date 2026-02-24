/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getAllEvents } from "../services/eventService";
import { getAllCategories } from "../services/categoryService";
import type { Event } from "../services/eventService";
import toast from "react-hot-toast";

interface EventsData {
  events: Event[];
  pagination: {
    current: number;
    pages: number;
    total: number;
  };
}

const EventPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; status?: string }>>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const location = useLocation();

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm || undefined,
        category: selectedCategory || undefined,
        city: selectedCity || undefined,
        page: currentPage,
        limit: 9
      };

      const response = await getAllEvents(params);
      if (response.success) {
        const data: EventsData = response.data;
        const now = new Date();
        const activeEvents = data.events.filter(event => {
          const end = event?.endDate ? new Date(event.endDate) : (event?.startDate ? new Date(event.startDate) : null);
          if (!end) return true; // if no dates, keep it
          return end >= now && event.status !== 'cancelled' && event.isPublic !== false && event.isDeleted !== true && event.eventManager?.status !== 'blocked';
        });
        setEvents(activeEvents);
        setTotalPages(data.pagination.pages);
      } else {
        toast.error("Failed to load events");
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Load categories for the filter
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await getAllCategories();
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        // keep only active if status exists
        const active = list.filter((c: any) => !c.status || c.status === 'active');
        setCategories(active);
      } catch (e) {
        // silent fail for categories filter; page can still function
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Initialize filters from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const s = params.get('search') || "";
    const c = params.get('city') || "";
    const cat = params.get('category') || ""; // expecting category ID
    const pageParam = parseInt(params.get('page') || "1", 10);

    setSearchTerm(s);
    setSelectedCity(c);
    setSelectedCategory(cat);
    setCurrentPage(Number.isNaN(pageParam) ? 1 : pageParam);
  }, [location.search]);

  useEffect(() => {
    fetchEvents();
  }, [currentPage, searchTerm, selectedCategory, selectedCity]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCity(e.target.value);
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return 'TBD';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <>
      <Navbar />
      <div className="bg-gray-50 min-h-screen font-poppins">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white py-16">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Discover Amazing Events
            </h1>
            <p className="text-xl mb-8">
              Find the best events happening around you
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto bg-white rounded-full p-2 flex items-center shadow-lg">
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="flex-1 px-4 py-3 text-gray-800 rounded-full focus:outline-none"
              />
              <button className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition">
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Categories</option>
                  {categoriesLoading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  placeholder="Enter city"
                  value={selectedCity}
                  onChange={handleCityChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedCity("");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
              <span className="ml-3 text-gray-600">Loading events...</span>
            </div>
          )}

          {/* Events Grid */}
          {!loading && (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {events.map((event) => (
                  <Link
                    key={event._id}
                    to={`/events/${event._id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  >
                    <div className="aspect-w-16 aspect-h-9">
                      <img
                        src={
                          event.images && event.images.length > 0
                            ? event.images[0]
                            : "https://via.placeholder.com/400x225?text=Event+Image"
                        }
                        alt={event.title}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-red-500 font-medium">
                          {event.category?.name || 'General'}
                        </span>
                        <span className="text-sm text-gray-500">
                          {(() => {
                            const sd = new Date(event.startDate);
                            const ed = event.endDate ? new Date(event.endDate) : null;
                            const isSameDate = ed && sd.toDateString() === ed.toDateString();

                            if (isSameDate) {
                              // Same date - show single date with time range
                              return `${formatDate(event.startDate)} • ${formatTime(event.startTime)}${event.endTime ? ` – ${formatTime(event.endTime)}` : ''}`;
                            } else {
                              // Different dates - show date range
                              return `${formatDate(event.startDate)}${event.endDate ? ` – ${formatDate(event.endDate as string)}` : ''}`;
                            }
                          })()}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-500 mb-2">
                        <span className="mr-1">📍</span>
                        <span>{`${event.venue?.city || 'TBD'}${event.venue?.state ? `, ${event.venue.state}` : ''}`}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-green-600">
                          {event.ticketPricing?.length
                            ? `From ₹${Math.min(...event.ticketPricing.map(t => t.price)).toLocaleString('en-IN')}`
                            : 'Free'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {event.eventManager?.name || 'Organizer'}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* No Events Found */}
              {events.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎪</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No events found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or check back later for new events.
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("");
                      setSelectedCity("");
                      setCurrentPage(1);
                    }}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  >
                    Show All Events
                  </button>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-12">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`px-4 py-2 border rounded-lg ${
                            currentPage === pageNum
                              ? "bg-red-500 text-white border-red-500"
                              : "border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default EventPage;
