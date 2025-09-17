import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyEventRequests, type EventRequest } from "../services/eventService";
import { getRequestsForManagedEvents } from "../services/eventService";
import Navbar from "../components/Navbar";
import { Clock, CheckCircle, XCircle, Calendar, MapPin, DollarSign, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

const MyEventRequests: React.FC = () => {
  const [viewManaged, setViewManaged] = React.useState(false);
  const {
    data: requestsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [viewManaged ? "managed-event-requests" : "my-event-requests"],
    queryFn: () => viewManaged ? getRequestsForManagedEvents() : getMyEventRequests(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleAccept = async (requestId: string) => {
    try {
      await import('../services/eventService').then(({ approveEventRequest }) => approveEventRequest(requestId));
      toast.success('Event request approved!');
      refetch();
    } catch (err) {
      toast.error('Failed to approve event request');
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading your event requests...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Failed to load event requests</p>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  const requests = requestsData?.data?.requests || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-sm font-medium";
    switch (status) {
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Event Requests</h1>
              <p className="text-gray-600 mt-2">
                Track the status of your submitted event requests
              </p>
            </div>
            <Link
              to="/create-event"
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
            >
              Create New Event
            </Link>
            <button
              className={`px-6 py-3 rounded-lg font-medium transition ${viewManaged ? "bg-gray-200 text-gray-700" : "bg-green-500 text-white hover:bg-green-600"}`}
              onClick={() => setViewManaged(!viewManaged)}
            >
              {viewManaged ? "View My Requests" : "View Managed Event Requests"}
            </button>
          </div>

          {requests.length === 0 ? (
            // Empty State
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Event Requests Yet
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't submitted any event requests. Create your first event to get started!
              </p>
              <Link
                to="/create-event"
                className="inline-flex items-center px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Create Event Request
              </Link>
            </div>
          ) : (
            // Event Requests List
            <div className="space-y-6">
              {requests.map((request: EventRequest) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {request.title}
                          </h3>
                          <span className={getStatusBadge(request.status)}>
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </span>
                        </div>
                        <p className="text-gray-600 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                      <div className="ml-4 flex items-center gap-2">
                        {getStatusIcon(request.status)}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {request.startDate ? new Date(request.startDate).toLocaleDateString() : "TBD"}
                          {request.startTime ? ` at ${request.startTime}` : ""}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          {request.venue?.name || "Venue"}, {request.venue?.city || "City"}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2" />
                        <span className="text-sm">
                          ${request.ticketPricing?.[0]?.price ?? 0} - {request.venue?.state || ""}
                        </span>
                      </div>
                    </div>

                    {/* Category & Submission Info */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <span className="bg-gray-100 px-2 py-1 rounded">
                          {request.category?.name || "General"}
                        </span>
                        <span>
                          Submitted {new Date(request.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {request.reviewedAt && (
                        <span>
                          Reviewed {new Date(request.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Admin Notes */}
                    {request.adminNotes && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          Admin Notes:
                        </h4>
                        <p className="text-sm text-gray-700">{request.adminNotes}</p>
                      </div>
                    )}

                    {/* Images Preview */}
                    {request.images && request.images.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {request.images.slice(0, 4).map((image, index) => (
                          <img
                            key={index}
                            src={image}
                            alt={`Event ${index + 1}`}
                            className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                          />
                        ))}
                        {request.images.length > 4 && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                            +{request.images.length - 4}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Status-specific Actions */}
                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="text-sm text-gray-500">
                        {request.status === 'pending' && (
                          <button
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-medium"
                            onClick={() => handleAccept(request._id)}
                          >
                            Accept
                          </button>
                        )}
                        {request.status === 'approved' && request.approvedEvent && (
                          <Link
                            to={`/events/${(typeof request.approvedEvent === 'string' ? request.approvedEvent : (request as any).approvedEvent?._id) || ''}`}
                            className="flex items-center text-green-600 hover:text-green-700"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Live Event
                          </Link>
                        )}
                        {request.status === 'rejected' && (
                          <span className="flex items-center text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            Request was rejected
                          </span>
                        )}
                      </div>

                      {request.status === 'approved' && request.approvedEvent && (
                        <Link
                          to={`/manager/events/${(typeof request.approvedEvent === 'string' ? request.approvedEvent : (request as any).approvedEvent?._id) || ''}`}
                          className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition text-sm font-medium"
                        >
                          Manage Event
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination (if needed) */}
          {requestsData?.data?.pagination && requestsData.data.pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                {Array.from({ length: requestsData.data.pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={`px-4 py-2 rounded-lg ${
                      page === requestsData.data.pagination.current
                        ? 'bg-red-500 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      // Handle pagination - you can implement this
                      toast(`Pagination not implemented yet for page ${page}`);
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MyEventRequests;
