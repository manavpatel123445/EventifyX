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
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { motion, type Variants } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import SideBar from "../components/SideBar";
import TopNav from "../components/TopNav";
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

// Mock data for charts
const revenueData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 },
  { name: 'May', value: 6000 },
  { name: 'Jun', value: 8000 },
];

const AdminDashboard: React.FC = () => {
  const [viewEvent, setViewEvent] = useState<any | null>(null);
  const [eventsPage, setEventsPage] = useState(1);
  const eventsLimit = 5;

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

  const stats = (statsResp as any)?.data ?? statsResp;
  const events = (eventsResp as any)?.data?.events ?? [];
  const totalEvents = (eventsResp as any)?.data?.pagination?.total ?? 0;
  const totalEventsPages = Math.ceil(totalEvents / eventsLimit);

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'upcoming' || s === 'active' || s === 'approved') return 'bg-admin-success/10 text-admin-success border-admin-success/20';
    if (s === 'ongoing' || s === 'pending') return 'bg-admin-warning/10 text-admin-warning border-admin-warning/20';
    if (s === 'completed') return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    if (s === 'cancelled' || s === 'rejected') return 'bg-admin-error/10 text-admin-error border-admin-error/20';
    return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#040405] overflow-hidden text-slate-900 dark:text-admin-text selection:bg-admin-primary/30">
      
      <SideBar />
      
      <main className="flex-1 flex flex-col relative min-w-0 overflow-hidden">
        <TopNav />
        
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-slate-500 dark:text-admin-text-secondary mt-1 text-sm">
                  Welcome back. Here's what's happening with your platform today.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-admin-surface border border-slate-200 dark:border-admin-border rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-admin-border transition-colors">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>Last 30 Days</span>
                </button>
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
                  label: "Total Revenue", 
                  value: `₹${(stats?.revenue?.totalRevenue ?? 124500).toLocaleString()}`, 
                  icon: <IndianRupee className="w-5 h-5" />, 
                  trend: "+12.5%" 
                },
                { 
                  label: "Total Users", 
                  value: stats?.users?.total ?? 1450, 
                  icon: <Users className="w-5 h-5" />, 
                  trend: "+5.2%" 
                },
                { 
                  label: "Active Events", 
                  value: stats?.events?.total ?? 34, 
                  icon: <Calendar className="w-5 h-5" />, 
                  trend: "+18.1%" 
                },
                { 
                  label: "Pending Requests", 
                  value: stats?.requests?.pending ?? 12, 
                  icon: <ClipboardList className="w-5 h-5" />, 
                  trend: "-2.4%" 
                }
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="bg-white dark:bg-admin-surface p-6 rounded-xl border border-slate-200 dark:border-admin-border shadow-sm"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-500 dark:text-admin-text-secondary">{stat.label}</span>
                      <h3 className="text-2xl font-semibold mt-2">
                        {loadingStats ? (
                          <div className="w-20 h-8 bg-slate-100 dark:bg-admin-border animate-pulse rounded-md" />
                        ) : stat.value}
                      </h3>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-admin-background text-admin-primary">
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className={`flex items-center text-xs font-medium ${stat.trend.startsWith('+') ? 'text-admin-success' : 'text-admin-error'}`}>
                      {stat.trend.startsWith('+') ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingUp className="w-3 h-3 mr-1 rotate-180" />}
                      {stat.trend}
                    </div>
                    <span className="text-xs text-slate-400 dark:text-admin-text-secondary">vs last month</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-admin-surface rounded-xl border border-slate-200 dark:border-admin-border shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold">Revenue Growth</h3>
                    <p className="text-sm text-slate-500 dark:text-admin-text-secondary mt-1">Monthly revenue performance</p>
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3F3F46" opacity={0.2} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#9ca3af', fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#18181B', 
                          border: '1px solid #3F3F46',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                        itemStyle={{ color: '#4F46E5' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        stroke="#4F46E5" 
                        strokeWidth={2}
                        fillOpacity={1} 
                        fill="url(#colorValue)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Recent Activity / System */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-admin-surface rounded-xl border border-slate-200 dark:border-admin-border shadow-sm p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-semibold">System Pulse</h3>
                    <p className="text-sm text-slate-500 dark:text-admin-text-secondary mt-1">Platform health & metrics</p>
                  </div>
                  <Activity className="w-5 h-5 text-admin-primary" />
                </div>
                
                <div className="space-y-6">
                  {[
                    { label: "API Latency", value: "24ms", percent: 24, color: "bg-admin-success" },
                    { label: "Database Load", value: "42%", percent: 42, color: "bg-admin-primary" },
                    { label: "Storage Usage", value: "78%", percent: 78, color: "bg-admin-warning" }
                  ].map((item, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-600 dark:text-admin-text-secondary">{item.label}</span>
                        <span className="text-sm font-semibold">{item.value}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 dark:bg-admin-background rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${item.percent}%` }}
                          transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                          className={`h-full ${item.color} rounded-full`} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-admin-border">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-admin-text mb-4">Quick Actions</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Add User", icon: <Users className="w-4 h-4" /> },
                      { label: "New Event", icon: <Calendar className="w-4 h-4" /> }
                    ].map((action, i) => (
                      <button key={i} className="flex items-center justify-center gap-2 p-2.5 rounded-lg border border-slate-200 dark:border-admin-border hover:bg-slate-50 dark:hover:bg-admin-background transition-colors text-sm font-medium text-slate-600 dark:text-admin-text-secondary hover:text-slate-900 dark:hover:text-admin-text">
                        {action.icon}
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Data Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-admin-surface rounded-xl border border-slate-200 dark:border-admin-border shadow-sm overflow-hidden"
            >
              <div className="p-6 border-b border-slate-200 dark:border-admin-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold">Recent Events</h3>
                  <p className="text-sm text-slate-500 dark:text-admin-text-secondary mt-1">Latest events created on the platform</p>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search events..." 
                      className="pl-9 pr-4 py-2 border border-slate-200 dark:border-admin-border rounded-lg bg-slate-50 dark:bg-admin-background text-sm focus:outline-none focus:ring-2 focus:ring-admin-primary/50"
                    />
                  </div>
                  <button className="p-2 border border-slate-200 dark:border-admin-border rounded-lg hover:bg-slate-50 dark:hover:bg-admin-background transition-colors text-slate-500">
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-admin-background text-slate-500 dark:text-admin-text-secondary">
                    <tr>
                      <th className="px-6 py-4 font-medium">Event Details</th>
                      <th className="px-6 py-4 font-medium">Date & Time</th>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-admin-border">
                    {loadingEvents ? (
                      Array(3).fill(0).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-admin-border rounded w-48" /></td>
                          <td className="px-6 py-4"><div className="h-4 bg-slate-100 dark:bg-admin-border rounded w-32" /></td>
                          <td className="px-6 py-4"><div className="h-6 bg-slate-100 dark:bg-admin-border rounded-full w-20" /></td>
                          <td className="px-6 py-4"><div className="h-8 bg-slate-100 dark:bg-admin-border rounded-lg ml-auto w-20" /></td>
                        </tr>
                      ))
                    ) : events.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                          <Calendar className="w-8 h-8 mx-auto mb-3 opacity-20" />
                          <p>No events found</p>
                        </td>
                      </tr>
                    ) : events.map((event: any) => (
                      <tr 
                        key={event._id}
                        className="hover:bg-slate-50 dark:hover:bg-admin-background/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-slate-900 dark:text-admin-text">
                            {event.title ? capitalizeFirstLetter(event.title) : 'Untitled Event'}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-admin-text-secondary mt-1">
                            {event.venue?.city || 'Virtual'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-slate-900 dark:text-admin-text">
                            {new Date(event.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-admin-text-secondary mt-1">
                            {event.startTime || '00:00'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(event.status)}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setViewEvent(event)}
                            className="inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-admin-border rounded-lg text-sm font-medium text-slate-700 dark:text-admin-text bg-white dark:bg-admin-surface hover:bg-slate-50 dark:hover:bg-admin-border transition-colors shadow-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalEventsPages > 1 && (
                <div className="px-6 py-4 border-t border-slate-200 dark:border-admin-border bg-slate-50 dark:bg-admin-background flex items-center justify-between">
                  <button
                    onClick={() => setEventsPage(p => Math.max(1, p - 1))}
                    disabled={eventsPage === 1}
                    className="p-2 border border-slate-200 dark:border-admin-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-admin-surface transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600 dark:text-admin-text-secondary">
                    Page <span className="font-medium text-slate-900 dark:text-admin-text">{eventsPage}</span> of {totalEventsPages}
                  </span>
                  <button
                    onClick={() => setEventsPage(p => Math.min(totalEventsPages, p + 1))}
                    disabled={eventsPage >= totalEventsPages}
                    className="p-2 border border-slate-200 dark:border-admin-border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-admin-surface transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
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
