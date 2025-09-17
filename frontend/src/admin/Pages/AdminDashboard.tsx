/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, ClipboardList, DollarSign, Trash2, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import SideBar from "../components/SideBar";
import { getDashboardStats, cleanupCompletedEvents } from "../../services/adminService";
import { getAllEvents } from "../../services/eventService";
import { getAllRequests } from "../../services/eventManagerRequestService";
import { EventViewModal } from "../../components";

const AdminDashboard: React.FC = () => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  
  // Events pagination
  const [eventsPage, setEventsPage] = useState(1);
  const eventsLimit = 10;
  
  // Manager requests pagination
  const [requestsPage, setRequestsPage] = useState(1);
  const requestsLimit = 5;

  const { data: statsResp, isLoading: loadingStats } = useQuery({ queryKey: ["dashboardStats"], queryFn: getDashboardStats });
  const { data: eventsResp, isLoading: loadingEvents } = useQuery({ 
    queryKey: ["events", { page: eventsPage, limit: eventsLimit }], 
    queryFn: () => getAllEvents({ 
      page: eventsPage, 
      limit: eventsLimit,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }) 
  });
  
  const { data: pendingResp, isLoading: loadingPending } = useQuery({ 
    queryKey: ["pendingRequests", { status: "pending", page: requestsPage, limit: requestsLimit }], 
    queryFn: () => getAllRequests({ 
      status: "pending", 
      page: requestsPage, 
      limit: requestsLimit 
    }) 
  });

  const stats = (statsResp as any)?.data ?? statsResp; // support both {data:{}} and flat
  const events = (eventsResp as any)?.data?.events ?? [];
  const totalEvents = (eventsResp as any)?.data?.pagination?.total ?? 0;
  const totalEventsPages = Math.ceil(totalEvents / eventsLimit);
  
  const pending = (pendingResp as any)?.data?.requests ?? [];
  const totalRequests = (pendingResp as any)?.data?.pagination?.total ?? 0;
  const totalRequestsPages = Math.ceil(totalRequests / requestsLimit);

  const handleCleanupCompletedEvents = async () => {
    if (isCleaningUp) return;

    const confirmed = window.confirm(
      "This will soft delete all completed events older than 30 days. Are you sure you want to continue?"
    );

    if (!confirmed) return;

    setIsCleaningUp(true);

    try {
      const response = await cleanupCompletedEvents();

      if (response.success) {
        toast.success(`Successfully cleaned up ${response.deletedCount} completed events`);
      } else {
        toast.error("Failed to cleanup completed events");
      }
    } catch (error: any) {
      console.error("Cleanup error:", error);
      toast.error(error.response?.data?.message || "Failed to cleanup completed events");
    } finally {
      setIsCleaningUp(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <SideBar />
      <div className="flex-1 p-6 space-y-8 overflow-x-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-xl p-6 flex items-center space-x-4">
            <Users className="text-red-500 w-8 h-8" />
            <div>
              <p className="text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">{loadingStats ? "…" : stats?.users?.total ?? 0}</h3>
            </div>
          </div>
          <div className="bg-white shadow rounded-xl p-6 flex items-center space-x-4">
            <Calendar className="text-green-500 w-8 h-8" />
            <div>
              <p className="text-gray-500">Total Events</p>
              <h3 className="text-2xl font-bold">{loadingStats ? "…" : stats?.events?.total ?? 0}</h3>
            </div>
          </div>
          <div className="bg-white shadow rounded-xl p-6 flex items-center space-x-4">
            <ClipboardList className="text-blue-500 w-8 h-8" />
            <div>
              <p className="text-gray-500">Manager Requests</p>
              <h3 className="text-2xl font-bold">{loadingStats ? "…" : stats?.requests?.pending ?? 0}</h3>
            </div>
          </div>
          <div className="bg-white shadow rounded-xl p-6 flex items-center space-x-4">
            <DollarSign className="text-yellow-500 w-8 h-8" />
            <div>
              <p className="text-gray-500">Revenue</p>
              <h3 className="text-2xl font-bold">{loadingStats ? "…" : `$${(stats?.revenue?.totalRevenue ?? 0).toLocaleString()}`}</h3>
            </div>
          </div>
        </div>

        {/* Event Management */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Event Management</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-3">Event Name</th>
                <th className="p-3">Date</th>
                <th className="p-3">Location</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents && (
                <tr><td className="p-3 text-center" colSpan={5}>Loading events…</td></tr>
              )}
              {!loadingEvents && events.length === 0 && (
                <tr><td className="p-3 text-center" colSpan={5}>No events found</td></tr>
              )}
              {!loadingEvents && events.map((event: any) => (
                <tr key={event._id} className="border-t">
                  <td className="p-3">{event.title}</td>
                  <td className="p-3">{event.startDate ? new Date(event.startDate).toLocaleDateString() : '-'}</td>
                  <td className="p-3">{event.venue?.city}</td>
                  <td className="p-3">
                    {(() => {
                      const now = new Date();
                      const endDate = new Date(event.endDate);
                      type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
                      let currentStatus = event.status as EventStatus;

                      if (event.status !== 'Cancelled' && endDate < now) {
                        currentStatus = 'Completed';
                      }

                      const statusColorClass = {
                        Upcoming: 'bg-green-100 text-green-700',
                        Ongoing: 'bg-blue-100 text-blue-700',
                        Completed: 'bg-gray-100 text-gray-700',
                        Cancelled: 'bg-red-100 text-red-700',
                      }[currentStatus] || 'bg-gray-100 text-gray-700';

                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                          {currentStatus}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => setViewEvent(event)}
                      className="px-3 py-1 rounded border text-gray-700 hover:bg-gray-50"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Pagination */}
          {totalEventsPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <button
                onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                disabled={eventsPage === 1}
                className="flex items-center px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>
              
              <div className="text-sm text-gray-600">
                Page {eventsPage} of {totalEventsPages}
              </div>
              
              <button
                onClick={() => setEventsPage(p => Math.min(totalEventsPages, p + 1))}
                disabled={eventsPage >= totalEventsPages}
                className="flex items-center px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Pending Manager Requests */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Manager Requests</h2>
            <div className="text-sm text-gray-500">
              {!loadingPending && `Showing ${pending.length} of ${totalRequests} requests`}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested On</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loadingPending ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Loading requests...
                    </td>
                  </tr>
                ) : pending.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      No pending manager requests
                    </td>
                  </tr>
                ) : (
                  pending.map((req: any) => (
                    <tr key={req._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-medium text-gray-900">
                            {req.user?.name || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{req.user?.email || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => console.log('Approve', req._id)}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => console.log('Reject', req._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalRequestsPages > 1 && (
            <div className="flex items-center justify-between mt-4 px-2">
              <button
                onClick={() => setRequestsPage(p => Math.max(1, p - 1))}
                disabled={requestsPage === 1}
                className="flex items-center px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>
              
              <div className="text-sm text-gray-600">
                Page {requestsPage} of {totalRequestsPages}
              </div>
              
              <button
                onClick={() => setRequestsPage(p => Math.min(totalRequestsPages, p + 1))}
                disabled={requestsPage >= totalRequestsPages}
                className="flex items-center px-3 py-1 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* System Maintenance */}
        
      </div>
      {viewEvent && (
        <EventViewModal
          isOpen={!!viewEvent}
          onClose={() => setViewEvent(null)}
          event={viewEvent as any}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
