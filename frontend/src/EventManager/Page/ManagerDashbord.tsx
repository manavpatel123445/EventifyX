import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Ticket, TrendingUp, ChevronLeft, ChevronRight, IndianRupee } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
} from "recharts";
import ManagerSideBar from "../components/ManagerSidebar";
import { getMyManagedEvents, type Event } from "../../services/eventService";
import { capitalizeFirstLetter } from "../../utils/roles";

const ManagerDashboard: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ["manager-managed-events", { page, limit }],
    queryFn: async () => {
      const res = await getMyManagedEvents({ limit, page });
      const payload = res?.data ?? res; // support either axios {data} or raw
      return {
        events: Array.isArray(payload?.events) ? payload.events : Array.isArray(payload) ? payload : [],
        stats: payload?.stats ?? null,
        pagination: payload?.pagination ?? { total: 0, pages: 1 },
      } as { events: Event[]; stats: any; pagination: { total: number; pages: number } };
    },
  });

  const events: Event[] = Array.isArray(response?.events) ? response!.events : [];
  const statsFromApi = response?.stats;
  const totalPages = response?.pagination?.pages ?? 1;

  const { totalEvents, ticketsSold, revenue, upcomingEvents } = useMemo(() => {
    if (statsFromApi) {
      return {
        totalEvents: statsFromApi.totalEvents ?? 0,
        ticketsSold: statsFromApi.totalBookings ?? 0,
        revenue: statsFromApi.totalRevenue ?? 0,
        upcomingEvents: statsFromApi.upcomingEvents ?? 0,
      };
    }

    const now = new Date();
    let total = events.length;
    let sold = 0;
    let rev = 0;
    let upcoming = 0;

    events.forEach((ev) => {
      if (typeof ev.totalBookings === "number") {
        sold += ev.totalBookings;
      } else if (Array.isArray(ev.ticketPricing)) {
        sold += ev.ticketPricing.reduce((acc, t) => acc + (t.sold ?? 0), 0);
      }

      if (typeof ev.totalRevenue === "number") {
        rev += ev.totalRevenue;
      } else if (Array.isArray(ev.ticketPricing)) {
        rev += ev.ticketPricing.reduce((acc, t) => acc + (t.price * (t.sold ?? 0)), 0);
      }

      const start = new Date(ev.startDate);
      if (start > now && ev.status !== "cancelled") {
        upcoming += 1;
      }
    });

    return { totalEvents: total, ticketsSold: sold, revenue: rev, upcomingEvents: upcoming };
  }, [events, statsFromApi]);

  // Basic charts built from events data
  const ticketsSoldData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    events.forEach((ev) => {
      const d = new Date(ev.startDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const sold = typeof ev.totalBookings === "number"
        ? ev.totalBookings
        : ev.ticketPricing?.reduce((a, t) => a + (t.sold ?? 0), 0) ?? 0;
      byMonth[key] = (byMonth[key] ?? 0) + sold;
    });
    const ordered = Object.entries(byMonth)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, value]) => ({ week: key, tickets: value }));
    return ordered.slice(-6);
  }, [events]);

  const revenueBreakdownData = useMemo(() => {
    return events.slice(0, 6).map((ev) => {
      const rev = typeof ev.totalRevenue == "number"
        ? ev.totalRevenue
        : ev.ticketPricing?.reduce((a, t) => a + t.price * (t.sold ?? 0), 0) ?? 0;
      return { event: ev.title, revenue: rev };
    });
  }, [events]);

  return (
    <div className="flex bg-gray-50 dark:bg-[#1B1D2A] min-h-screen">
      {/* Sidebar */}
      <ManagerSideBar />

      {/* Main Dashboard */}
      <div className="flex-1 p-8 space-y-8">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Manager Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              label: "Total Events",
              value: isLoading ? "…" : totalEvents,
              icon: <Calendar className="w-8 h-8 text-red-500 dark:text-red-400" />,
            },
            {
              label: "Tickets Sold",
              value: isLoading ? "…" : ticketsSold,
              icon: <Ticket className="w-8 h-8 text-blue-500 dark:text-blue-400" />,
            },
            {
              label: "Total Revenue",
              value: isLoading ? "…" : `₹${revenue.toLocaleString()}`,
              icon: <IndianRupee className="w-8 h-8 text-green-500 dark:text-green-400" />,
            },
            {
              label: "Upcoming Events",
              value: isLoading ? "…" : upcomingEvents,
              icon: <TrendingUp className="w-8 h-8 text-purple-500 dark:text-purple-400" />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white dark:bg-[#212530] shadow-md rounded-2xl p-6 flex items-center space-x-4"
            >
              {item.icon}
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{item.label}</p>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                  {item.value}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Content: My Events on top, Charts below */}
        <div className="space-y-6">
          {/* Events Table */}
          <div className="bg-white dark:bg-[#212530] shadow-md rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              My Events
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700/50">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tickets Sold</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#212530] divide-y divide-gray-200 dark:divide-gray-700/50">
                  {events.map((event, _i) => {
                    const sold = typeof event.totalBookings === "number"
                      ? event.totalBookings
                      : event.ticketPricing?.reduce((a, t) => a + (t.sold ?? 0), 0) ?? 0;
                    const rev = typeof event.totalRevenue === "number"
                      ? event.totalRevenue
                      : event.ticketPricing?.reduce((a, t) => a + t.price * (t.sold ?? 0), 0) ?? 0;
                    return (
                      <tr key={event._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{capitalizeFirstLetter(event.title)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{event.category?.name ? capitalizeFirstLetter(event.category.name) : "-"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {event.startDate ? (
                            <div className="flex flex-col space-y-1">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(`2000-01-01T${event.startTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })} - {new Date(`2000-01-01T${event.endTime || '00:00'}`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </div>
                            </div>
                          ) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{event.venue?.city ?? ""}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{sold.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">₹{rev.toLocaleString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {events.length === 0 && (
                    <tr>
                      <td className="px-6 py-4 text-center text-gray-500 dark:text-gray-400" colSpan={7}>
                        {isLoading ? "Loading events..." : "No events yet"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 px-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </button>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages}
                  </div>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    className="flex items-center px-3 py-1 rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Charts Row (below table) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tickets Sold Chart */}
            <div className="bg-white dark:bg-[#212530] shadow-md rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Tickets Sold Over Time
                </h2>
                <span className="text-green-600 text-sm font-semibold">
                  {ticketsSoldData.length > 1 ? "+" : ""}
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                Last periods
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={ticketsSoldData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="week" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="tickets"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "#8B5CF6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white dark:bg-[#212530] shadow-md rounded-2xl p-6">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                  Revenue Breakdown
                </h2>
                <span className="text-green-600 text-sm font-semibold">
                  {revenueBreakdownData.length} events
                </span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-xs mb-4">
                Recent events
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={revenueBreakdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="event" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#F43F5E" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;