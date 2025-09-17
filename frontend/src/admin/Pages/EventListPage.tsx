/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import SideBar from "../components/SideBar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getAllEvents, 
  getAllEventRequests, 
  approveEventRequest, 
  rejectEventRequest
} from "../../services/eventService";
import CreateEventModal from '../../components/CreateEventModal';
import CreateCategoryModal from '../../components/CreateCategoryModal';
import { EventViewModal } from '../../components';

const EventListPage: React.FC = () => {
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [viewEvent, setViewEvent] = useState<Event | null>(null)
 

  // Pagination state (separate for requests and events)
  const [reqPage, setReqPage] = useState(1);
  const [evtPage, setEvtPage] = useState(1);
  const limit = 10;

  const queryClient = useQueryClient();

  // Queries
  const { data: reqResp, isLoading: loadingReq, error: errorReq } = useQuery({
    queryKey: ["admin-event-requests", { page: reqPage, limit }],
    queryFn: () => getAllEventRequests({ page: reqPage, limit }),
  });

  const { data: evtResp, isLoading: loadingEvt, error: errorEvt } = useQuery({
    queryKey: ["admin-events", { page: evtPage, limit }],
    queryFn: () => getAllEvents({ status: "approved", page: evtPage, limit }),
  });

  const requests = (reqResp as any)?.data?.requests ?? [];
  const reqPages = (reqResp as any)?.data?.pagination?.pages ?? 1;

  // Debug the API response
  console.log('API Response:', evtResp);
  
  // Handle the events data from the API response
  const events = Array.isArray(evtResp?.data) ? evtResp.data : (evtResp?.data?.events || []);
  const evtPages = evtResp?.data?.pagination?.pages || 1;
  
  console.log('Processed events:', events);
  console.log('Total pages:', evtPages);

  // Mutations
  const approveMutation = useMutation({
    mutationFn: (id: string) => approveEventRequest(id, ""),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-requests"] });
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectEventRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-event-requests"] });
    },
  });

  return (
    <div className="flex">
      <SideBar />
      <div className="flex-1 p-8 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-bold mb-6">Event Requests</h1>
        <div className="flex gap-4 mb-6">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded"
            onClick={() => setEventModalOpen(true)}
          >
            + Create Event
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => setCategoryModalOpen(true)}
          >
            + Create Category
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          {loadingReq ? (
            <div className="text-center py-8">Loading requests...</div>
          ) : errorReq ? (
            <div className="text-center text-red-500 py-8">Failed to fetch requests</div>
          ) : requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No event requests found.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Event Title</th>
                    <th className="px-4 py-2">Requester</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Date/Time</th>
                    <th className="px-4 py-2">Venue</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req: any) => (
                    <tr key={req._id} className="border-b">
                      <td className="px-4 py-2">{req.title}</td>
                      <td className="px-4 py-2">{req.requestedBy?.name || "-"}</td>
                      <td className="px-4 py-2">{req.category?.name || "-"}</td>
                      <td className="py-2">{new Date(req.startDate).toLocaleDateString()}-{new Date(req.endDate).toLocaleDateString()}<br/>{req.startTime} - {req.endTime}</td>
                      <td className="px-4 py-2">{typeof req.venue === "object" ? req.venue.name || JSON.stringify(req.venue) : req.venue}</td>
                      <td className="px-4 py-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${req.status === "approved" ? "bg-green-100 text-green-700" : req.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-2 space-x-2">
                        <button
                          className="text-blue-500 hover:underline cursor-pointer"
                          onClick={() => setViewEvent(req)}
                        >
                          View
                        </button>
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(req._id)}
                              disabled={approveMutation.isPending}
                              className="text-green-600 hover:underline cursor-pointer ml-2"
                            >
                              {approveMutation.isPending ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(req._id)}
                              disabled={rejectMutation.isPending}
                              className="text-red-600 hover:underline cursor-pointer ml-2"
                            >
                              {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Requests Pagination */}
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-500">Page {reqPage} of {reqPages}</span>
                <div className="space-x-2">
                  <button className="px-3 py-1 border rounded" disabled={reqPage<=1} onClick={() => setReqPage(p=>Math.max(1,p-1))}>Previous</button>
                  <button className="px-3 py-1 border rounded" disabled={reqPage>=reqPages} onClick={() => setReqPage(p=>p+1)}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Revenue and Sales Summary */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Revenue & Sales Summary</h2>
          {loadingEvt ? (
            <div className="text-center py-8">Loading sales data...</div>
          ) : errorEvt ? (
            <div className="text-center text-red-500 py-8">Failed to fetch sales data</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No sales data available.</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
                  <p className="text-2xl font-bold">
                    ${events.reduce((total: number, event: any) => {
                      return total + (event.ticketPricing?.reduce((sum: number, ticket: any) => {
                        return sum + ((ticket.sold || 0) * (ticket.price || 0));
                      }, 0) || 0);
                    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Total Tickets Sold</h3>
                  <p className="text-2xl font-bold">
                    {events.reduce((total: number, event: any) => {
                      return total + (event.ticketPricing?.reduce((sum: number, ticket: any) => {
                        return sum + (ticket.sold || 0);
                      }, 0) || 0);
                    }, 0).toLocaleString()}
                  </p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-gray-600 text-sm font-medium">Total Events</h3>
                  <p className="text-2xl font-bold">{events.length}</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {events.length > 0 ? (
                      events.map((event: any) => {
                        // Safely calculate ticket metrics
                        const ticketMetrics = event.ticketPricing?.reduce((acc: any, ticket: any) => {
                          const sold = Number(ticket.sold) || 0;
                          const price = Number(ticket.price) || 0;
                          const quantity = Number(ticket.quantity) || 0;
                          
                          return {
                            sold: acc.sold + sold,
                            revenue: acc.revenue + (sold * price),
                            capacity: acc.capacity + quantity
                          };
                        }, { sold: 0, revenue: 0, capacity: 0 });

                        return (
                          <tr key={event._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {event.title || 'Untitled Event'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {event.category?.name || event.category || 'No category'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {ticketMetrics.sold.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {ticketMetrics.capacity.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                ${ticketMetrics.revenue.toLocaleString('en-US', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button 
                                onClick={() => setViewEvent(event)}
                                className="text-blue-600 hover:text-blue-900 hover:underline"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                          No events found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-500">Page {evtPage} of {evtPages}</span>
                <div className="space-x-2">
                  <button 
                    className="px-3 py-1 border rounded disabled:opacity-50" 
                    disabled={evtPage <= 1} 
                    onClick={() => setEvtPage(p => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button 
                    className="px-3 py-1 border rounded disabled:opacity-50" 
                    disabled={evtPage >= evtPages} 
                    onClick={() => setEvtPage(p => p + 1)}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <CreateEventModal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} />
      <CreateCategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
      
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

export default EventListPage;
