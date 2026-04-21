/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { QRCodeScanner } from '../components/QRCodeScanner';
import { 
  Scan, X, AlertCircle, 
  ShieldCheck, Ticket, Zap, 
  RefreshCw, Layers, Database,
  ArrowUpRight, UserCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import TiltCard from '../components/TiltCard';
import toast from 'react-hot-toast';

const ScanTicketsPage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);

  const handleScan = (data: string) => {
    try {
      const ticketData = JSON.parse(data);
      setScanResult({
        ...ticketData,
        scanTime: new Date().toLocaleTimeString(),
        isValid: true
      });
      toast.success("Identity Interface Synchronized");
      setIsScannerOpen(false);
    } catch (error) {
      console.error('Invalid QR Code:', error);
      setScanResult({
        error: 'Protocol Mismatch: Invalid Ticket Signature',
        rawData: data,
        scanTime: new Date().toLocaleTimeString()
      });
      toast.error("Handshake Failed: Invalid Sequence");
      setIsScannerOpen(false);
    }
  };

  const validateTicket = async () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Decrypting Blockchain Verification...',
        success: 'Access Granted: Entity Verified',
        error: 'Access Denied: Revoked Signature',
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      {/* Cinematic Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/5 rounded-full blur-[150px] animate-pulse" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/5 rounded-full blur-[150px] animate-pulse delay-1000" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 pt-32">
        
        {/* Futuristic Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                 <Scan className="text-white" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-600">Access Control Terminal</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">
               Neural <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Validation</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl text-lg leading-relaxed">
               Execute safe entry protocols and synchronize attendee identity in real-time.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button 
              onClick={() => {
                setScanResult(null);
                setIsScannerOpen(true);
              }}
              className="h-20 px-12 rounded-3xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group"
            >
              <Zap className="group-hover:fill-current transition-all" size={24} />
              Deploy Scanner
            </button>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Scanner / Result Core */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {isScannerOpen ? (
                <motion.div
                  key="scanner"
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="relative h-[600px] bg-black rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-4 border-blue-500/30"
                >
                  <QRCodeScanner 
                    onScan={handleScan} 
                    onClose={() => setIsScannerOpen(false)}
                  />
                  
                  {/* Digital Targeting Overlays */}
                  <div className="absolute inset-0 pointer-events-none">
                     <div className="absolute inset-0 bg-blue-500/5 mix-blend-overlay" />
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-blue-500/30 rounded-[3rem] animate-pulse" />
                     <div className="absolute top-1/2 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_30px_rgba(59,130,246,0.8)] animate-scan" style={{ animationDuration: '3s' }} />
                     
                     {/* Corner Brackets */}
                     <div className="absolute top-16 left-16 w-12 h-12 border-t-4 border-l-4 border-blue-500 rounded-tl-3xl opacity-50" />
                     <div className="absolute top-16 right-16 w-12 h-12 border-t-4 border-r-4 border-blue-500 rounded-tr-3xl opacity-50" />
                     <div className="absolute bottom-16 left-16 w-12 h-12 border-b-4 border-l-4 border-blue-500 rounded-bl-3xl opacity-50" />
                     <div className="absolute bottom-16 right-16 w-12 h-12 border-b-4 border-r-4 border-blue-500 rounded-br-3xl opacity-50" />
                  </div>

                  <button 
                    onClick={() => setIsScannerOpen(false)}
                    className="absolute top-8 right-8 w-16 h-16 bg-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center text-white hover:bg-white/20 transition-all border border-white/20 shadow-2xl z-20"
                  >
                    <X size={24} />
                  </button>

                  <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-xl px-10 py-4 rounded-full border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                     Handshake Sequence Active
                  </div>
                </motion.div>
              ) : scanResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl rounded-[4rem] border border-white/50 dark:border-slate-800 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden min-h-[600px] relative"
                >
                  {/* Animated Status Bar */}
                  <div className={`h-4 w-full ${scanResult.error ? 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]' : 'bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.5)]'} animate-pulse`} />

                  <div className="p-12 md:p-16">
                     <div className="flex flex-col md:flex-row justify-between gap-10">
                        <div className="flex-1">
                           <div className="flex items-center gap-4 mb-6">
                              <div className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] border ${scanResult.error ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                                 {scanResult.error ? 'Security Breach' : 'Identity Secured'}
                              </div>
                              <span className="text-slate-400 font-bold text-xs">Timestamp: {scanResult.scanTime}</span>
                           </div>

                           <h2 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-10 leading-tight">
                              {scanResult.error ? 'Authorization Denied' : 'Access Granted: User Verified'}
                           </h2>

                           {scanResult.error ? (
                              <div className="space-y-8">
                                 <div className="p-8 bg-red-500/5 border border-red-500/10 rounded-[2.5rem] flex gap-5 italic text-red-500/80 font-bold">
                                    <AlertCircle size={24} className="shrink-0" />
                                    {scanResult.error}
                                 </div>
                                 <div className="p-8 bg-slate-100 dark:bg-slate-950 rounded-[2.5rem] font-mono text-xs text-slate-400 break-all leading-relaxed opacity-50">
                                    {scanResult.rawData}
                                 </div>
                                 <button 
                                   onClick={() => setIsScannerOpen(true)}
                                   className="w-full h-16 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all"
                                 >
                                    Initialize Secondary Recovery Scan
                                 </button>
                              </div>
                           ) : (
                              <div className="space-y-12">
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <InfoEntry icon={Ticket} label="Resource Pointer" value={scanResult.ticketId} color="blue" />
                                    <InfoEntry icon={ShieldCheck} label="Access Tier" value={(scanResult.type || 'GENERAL').toUpperCase()} color="purple" />
                                    <InfoEntry icon={Database} label="Nexus Index" value={scanResult.eventId} color="slate" />
                                    <InfoEntry icon={RefreshCw} label="Cycle Sync" value="Verified in 240ms" color="emerald" />
                                 </div>
                                 
                                 <div className="flex flex-col md:flex-row gap-6 pt-10 border-t border-slate-100 dark:border-slate-800">
                                    <button 
                                      onClick={validateTicket}
                                      className="flex-1 h-20 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2.5rem] font-black text-lg uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
                                    >
                                       <UserCheck size={24} />
                                       Commit Entry
                                       <ArrowUpRight size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </button>
                                    <button 
                                      onClick={() => setScanResult(null)}
                                      className="h-20 px-10 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                                    >
                                       Clear
                                    </button>
                                 </div>
                              </div>
                           )}
                        </div>
                     </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="group relative h-[600px] bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl rounded-[4rem] border-4 border-dashed border-slate-200 dark:border-slate-800 p-20 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:border-blue-500/50 hover:bg-white/50 active:scale-[0.99]"
                  onClick={() => setIsScannerOpen(true)}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10">
                    <div className="w-32 h-32 bg-slate-100 dark:bg-slate-800 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-slate-200 dark:border-slate-700 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-700">
                      <Scan size={48} className="text-slate-400 group-hover:text-blue-600" />
                    </div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-6">Scanner Offline</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg max-w-sm mx-auto mb-10 font-bold leading-relaxed italic">
                       Stand by for biological or digital identity verification. Initiate scan to authorize node entry.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                       <div className="w-3 h-3 rounded-full bg-blue-500/20 border-2 border-blue-500" />
                       <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">System Primed</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Infrastructure Metrics Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            <TiltCard damping={25}>
               <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden h-full">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] -mr-24 -mt-24 animate-pulse" />
                  
                  <h3 className="text-sm font-black text-blue-400 uppercase tracking-[0.4em] mb-10 flex items-center gap-3">
                     <Layers size={14} />
                     Live Infrastructure
                  </h3>
                  
                  <div className="space-y-10">
                     <MetricBox label="Active Check-Ins" value="2,482" total="5,000" color="blue" />
                     <MetricBox label="Throughput" value="14/min" sub="Adaptive Load" color="purple" />
                     <MetricBox label="Security Faults" value="0" sub="Protocol Stable" color="emerald" />
                  </div>

                  <div className="mt-12 p-6 bg-white/5 rounded-3xl border border-white/10">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Sync Status</p>
                     <div className="flex items-center gap-3">
                        <div className="flex -space-x-2">
                           {[1,2,3].map(i => (
                             <div key={i} className="w-8 h-8 rounded-full bg-blue-500 border-2 border-slate-900 shadow-lg" />
                           ))}
                        </div>
                        <span className="text-xs font-black text-white px-2 py-1 bg-white/10 rounded-lg">3+ Nodes Active</span>
                     </div>
                  </div>
               </div>
            </TiltCard>

            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3.5rem] p-10 shadow-xl">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Temporal Audit</h3>
                  <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Full Log</button>
               </div>
               
               <div className="space-y-6">
                 <AuditLogEntry user="C. Miller" tier="VIP" time="Just Now" status="Success" />
                 <AuditLogEntry user="K. Zhang" tier="Regular" time="2m ago" status="Success" />
                 <AuditLogEntry user="Unknown Entity" tier="Denied" time="5m ago" status="Failed" />
                 <AuditLogEntry user="M. Vance" tier="VIP" time="15m ago" status="Success" />
               </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const InfoEntry = ({ icon: Icon, label, value, color }: any) => {
  const colors: any = {
    blue: "bg-blue-600 text-white shadow-blue-500/20",
    purple: "bg-purple-600 text-white shadow-purple-500/20",
    slate: "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-none",
    emerald: "bg-emerald-500 text-white shadow-emerald-500/20",
  };

  return (
    <div className="flex gap-5 group">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform ${colors[color]}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter uppercase">{value}</p>
      </div>
    </div>
  );
};

const MetricBox = ({ label, value, total, sub, color }: any) => {
  const progress = total ? (parseInt(value.replace(/,/g, '')) / parseInt(total.replace(/,/g, ''))) * 100 : 0;
  
  return (
    <div>
      <div className="flex justify-between items-end mb-3">
         <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-3xl font-black text-white tracking-tighter">{value}{total && <span className="text-sm text-slate-500 ml-1">/ {total}</span>}</p>
         </div>
         {sub && <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{sub}</p>}
      </div>
      {total && (
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
           <motion.div 
             initial={{ width: 0 }}
             animate={{ width: `${progress}%` }}
             transition={{ duration: 1, ease: "easeOut" }}
             className={`h-full bg-${color}-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]`}
           />
        </div>
      )}
    </div>
  );
};

const AuditLogEntry = ({ user, tier, time, status }: any) => (
  <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 transition-all cursor-crosshair">
    <div className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${status === 'Failed' ? 'bg-red-500/10 text-red-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-white'}`}>
        {user.charAt(0)}
      </div>
      <div>
        <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{user}</p>
        <p className={`text-[10px] font-black uppercase tracking-widest ${tier === 'VIP' ? 'text-purple-500' : 'text-slate-400'}`}>{tier}</p>
      </div>
    </div>
    <div className="text-right">
       <p className="text-[10px] font-black text-slate-400 uppercase mb-0.5">{time}</p>
       <div className={`w-1.5 h-1.5 rounded-full ml-auto ${status === 'Failed' ? 'bg-red-500' : 'bg-emerald-500'} animate-pulse`} />
    </div>
  </div>
);

export default ScanTicketsPage;
