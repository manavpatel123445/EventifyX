/* eslint-disable @typescript-eslint/no-unused-vars */
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAllEvents, type Event } from "../services/eventService";

const Home = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getAllEvents({ status: "upcoming", limit: 6 });
        setEvents(data.events || []);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <>
      <Navbar />
      {/* Hero Section with Background Image */}
      <section
        className="relative flex items-center justify-center h-[350px] md:h-[450px] w-full bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">Welcome to EventifyX</h1>
          <p className="text-lg md:text-xl mb-6 drop-shadow">Discover, create, and join amazing events near you.</p>
          <Link
            to="/create-event"
            className="inline-block rounded-lg bg-red-400 px-8 py-3 font-semibold text-white shadow hover:bg-red-600 transition"
          >
            Create Event
          </Link>
        </div>
      </section>
      <div className="min-h-screen bg-gray-50">
        {/* Events Section */}
        <section className="py-12 px-6 md:px-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Upcoming Events</h2>
          {loading ? (
            <p className="text-center">Loading events...</p>
          ) : events.filter(event => new Date(event.startDate) > new Date() && event.status !== 'completed').length === 0 ? (
            <p className="text-center text-gray-500">No upcoming events found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(event => new Date(event.startDate) > new Date() && event.status !== 'completed').map((event) => (
                <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={event.images[0] || "https://via.placeholder.com/400x250"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{event.category.name}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Date:</span> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Venue:</span> {event.venue.name}, {event.venue.city}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Price:</span> From ${event.ticketPricing[0]?.price || 0}
                    </p>
                    <Link
                      to={`/events/${event._id}`}
                      className="block w-full text-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="py-12 px-6 md:px-16">
          <h2 className="text-2xl font-semibold mb-6 text-center">Ongoing Events</h2>
          {loading ? (
            <p className="text-center">Loading events...</p>
          ) : events.filter(event => new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date() && event.status !== 'completed').length === 0 ? (
            <p className="text-center text-gray-500">No ongoing events found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.filter(event => new Date(event.startDate) <= new Date() && new Date(event.endDate) >= new Date() && event.status !== 'completed').map((event) => (
                <div key={event._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img
                    src={event.images[0] || "https://via.placeholder.com/400x250"}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{event.category.name}</p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Date:</span> {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500 mb-1">
                      <span className="font-medium">Venue:</span> {event.venue.name}, {event.venue.city}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Price:</span> From ${event.ticketPricing[0]?.price || 0}
                    </p>
                    <Link
                      to={`/events/${event._id}`}
                      className="block w-full text-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        <div></div>
      </div>
      <Footer />
    </>
  );
};

export default Home;