import React from "react";
import type { Event } from "../services/eventService";

interface EventViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

const EventViewModal: React.FC<EventViewModalProps> = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ✕
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">{event.title}</h2>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
              {getStatusText(event.status)}
            </span>
            <span>•</span>
            <span>Created: {formatDate(event.createdAt)}</span>
            {event.updatedAt !== event.createdAt && (
              <>
                <span>•</span>
                <span>Updated: {formatDate(event.updatedAt)}</span>
              </>
            )}
          </div>
        </div>

        {/* Event Images */}
        {event.images && event.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Event Images</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {event.images.map((image, index) => (
                <div key={index} className="relative">
                  <img 
                    src={image} 
                    alt={`Event image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Description</h3>
              <p className="text-gray-600 leading-relaxed">{event.description}</p>
            </div>

            {/* Category */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Category</h3>
              <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {event.category.name}
              </span>
            </div>

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-700">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Event Manager */}
            <div>
              <h3 className="text-lg font-semibold mb-2 text-gray-700">Event Manager</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">{event.eventManager.name}</p>
                <p className="text-sm text-gray-600">{event.eventManager.email}</p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Date & Time */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Date & Time</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">Start</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(event.startDate)} at {formatTime(event.startTime)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">End</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(event.endDate)} at {formatTime(event.endTime)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Venue */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Venue</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium text-gray-800">{event.venue.name}</p>
                <p className="text-sm text-gray-600">{event.venue.address}</p>
                <p className="text-sm text-gray-600">{event.venue.city}, {event.venue.state}</p>
              </div>
            </div>

            {/* Ticket Pricing */}
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-700">Ticket Pricing</h3>
              <div className="space-y-2">
                {event.ticketPricing.map((ticket, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div>
                      <span className="font-medium text-gray-800 capitalize">{ticket.type}</span>
                      <p className="text-sm text-gray-600">
                        {ticket.sold} sold of {ticket.quantity} total
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">${ticket.price}</p>
                      <p className="text-sm text-gray-600">
                        {ticket.quantity - ticket.sold} available
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Event Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{event.totalBookings}</p>
              <p className="text-sm text-blue-800">Total Bookings</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">${event.totalRevenue}</p>
              <p className="text-sm text-green-800">Total Revenue</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">
                {event.ticketPricing.reduce((total, ticket) => total + ticket.quantity, 0)}
              </p>
              <p className="text-sm text-purple-800">Total Capacity</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventViewModal;
