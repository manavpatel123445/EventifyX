import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
//import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


const Home = () => {

  // Fetch events (simulate API call)
  
  return (
    <>
      <Navbar/>
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
        {/* {loading ? (
          <p className="text-center">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition"
              >
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-600 mb-1">Category: {event.category}</p>
                  <p className="text-sm text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-800 font-semibold">Price: ${event.price.toFixed(2)}</p>
                  <Link
                    to={`/events/${event.id}`}
                    className="mt-4 inline-block w-full text-center bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )} */}
      </section>        
      
    </div>
    <Footer/>
      </>
  );
};

export default Home;