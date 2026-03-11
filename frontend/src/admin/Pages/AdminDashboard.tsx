/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, ClipboardList, ChevronLeft, ChevronRight, IndianRupee } from "lucide-react";

import SideBar from "../components/SideBar";
import { getDashboardStats } from "../../services/adminService";
import { getAllEvents } from "../../services/eventService";
import { getAllRequests } from "../../services/eventManagerRequestService";
import { EventViewModal } from "../../components";
import { capitalizeFirstLetter } from "../../utils/roles";

const AdminDashboard: React.FC = () => {
 
  const [viewEvent, setViewEvent] = useState<Event | null>(null);
  
  // Events pagination
  const [eventsPage, setEventsPage] = useState(1);
  const eventsLimit = 10;
  
  // Manager requests pagination
  const [requestsPage] = useState(1);
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
  
  useQuery({
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
  


  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#1B1D2A]">
      <SideBar />
      <div className="flex-1 p-4 pt-20 md:p-6 md:pt-6 space-y-8 overflow-x-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-[#212530] shadow rounded-xl p-6 flex items-center space-x-4">
            <Users className="text-red-500 dark:text-red-400 w-8 h-8" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Users</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loadingStats ? "…" : stats?.users?.total ?? 0}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-[#212530] shadow rounded-xl p-6 flex items-center space-x-4">
            <Calendar className="text-green-500 dark:text-green-400 w-8 h-8" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Total Events</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loadingStats ? "…" : stats?.events?.total ?? 0}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-[#212530] shadow rounded-xl p-6 flex items-center space-x-4">
            <ClipboardList className="text-blue-500 dark:text-blue-400 w-8 h-8" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Event Requests</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loadingStats ? "…" : stats?.requests?.pending ?? 0}</h3>
            </div>
          </div>
          <div className="bg-white dark:bg-[#212530] shadow rounded-xl p-6 flex items-center space-x-4">
            <IndianRupee className="text-yellow-500 dark:text-yellow-400 w-8 h-8" />
            <div>
              <p className="text-gray-500 dark:text-gray-400">Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{loadingStats ? "…" : `₹${(stats?.revenue?.totalRevenue ?? 0).toLocaleString()}`}</h3>
            </div>
          </div>
        </div>

        {/* Event Management */}
        <div className="bg-white dark:bg-[#212530] rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Event Management</h2>
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Event Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingEvents && (
                <tr><td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400" colSpan={5}>Loading events…</td></tr>
              )}
              {!loadingEvents && events.length === 0 && (
                <tr><td className="px-4 py-3 text-center text-gray-600 dark:text-gray-400" colSpan={5}>No events found</td></tr>
              )}
              {!loadingEvents && events.map((event: any) => (
                <tr key={event._id} className="border-t border-gray-100 dark:border-gray-700/50">
                  <td className="px-4 py-3 text-gray-900 dark:text-white">{event.title ? capitalizeFirstLetter(event.title) : 'Untitled Event'}</td>
                  <td className="px-4 py-3">
                    {event.startDate ? (
                      <div className="flex flex-col space-y-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {(() => {
                            try {
                              return new Date(event.startDate).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              });
                            } catch {
                              return 'Invalid Date';
                            }
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {(() => {
                            try {
                              const startTime = event.startTime || '00:00';
                              const endTime = event.endTime || '23:59';
                              return `${startTime} - ${endTime}`;
                            } catch {
                              return '-';
                            }
                          })()}
                        </div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      try {
                        if (event.venue && typeof event.venue === 'object' && event.venue.city) {
                          return event.venue.city;
                        } else if (event.venue && typeof event.venue === 'string') {
                          return event.venue;
                        } else if (event.location) {
                          return event.location;
                        }
                        return '-';
                      } catch {
                        return '-';
                      }
                    })()}
                  </td>
                  <td className="px-4 py-3">
                    {(() => {
                      try {
                        const now = new Date();
                        const endDate = new Date(event.endDate);
                        type EventStatus = 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
                        let currentStatus = event.status as EventStatus;

                        // Check if dates are valid - improved logic
                        if (!event.endDate || isNaN(endDate.getTime())) {
                          // If no end date or invalid date, use original status
                          const fallbackColorClass = {
                            upcoming: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                            ongoing: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                            completed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                            cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                            active: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                            pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                            approved: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                            rejected: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                          }[currentStatus?.toLowerCase()] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';

                          return (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${fallbackColorClass}`}>
                              {currentStatus ? currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1) : 'Unknown'}
                            </span>
                          );
                        }

                        // Calculate status based on dates
                        if (event.status !== 'Cancelled' && event.status !== 'cancelled' && endDate < now) {
                          currentStatus = 'Completed';
                        }

                        // More robust status color mapping with case-insensitive keys
                        const statusColorClass = {
                          upcoming: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          ongoing: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                          completed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                          cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                          active: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                          approved: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          rejected: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                          Upcoming: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          Ongoing: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                          Completed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                          Cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                        }[currentStatus] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';

                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColorClass}`}>
                            {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                          </span>
                        );
                      } catch (error) {
                        // Improved error handling with proper status extraction
                        const errorStatus = event.status || event.statusText || 'Unknown';
                        type StatusKey = 'upcoming' | 'ongoing' | 'completed' | 'cancelled' | 'active' | 'pending' | 'approved' | 'rejected';
                        const statusKey = errorStatus?.toLowerCase() as StatusKey;
                        const errorColorClass = {
                          upcoming: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          ongoing: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                          completed: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
                          cancelled: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                          active: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          pending: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400',
                          approved: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400',
                          rejected: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
                        }[statusKey] || 'bg-gray-100 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300';

                        return (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${errorColorClass}`}>
                            {errorStatus.charAt(0).toUpperCase() + errorStatus.slice(1)}
                          </span>
                        );
                      }
                    })()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setViewEvent(event)}
                      className="px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
                className="flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Page {eventsPage} of {totalEventsPages}
              </div>
              
              <button
                onClick={() => setEventsPage(p => Math.min(totalEventsPages, p + 1))}
                disabled={eventsPage >= totalEventsPages}
                className="flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>

        {/* Pending Manager Requests */}
      
          
          {/* Pagination */}
        
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
