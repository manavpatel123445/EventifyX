/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  Calendar, 
  ClipboardList, 
  ChevronLeft, 
  ChevronRight, 
  IndianRupee, 
  Activity, 
  Search,
  Filter,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

import SideBar from "../components/SideBar";
import { getDashboardStats } from "../../services/adminService";
import { getAllEvents } from "../../services/eventService";
import { getAllRequests } from "../../services/eventManagerRequestService";
import { EventViewModal } from "../../components";
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

const AdminDashboard: React.FC = () => {
  const [viewEvent, setViewEvent] = useState<any | null>(null);
  const [eventsPage, setEventsPage] = useState(1);
  const eventsLimit = 10;
  const [requestsPage] = useState(1);
  const requestsLimit = 5;

  const { data: statsResp, isLoading: loadingStats } = useQuery({ 
    queryKey: ["dashboardStats"], 
    queryFn: getDashboardStats 
  });
  
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

  const stats = (statsResp as any)?.data ?? statsResp;
  const events = (eventsResp as any)?.data?.events ?? [];
  const totalEvents = (eventsResp as any)?.data?.pagination?.total ?? 0;
  const totalEventsPages = Math.ceil(totalEvents / eventsLimit);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'upcoming' || s === 'active' || s === 'approved') return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    if (s === 'ongoing' || s === 'pending') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'completed') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (s === 'cancelled' || s === 'rejected') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 relative overflow-hidden">
      {/* Decorative Background Blobs */}
      <div className="bg-blob from-purple-500/20 top-[-100px] right-[-100px]" />
      <div className="bg-blob from-blue-500/20 bottom-[-100px] left-[-100px]" />
      
      <SideBar />
      
      <main className="flex-1 p-8 space-y-8 overflow-x-auto relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Admin <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Nexus</span>
              <ShieldCheck className="w-8 h-8 text-purple-600" />
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">System Intelligence & Management</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {[
            { 
              label: "Total Users", 
              value: stats?.users?.total ?? 0, 
              icon: <Users className="w-6 h-6" />, 
              color: "text-blue-500", 
              bg: "bg-blue-500/10",
              border: "border-blue-500/20"
            },
            { 
              label: "Active Events", 
              value: stats?.events?.total ?? 0, 
              icon: <Calendar className="w-6 h-6" />, 
              color: "text-purple-500", 
              bg: "bg-purple-500/10",
              border: "border-purple-500/20"
            },
            { 
              label: "New Requests", 
              value: stats?.requests?.pending ?? 0, 
              icon: <ClipboardList className="w-6 h-6" />, 
              color: "text-amber-500", 
              bg: "bg-amber-500/10",
              border: "border-amber-500/20"
            },
            { 
              label: "Net Revenue", 
              value: `₹${(stats?.revenue?.totalRevenue ?? 0).toLocaleString()}`, 
              icon: <IndianRupee className="w-6 h-6" />, 
              color: "text-emerald-500", 
              bg: "bg-emerald-500/10",
              border: "border-emerald-500/20"
            }
          ].map((stat, idx) => (
            <motion.div 
              key={idx}
              variants={itemVariants}
              whileHover={{ y: -5 }}
              className="glass dark:bg-slate-900/50 p-6 rounded-3xl premium-shadow premium-shadow-hover transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.border} ${stat.color} shadow-inner`}>
                  {stat.icon}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                    {loadingStats ? (
                      <div className="w-12 h-8 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
                    ) : stat.value}
                  </h3>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="flex items-center text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +12.5%
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">vs last month</span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Table Area */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="xl:col-span-2 glass dark:bg-slate-900/50 rounded-[2.5rem] premium-shadow overflow-hidden flex flex-col"
          >
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Event Ecosystem</h2>
                <p className="text-sm font-medium text-slate-500">Managing global events and requests</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                  <Search className="w-5 h-5" />
                </button>
                <button className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 uppercase text-[10px] font-black tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-4">Title</th>
                    <th className="px-8 py-4">Date & Time</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {loadingEvents ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-8 py-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" /></td>
                        <td className="px-8 py-5"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" /></td>
                        <td className="px-8 py-5"><div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-full w-20" /></td>
                        <td className="px-8 py-5"><div className="h-8 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-16" /></td>
                      </tr>
                    ))
                  ) : events.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center">
                        <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500 font-bold">No events found in the database</p>
                      </td>
                    </tr>
                  ) : events.map((event: any) => (
                    <motion.tr 
                      key={event._id}
                      whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      className="group transition-colors"
                    >
                      <td className="px-8 py-5">
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                          {event.title ? capitalizeFirstLetter(event.title) : 'Untitled Event'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">
                          {event.venue?.city || 'Virtual'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300 tracking-tight">
                          {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter mt-0.5">
                          {event.startTime || '00:00'}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(event.status)}`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => setViewEvent(event)}
                          className="px-4 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                        >
                          Details
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalEventsPages > 1 && (
              <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex items-center justify-between mt-auto">
                <button
                  onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                  disabled={eventsPage === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <div className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                  Page <span className="text-purple-600 font-black">{eventsPage}</span> / {totalEventsPages}
                </div>
                <button
                  onClick={() => setEventsPage(p => Math.min(totalEventsPages, p + 1))}
                  disabled={eventsPage >= totalEventsPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            )}
          </motion.div>

          {/* Right Sidebar Area */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-8"
          >
            {/* System Health Card */}
            <div className="glass dark:bg-slate-900/50 rounded-[2.5rem] p-8 premium-shadow relative overflow-hidden">
              <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                System Pulse
                <Activity className="w-5 h-5 text-emerald-500" />
              </h3>
              <div className="mt-6 space-y-6">
                {[
                  { label: "API Latency", value: "24ms", color: "bg-emerald-500" },
                  { label: "DB Health", value: "99.9%", color: "bg-blue-500" },
                  { label: "Traffic Load", value: "34%", color: "bg-purple-500" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                      <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: item.value }}
                        transition={{ duration: 1, delay: 0.6 + (i * 0.1) }}
                        className={`h-full ${item.color}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-8 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                Full System Report
              </button>
            </div>

            {/* Quick Actions */}
            <div className="glass dark:bg-slate-900/50 rounded-[2.5rem] p-8 premium-shadow">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Admin Commands</h3>
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { label: "New Event", icon: <Calendar className="w-4 h-4" /> },
                  { label: "User Audit", icon: <Users className="w-4 h-4" /> },
                  { label: "Logs", icon: <Activity className="w-4 h-4" /> },
                  { label: "Exports", icon: <ArrowUpRight className="w-4 h-4" /> }
                ].map((action, i) => (
                  <button key={i} className="flex flex-col items-center justify-center gap-3 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all group">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 group-hover:bg-purple-600 group-hover:text-white transition-all">
                      {action.icon}
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {viewEvent && (
        <EventViewModal
          isOpen={!!viewEvent}
          onClose={() => setViewEvent(null)}
          event={viewEvent}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
