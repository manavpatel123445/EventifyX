import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Ticket, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight, 
  IndianRupee,
  LayoutDashboard,
  ArrowUpRight,
  Plus
} from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { motion, type Variants } from "framer-motion";
import ManagerSideBar from "../components/ManagerSidebar";
import { getMyManagedEvents, type Event } from "../../services/eventService";
import { capitalizeFirstLetter } from "../../utils/roles";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    } as any
  }
};

const ManagerDashboard: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data: response, isLoading } = useQuery({
    queryKey: ["manager-managed-events", { page, limit }],
    queryFn: async () => {
      const res = await getMyManagedEvents({ limit, page });
      const payload = res?.data ?? res;
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
      if (typeof ev.totalBookings === "number") sold += ev.totalBookings;
      if (typeof ev.totalRevenue === "number") rev += ev.totalRevenue;
      const start = new Date(ev.startDate);
      if (start > now && ev.status !== "cancelled") upcoming += 1;
    });

    return { totalEvents: total, ticketsSold: sold, revenue: rev, upcomingEvents: upcoming };
  }, [events, statsFromApi]);

  const ticketsSoldData = useMemo(() => {
    const byMonth: Record<string, number> = {};
    events.forEach((ev) => {
      const d = new Date(ev.startDate);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const sold = typeof ev.totalBookings === "number" ? ev.totalBookings : 0;
      byMonth[key] = (byMonth[key] ?? 0) + sold;
    });
    return Object.entries(byMonth)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([key, value]) => ({ week: key, tickets: value }))
      .slice(-6);
  }, [events]);

  const revenueBreakdownData = useMemo(() => {
    return events.slice(0, 6).map((ev) => ({
      event: ev.title.substring(0, 10) + '...',
      revenue: typeof ev.totalRevenue == "number" ? ev.totalRevenue : 0
    }));
  }, [events]);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="bg-blob from-red-500/10 top-[-100px] left-[-100px]" />
      <div className="bg-blob from-orange-500/10 bottom-[-100px] right-[-100px]" />

      <ManagerSideBar />

      <main className="flex-1 p-8 space-y-8 overflow-x-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Manager <span className="bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">Hub</span>
              <LayoutDashboard className="w-8 h-8 text-red-600" />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Event Orchestration & Analytics</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold shadow-lg shadow-red-600/20 transition-all hover:scale-105 active:scale-95">
            <Plus className="w-5 h-5" />
            <span>Create New Event</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { label: "Managed Events", value: totalEvents, icon: <Calendar />, color: "text-red-500", bg: "bg-red-500/10" },
            { label: "Tickets Sold", value: ticketsSold, icon: <Ticket />, color: "text-blue-500", bg: "bg-blue-500/10" },
            { label: "Total Revenue", value: `₹${revenue.toLocaleString()}`, icon: <IndianRupee />, color: "text-emerald-500", bg: "bg-emerald-500/10" },
            { label: "Upcoming", value: upcomingEvents, icon: <TrendingUp />, color: "text-purple-500", bg: "bg-purple-500/10" }
          ].map((stat, i) => (
            <motion.div 
              key={i}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass dark:bg-slate-900/50 p-6 rounded-3xl premium-shadow premium-shadow-hover transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/20 dark:border-white/5`}>
                  {React.cloneElement(stat.icon as React.ReactElement<any>, { className: "w-6 h-6" })}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {isLoading ? "..." : stat.value}
                  </h3>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts & Tables Row */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Table Container */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2 glass dark:bg-slate-900/50 rounded-[2.5rem] premium-shadow overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-slate-200 dark:border-slate-800">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Active Portfolio</h2>
              <p className="text-sm font-medium text-slate-500">Live and upcoming event performance</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 dark:bg-slate-950/30 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4">Event</th>
                    <th className="px-8 py-4">Performance</th>
                    <th className="px-8 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {events.map((event) => (
                    <tr key={event._id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-950/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-red-600 transition-colors">
                          {capitalizeFirstLetter(event.title)}
                        </div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-tight mt-1">
                          {event.category?.name || 'Uncategorized'} • {event.venue?.city}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white">₹{event.totalRevenue?.toLocaleString() || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Revenue</span>
                          </div>
                          <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900 dark:text-white">{event.totalBookings || 0}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Sales</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                          {event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && !isLoading && (
                    <tr>
                      <td colSpan={3} className="px-8 py-20 text-center text-slate-400 font-bold">No managed events found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between mt-auto">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Charts Container */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            {/* Sales Chart */}
            <div className="glass dark:bg-slate-900/50 rounded-[2.5rem] p-8 premium-shadow">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Sales Pulse</h3>
                <ArrowUpRight className="w-5 h-5 text-red-500" />
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ticketsSoldData}>
                    <defs>
                      <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.1} />
                    <XAxis dataKey="week" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="tickets" 
                      stroke="#ef4444" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTickets)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue Breakdown */}
            <div className="glass dark:bg-slate-900/50 rounded-[2.5rem] p-8 premium-shadow">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-6">Revenue Mix</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" opacity={0.1} />
                    <XAxis dataKey="event" hide />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                    />
                    <Bar dataKey="revenue" fill="#f97316" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;