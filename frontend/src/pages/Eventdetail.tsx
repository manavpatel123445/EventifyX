import React from "react";

const Eventdetail: React.FC = () => {
  return (
    <div className="bg-white min-h-screen font-poppins">
      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-6 py-10 grid lg:grid-cols-3 gap-10">
        {/* Left Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Poster */}
          <img
            src="https://via.placeholder.com/900x500"
            alt="Event Banner"
            className="w-full rounded-xl shadow-lg"
          />

          {/* Title + Tags */}
          <div>
            <h1 className="text-3xl font-bold">Papa Yaar by Zakir Khan</h1>
            <p className="text-gray-500">Produced by TribeVibe</p>
            <div className="mt-2 flex gap-3">
              <span className="px-3 py-1 bg-gray-200 text-sm rounded-full">
                Stand-up Comedy
              </span>
              <span className="px-3 py-1 bg-gray-200 text-sm rounded-full">
                Live Show
              </span>
            </div>
          </div>

          {/* About the Event */}
          <div>
            <h2 className="text-xl font-semibold mb-2">About The Event</h2>
            <p className="text-gray-700 leading-relaxed">
              Join Zakir Khan for an unforgettable evening of laughter and stories. 
              This show brings his signature style of comedy and heartfelt storytelling 
              to the stage. Limited seats available — book now!
            </p>
          </div>

          {/* Audience Interaction */}
          <div className="flex items-center gap-3">
            <span className="text-green-600 font-medium">8.9k people interested</span>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-100">
              I’m Interested
            </button>
          </div>

          {/* Gallery */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Gallery</h2>
            <div className="grid grid-cols-3 gap-3">
              <img src="https://via.placeholder.com/300" className="rounded-lg" />
              <img src="https://via.placeholder.com/300" className="rounded-lg" />
              <img src="https://via.placeholder.com/300" className="rounded-lg" />
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Reviews & Ratings</h2>
            <div className="space-y-3">
              <div className="border p-4 rounded-lg">
                <p className="font-medium">⭐ 4.5 - Rohan</p>
                <p className="text-gray-600 text-sm">
                  Amazing performance! Zakir never disappoints.
                </p>
              </div>
              <div className="border p-4 rounded-lg">
                <p className="font-medium">⭐ 5.0 - Neha</p>
                <p className="text-gray-600 text-sm">
                  Best comedy night I’ve been to! Totally worth it.
                </p>
              </div>
            </div>
          </div>

          {/* Similar Events */}
          <div>
            <h2 className="text-xl font-semibold mb-3">Similar Events</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                <img src="https://via.placeholder.com/300" alt="Event" />
                <div className="p-3">
                  <h3 className="font-semibold">Kenny Sebastian Live</h3>
                  <p className="text-sm text-gray-500">₹1499 onwards</p>
                  <button className="mt-2 text-sm px-3 py-1 bg-red-500 text-white rounded-lg">
                    Book Now
                  </button>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                <img src="https://via.placeholder.com/300" alt="Event" />
                <div className="p-3">
                  <h3 className="font-semibold">Atul Khatri Standup</h3>
                  <p className="text-sm text-gray-500">₹999 onwards</p>
                  <button className="mt-2 text-sm px-3 py-1 bg-red-500 text-white rounded-lg">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Booking Panel */}
        <div className="space-y-6">
          <div className="border rounded-xl p-6 shadow-lg sticky top-10">
            <ul className="space-y-3 text-gray-700">
              <li>📅 Oct 24, 2025 – Jan 11, 2026</li>
              <li>⏰ 8:00 PM</li>
              <li>⏳ 2 hours 30 minutes</li>
              <li>🚻 Age 18+</li>
              <li>🌐 Language: Hindi</li>
              <li>📍 Auda Auditorium, Ahmedabad</li>
              <li className="text-blue-600 underline cursor-pointer">
                View 7 other venues
              </li>
            </ul>

            <div className="mt-4 text-red-600 font-medium">
              Bookings filling fast in Ahmedabad
            </div>

            <div className="mt-4">
              <p className="text-lg font-bold">₹1999 onwards</p>
              <button className="mt-3 w-full py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                Book Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eventdetail;