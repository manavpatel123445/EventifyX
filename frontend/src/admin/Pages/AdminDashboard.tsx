/* eslint-disable @typescript-eslint/no-explicit-any */
 
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Calendar, ClipboardList, DollarSign } from "lucide-react";

import SideBar from "../components/SideBar";
import { getDashboardStats } from "../../services/adminService";
import { getAllEvents } from "../../services/eventService";
import { getAllRequests } from "../../services/eventManagerRequestService";

const AdminDashboard: React.FC = () => {
  const { data: statsResp, isLoading: loadingStats } = useQuery({ queryKey: ["dashboardStats"], queryFn: getDashboardStats });
  const { data: eventsResp, isLoading: loadingEvents } = useQuery({ queryKey: ["events", { limit: 5 }], queryFn: () => getAllEvents({ limit: 5 }) });
  const { data: pendingResp, isLoading: loadingPending } = useQuery({ queryKey: ["pendingRequests", { status: "pending", limit: 5 }], queryFn: () => getAllRequests({ status: "pending", limit: 5 }) });

  const stats = (statsResp as any)?.data ?? statsResp; // support both {data:{}} and flat
  const events = (eventsResp as any)?.data?.events ?? [];
  const pending = (pendingResp as any)?.data ?? [];

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
                    <span className={`px-3 py-1 text-sm rounded-full ${event.status === "upcoming" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button className="text-blue-500 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pending Manager Requests */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Pending Manager Requests</h2>
          <div className="space-y-4">
            {loadingPending && (
              <div className="text-center text-gray-500">Loading requests…</div>
            )}
            {!loadingPending && pending.length === 0 && (
              <div className="text-center text-gray-500">No pending requests</div>
            )}
            {!loadingPending && pending.map((req: any) => (
              <div key={req._id} className="flex justify-between items-center border p-3 rounded-lg">
                <div>
                  <p className="font-medium">{req.user?.name}</p>
                  <p className="text-sm text-gray-500">{req.user?.email}</p>
                </div>
                <div className="space-x-3">
                  <button className="px-4 py-1 bg-green-500 text-white rounded-lg">Approve</button>
                  <button className="px-4 py-1 bg-red-500 text-white rounded-lg">Reject</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
