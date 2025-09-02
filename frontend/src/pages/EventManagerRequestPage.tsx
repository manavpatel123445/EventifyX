/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import { useSelector } from "react-redux";
import { type  RootState } from "../app/store";
import EventManagerRequestForm from "../components/EventManagerRequestForm";
import Navbar from "../components/Navbar";

const EventManagerRequestPage: React.FC = () => {
  const { user, role } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Check if user is already event manager or admin */}
        {role === "event_manager" || role === "admin" ? (
          <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <h2 className="text-2xl font-bold mb-4">Access Granted</h2>
            <p className="text-gray-600 mb-6">
              You already have {role === "admin" ? "administrative" : "event manager"} privileges.
            </p>
            <div className="space-y-3">
              {role === "event_manager" && (
                <a
                  href="/manager/dashboard"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Go to Manager Dashboard
                </a>
              )}
              {role === "admin" && (
                <a
                  href="/admin/dashboard"
                  className="inline-block px-6 py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 font-medium"
                >
                  Go to Admin Dashboard
                </a>
              )}
            </div>
          </div>
        ) : (
          /* Show request form for regular users */
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Become an Event Manager
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join our community of event organizers and start creating amazing experiences. 
                Submit your request below and our admin team will review it.
              </p>
            </div>

            <EventManagerRequestForm />

            {/* Information Section */}
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-center">What Event Managers Can Do</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      🎯 Create Events
                    </h3>
                    <p className="text-gray-600">
                      Design and publish events with detailed descriptions, pricing, and scheduling options.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      📊 Manage Attendance
                    </h3>
                    <p className="text-gray-600">
                      Track registrations, manage attendee lists, and monitor event analytics in real-time.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      💰 Handle Payments
                    </h3>
                    <p className="text-gray-600">
                      Set up ticketing, manage pricing tiers, and handle payment processing seamlessly.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                      📈 Access Analytics
                    </h3>
                    <p className="text-gray-600">
                      Get detailed insights into event performance, attendance patterns, and revenue metrics.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8">
                <h3 className="text-lg font-semibold mb-3 text-blue-900">Application Process</h3>
                <div className="space-y-3 text-blue-800">
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full text-center mr-3 mt-0.5">1</span>
                    <p>Submit your application with a clear reason and relevant experience</p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full text-center mr-3 mt-0.5">2</span>
                    <p>Our admin team will review your request within 2-3 business days</p>
                  </div>
                  <div className="flex items-start">
                    <span className="inline-block w-6 h-6 bg-blue-600 text-white text-sm font-bold rounded-full text-center mr-3 mt-0.5">3</span>
                    <p>Once approved, you'll receive immediate access to event manager tools</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagerRequestPage;
