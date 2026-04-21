/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyEventRequests, type EventRequest, getRequestsForManagedEvents } from "../services/eventService";
import Navbar from "../components/Navbar";
import { 
  Clock, Calendar, MapPin, 
  DollarSign, Zap, Plus, Search, 
  ChevronRight, LayoutGrid, Activity, 
  ShieldCheck, AlertCircle, RefreshCw, ArrowUpRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TiltCard from "../components/TiltCard";

const MyEventRequests: React.FC = () => {
  const [viewManaged, setViewManaged] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    data: requestsData,
    isLoading  } = useQuery({
    queryKey: [viewManaged ? "managed-event-requests" : "my-event-requests"],
    queryFn: () => viewManaged ? getRequestsForManagedEvents() : getMyEventRequests(),  
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[80vh]">
           <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-purple-500/10 rounded-full" />
              <div className="absolute inset-0 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
           </div>
           <p className="mt-8 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.3em] text-xs">Synchronizing Buffer...</p>
        </div>
      </div>
    );
  }

  const requests = requestsData?.data?.requests || [];
  const filteredRequests = requests.filter((r: EventRequest) => 
    activeFilter === "all" ? true : r.status === activeFilter
  );

  const stats = {
    total: requests.length,
    pending: requests.filter((r: any) => r.status === "pending").length,
    approved: requests.filter((r: any) => r.status === "approved").length,
    rejected: requests.filter((r: any) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12 pt-32">
        {/* Cinematic Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                 <Activity className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-600">Operations Control</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
               Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">Nexus</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-lg">
               Manage your submission lifecycle and orchestrate world-class experiences.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button
               onClick={() => setViewManaged(!viewManaged)}
               className={`h-14 px-8 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border-2 flex items-center gap-3 ${
                 viewManaged 
                 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xl" 
                 : "bg-white/50 dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-purple-500"
               }`}
            >
               <RefreshCw size={16} className={viewManaged ? "animate-spin-slow" : ""} />
               {viewManaged ? "Active Managed View" : "Personal Submissions"}
            </button>

            <Link
              to="/create-event"
              className="h-14 px-8 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
            >
              <Plus size={18} />
              Initialize Portal
            </Link>
          </motion.div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
           <StatMetric label="Total Nodes" value={stats.total} icon={LayoutGrid} color="slate" />
           <StatMetric label="Active Handshake" value={stats.pending} icon={Clock} color="yellow" active={activeFilter === "pending"} onClick={() => setActiveFilter("pending")} />
           <StatMetric label="Verified Uplinks" value={stats.approved} icon={ShieldCheck} color="green" active={activeFilter === "approved"} onClick={() => setActiveFilter("approved")} />
           <StatMetric label="Terminated" value={stats.rejected} icon={AlertCircle} color="red" active={activeFilter === "rejected"} onClick={() => setActiveFilter("rejected")} />
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[2.5rem]">
           <div className="flex items-center gap-2 p-1 bg-slate-100/50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800">
              {["all", "pending", "approved", "rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                    activeFilter === f 
                    ? "bg-white dark:bg-slate-800 text-purple-600 shadow-md" 
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
           </div>

           <div className="relative w-full md:w-80">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Protocol..." 
                className="w-full h-14 pl-14 pr-6 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-purple-500/10 text-slate-900 dark:text-white font-bold transition-all"
              />
           </div>
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {filteredRequests.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="py-32 flex flex-col items-center justify-center text-center bg-white/30 dark:bg-white/5 backdrop-blur-xl border border-white/40 dark:border-slate-800 rounded-[4rem]"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-8 border border-slate-200 dark:border-slate-800 shadow-inner">
                 <Zap className="text-slate-300 dark:text-slate-700" size={40} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">No Active Transmissions</h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold max-w-sm mb-10">Start by initializing a new event portal to build your presence.</p>
              <Link 
                to="/create-event"
                className="px-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl"
              >
                 Create First Event
              </Link>
            </motion.div>
          ) : (
            <motion.div 
               layout
               className="grid grid-cols-1 gap-8"
            >
              {filteredRequests.map((request: any) => (
                <RequestCard key={request._id} request={request} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pagination Integration */}
        {requestsData?.data?.pagination && requestsData.data.pagination.pages > 1 && (
           <div className="mt-16 flex justify-center gap-3">
              {Array.from({ length: requestsData.data.pagination.pages }).map((_, i) => (
                <button
                   key={i}
                   className={`w-12 h-12 rounded-xl font-black flex items-center justify-center transition-all ${
                     requestsData.data.pagination.current === i + 1
                     ? "bg-purple-600 text-white shadow-xl shadow-purple-500/20"
                     : "bg-white dark:bg-slate-900 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800"
                   }`}
                >
                   {i + 1}
                </button>
              ))}
           </div>
        )}
      </main>
    </div>
  );
};

const StatMetric = ({ label, value, icon: Icon, color, active, onClick }: any) => {
  const colors: any = {
    slate: "bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400",
    yellow: "bg-yellow-500/10 text-yellow-600",
    green: "bg-emerald-500/10 text-emerald-600",
    red: "bg-red-500/10 text-red-600",
  };

  return (
    <TiltCard damping={15}>
      <button 
        onClick={onClick}
        className={`w-full p-6 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border rounded-[2.5rem] text-left transition-all group ${active ? 'border-purple-500 ring-4 ring-purple-500/5' : 'border-white/50 dark:border-slate-800'}`}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${colors[color]}`}>
           <Icon size={22} />
        </div>
        <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">{value}</p>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
      </button>
    </TiltCard>
  );
};

const RequestCard = ({ request }: { request: any }) => {
  const statusStyles: any = {
    pending: { label: "Awaiting Clearance", color: "text-yellow-600", bg: "bg-yellow-500/10", icon: Clock },
    approved: { label: "Verified Uplink", color: "text-emerald-600", bg: "bg-emerald-500/10", icon: ShieldCheck },
    rejected: { label: "Node Terminated", color: "text-red-600", bg: "bg-red-500/10", icon: AlertCircle },
  };

  const style = statusStyles[request.status] || statusStyles.pending;
  const StatusIcon = style.icon;

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="group">
       <TiltCard damping={20}>
         <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] overflow-hidden transition-all hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)]">
            <div className="p-8 md:p-10">
               <div className="flex flex-col md:flex-row justify-between gap-6 mb-10">
                  <div className="flex-1">
                     <div className="flex items-center gap-4 mb-3">
                        <span className={`px-4 py-1.5 rounded-full ${style.bg} ${style.color} text-[10px] font-black uppercase tracking-widest border border-current/20`}>
                           {style.label}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                           ID: {request._id.slice(-8).toUpperCase()}
                        </span>
                     </div>
                     <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 group-hover:text-purple-600 transition-colors">
                        {request.title}
                     </h3>
                     <p className="text-slate-500 dark:text-slate-400 font-bold leading-relaxed max-w-2xl line-clamp-2">
                        {request.description}
                     </p>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4">
                     <div className={`w-16 h-16 rounded-[2rem] flex items-center justify-center ${style.bg} ${style.color} shadow-inner`}>
                        <StatusIcon size={28} />
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Created</p>
                        <p className="text-sm font-black text-slate-900 dark:text-white">{new Date(request.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-t border-slate-100 dark:border-slate-800">
                  <DetailItem icon={Calendar} label="Target Phase" value={`${new Date(request.startDate).toLocaleDateString()} @ ${request.startTime}`} />
                  <DetailItem icon={MapPin} label="Geospatial Node" value={`${request.venue?.name}, ${request.venue?.city}`} />
                  <DetailItem icon={DollarSign} label="Base Unit Valve" value={`$${request.ticketPricing?.[0]?.price ?? 0} / Ticket`} />
               </div>

               <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                     <div className="flex -space-x-3">
                        {request.images?.slice(0, 3).map((img: string, i: number) => (
                           <div key={i} className="w-12 h-12 rounded-2xl border-4 border-white dark:border-slate-900 overflow-hidden bg-slate-200 dark:bg-slate-800 shadow-lg">
                              <img src={img} alt="Resource" className="w-full h-full object-cover" />
                           </div>
                        ))}
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Assets</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">{request.images?.length || 0} Synchronized</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-4">
                     {request.status === 'approved' && request.approvedEvent && (
                        <Link
                           to={`/manager/events/${(typeof request.approvedEvent === 'string' ? request.approvedEvent : (request as any).approvedEvent?._id) || ''}`}
                           className="h-14 px-8 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 border border-emerald-500/20 shadow-lg shadow-emerald-500/5 group/btn"
                        >
                           Enter Portal
                           <ArrowUpRight size={16} className="group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform" />
                        </Link>
                     )}
                     <button className="h-14 w-14 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-purple-600 hover:text-white transition-all shadow-md">
                        <ChevronRight size={20} />
                     </button>
                  </div>
               </div>

               {request.adminNotes && (
                  <div className="mt-8 p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex gap-4">
                     <AlertCircle className="text-blue-500 shrink-0" size={20} />
                     <div>
                        <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2">Central Oversight Dispatch</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-relaxed italic">{request.adminNotes}</p>
                     </div>
                  </div>
               )}
            </div>
         </div>
       </TiltCard>
    </motion.div>
  );
};

const DetailItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex items-center gap-4">
     <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-400">
        <Icon size={18} />
     </div>
     <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
     </div>
  </div>
);

export default MyEventRequests;
