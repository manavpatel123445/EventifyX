import React, { useState } from "react";
import { EventViewModal, EventQuickView } from "./index";
import type { Event } from "../services/eventService";

// Sample event data for demonstration
const sampleEvent: Event = {
  _id: "demo-event-1",
  title: "Tech Conference 2024",
  description: "Join us for the biggest tech conference of the year! Learn from industry experts, network with professionals, and discover the latest trends in technology. This event will feature keynote speakers, workshops, and networking sessions.",
  category: {
    _id: "tech-category",
    name: "Technology"
  },
  startDate: "2024-12-15T00:00:00.000Z",
  endDate: "2024-12-16T00:00:00.000Z",
  startTime: "09:00",
  endTime: "18:00",
  venue: {
    name: "Tech Convention Center",
    address: "123 Innovation Drive",
    city: "San Francisco",
    state: "CA"
  },
  ticketPricing: [
    {
      type: "early_bird",
      price: 99,
      quantity: 200,
      sold: 150
    },
    {
      type: "regular",
      price: 149,
      quantity: 500,
      sold: 300
    },
    {
      type: "vip",
      price: 299,
      quantity: 100,
      sold: 75
    }
  ],
  images: [
    "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400&h=300&fit=crop"
  ],
  eventManager: {
    _id: "manager-1",
    name: "John Smith",
    email: "john.smith@techconf.com"
  },
  status: "upcoming",
  isPublic: true,
  totalBookings: 525,
  totalRevenue: 78750,
  slug: "tech-conference-2024",
  tags: ["technology", "conference", "networking", "workshops"],
  createdAt: "2024-01-15T00:00:00.000Z",
  updatedAt: "2024-11-01T00:00:00.000Z",
  isDeleted: false
};

const EventViewDemo: React.FC = () => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Event View Components Demo
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This page demonstrates the EventViewModal and EventQuickView components 
            that provide comprehensive event details for admin and manager views.
          </p>
        </div>

        {/* Quick View Component Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Event Quick View Component
          </h2>
          <div className="max-w-2xl">
            <EventQuickView 
              event={sampleEvent}
              showActions={true}
              onEdit={() => alert("Edit clicked!")}
              onDelete={() => alert("Delete clicked!")}
            />
          </div>
        </div>

        {/* Modal Trigger Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Event View Modal Component
          </h2>
          <div className="text-center">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Open Event Details Modal
            </button>
            <p className="text-sm text-gray-600 mt-2">
              Click the button above to see the full event details modal
            </p>
          </div>
        </div>

        {/* Usage Instructions */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            How to Use These Components
          </h3>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-medium text-gray-800">EventQuickView Component:</h4>
              <p className="text-sm">
                Use this component in lists, tables, or grids to show a condensed view of event information. 
                It includes a "View Details" button that opens the full modal.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">EventViewModal Component:</h4>
              <p className="text-sm">
                This is a comprehensive modal that displays all event details in an organized, 
                read-only format. Perfect for admin and manager dashboards.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">Key Features:</h4>
              <ul className="text-sm list-disc list-inside space-y-1 ml-4">
                <li>Responsive design that works on all screen sizes</li>
                <li>Comprehensive event information display</li>
                <li>Status indicators with color coding</li>
                <li>Image galleries for event photos</li>
                <li>Detailed ticket pricing and availability</li>
                <li>Event statistics and metrics</li>
                <li>Manager and category information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Event View Modal */}
      <EventViewModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        event={sampleEvent}
      />
    </div>
  );
};

export default EventViewDemo;
