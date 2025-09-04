import React, { useState } from "react";
import type { Event } from "../services/eventService";
import EventViewModal from "./EventViewModal";

interface EventQuickViewProps {
  event: Event;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const EventQuickView: React.FC<EventQuickViewProps> = ({ 
  event, 
  showActions = false, 
  onEdit, 
  onDelete 
}) => {
  const [showFullView, setShowFullView] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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
    <>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-1 line-clamp-2">
              {event.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                {getStatusText(event.status)}
              </span>
              <span>•</span>
              <span>{event.category.name}</span>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2 ml-3">
            <button
              onClick={() => setShowFullView(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details
            </button>
            {showActions && (
              <>
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="text-green-600 hover:text-green-800 text-sm font-medium"
                  >
                    Edit
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Event Images Preview */}
        {event.images && event.images.length > 0 && (
          <div className="mb-3">
            <div className="flex gap-2">
              {event.images.slice(0, 3).map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`Event preview ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              ))}
              {event.images.length > 3 && (
                <div className="w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center text-xs text-gray-500">
                  +{event.images.length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Key Details */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Date & Time</p>
            <p className="text-sm font-medium text-gray-800">
              {formatDate(event.startDate)} at {event.startTime}
            </p>
            <p className="text-xs text-gray-600">
              to {formatDate(event.endDate)} at {event.endTime}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Venue</p>
            <p className="text-sm font-medium text-gray-800">{event.venue.name}</p>
            <p className="text-xs text-gray-600">{event.venue.city}, {event.venue.state}</p>
          </div>
        </div>

        {/* Ticket Summary */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Tickets</p>
          <div className="flex gap-3">
            {event.ticketPricing.map((ticket, index) => (
              <div key={index} className="text-center">
                <p className="text-sm font-medium text-gray-800 capitalize">{ticket.type}</p>
                <p className="text-lg font-bold text-green-600">${ticket.price}</p>
                <p className="text-xs text-gray-600">
                  {ticket.quantity - ticket.sold} available
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics Row */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex gap-4 text-sm">
            <span className="text-gray-600">
              <span className="font-medium text-blue-600">{event.totalBookings}</span> bookings
            </span>
            <span className="text-gray-600">
              <span className="font-medium text-green-600">${event.totalRevenue}</span> revenue
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Manager: {event.eventManager.name}
          </div>
        </div>
      </div>

      {/* Full View Modal */}
      <EventViewModal
        isOpen={showFullView}
        onClose={() => setShowFullView(false)}
        event={event}
      />
    </>
  );
};

export default EventQuickView;
