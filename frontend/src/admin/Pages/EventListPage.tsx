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

const EventListPage: React.FC = () => {
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

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

  const events = (evtResp as any)?.data?.events ?? [];
  const evtPages = (evtResp as any)?.data?.pagination?.pages ?? 1;

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
                        <span className={`px-3 py-1 rounded-full text-sm ${req.status === "approved" ? "bg-green-100 text-green-700" : req.status === "rejected" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"}`}>{req.status}</span>
                      </td>
                      <td className="px-4 py-2">
                        {req.status === "pending" ? (
                          <>
                            <button
                              className="px-3 py-1 bg-green-500 text-white rounded mr-2"
                              disabled={approveMutation.isPending}
                              onClick={() => approveMutation.mutate(req._id)}
                            >
                              Accept
                            </button>
                            <button
                              className="px-3 py-1 bg-red-500 text-white rounded"
                              disabled={rejectMutation.isPending}
                              onClick={() => rejectMutation.mutate(req._id)}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-red-500 hover:underline cursor-pointer">View</span>
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

        {/* Approved Events */}
        <div className="bg-white rounded-xl shadow p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">Approved Events</h2>
          {loadingEvt ? (
            <div className="text-center py-8">Loading events...</div>
          ) : errorEvt ? (
            <div className="text-center text-red-500 py-8">Failed to fetch events</div>
          ) : events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No approved events found.</div>
          ) : (
            <>
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2">Event Title</th>
                    <th className="px-4 py-2">Manager</th>
                    <th className="px-4 py-2">Category</th>
                    <th className="px-4 py-2">Date/Time</th>
                    <th className="px-4 py-2">Venue</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event: any) => (
                    <tr key={event._id} className="border-b bg-green-50">
                      <td className="px-4 py-2">{event.title}</td>
                      <td className="px-4 py-2">{event.eventManager?.name || "-"}</td>
                      <td className="px-4 py-2">{event.category?.name || "-"}</td>
                      <td className="px-4 py-2">{event.startDate ? new Date(event.startDate).toLocaleString() : "-"} - {event.endDate ? new Date(event.endDate).toLocaleString() : "-"}</td>
                      <td className="px-4 py-2">{typeof event.venue === "object" ? event.venue.name || JSON.stringify(event.venue) : event.venue}</td>
                      <td className="px-4 py-2">
                        <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">approved</span>
                      </td>
                      <td className="px-4 py-2 text-blue-500 hover:underline cursor-pointer">View</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Events Pagination */}
              <div className="flex justify-between items-center p-4">
                <span className="text-sm text-gray-500">Page {evtPage} of {evtPages}</span>
                <div className="space-x-2">
                  <button className="px-3 py-1 border rounded" disabled={evtPage<=1} onClick={() => setEvtPage(p=>Math.max(1,p-1))}>Previous</button>
                  <button className="px-3 py-1 border rounded" disabled={evtPage>=evtPages} onClick={() => setEvtPage(p=>p+1)}>Next</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <CreateEventModal isOpen={isEventModalOpen} onClose={() => setEventModalOpen(false)} />
      <CreateCategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} />
    </div>
  );
};

export default EventListPage;
