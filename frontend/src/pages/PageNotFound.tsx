import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, Ghost, Orbit, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 overflow-hidden">
      <Navbar />
      
      <main className="container mx-auto px-6 flex flex-col items-center justify-center min-h-[calc(100vh-160px)] relative">
        {/* Background Ambience */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        
        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ duration: 0.8 }}
           className="text-center relative z-10"
        >
          {/* Neural 404 Visual */}
          <div className="relative inline-block mb-16">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
              className="absolute inset-0 flex items-center justify-center opacity-20"
            >
               <Orbit size={400} className="text-purple-600 animate-spin-slow" />
            </motion.div>
            
            <motion.h1 
              initial={{ filter: "blur(20px)", opacity: 0 }}
              animate={{ filter: "blur(0px)", opacity: 0.1 }}
              transition={{ duration: 1.5 }}
              className="text-[12rem] md:text-[20rem] font-black text-slate-900 dark:text-white select-none leading-none tracking-tighter"
            >
              404
            </motion.h1>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
              <motion.div
                animate={{ y: [0, -25, 0], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="relative"
              >
                <div className="absolute inset-0 bg-purple-500 blur-2xl opacity-40 animate-pulse" />
                <Ghost size={140} className="text-purple-600 relative z-10" />
              </motion.div>
            </div>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto px-6">
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.3 }}
               className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 font-black text-[10px] uppercase tracking-[0.4em]"
             >
                <Zap size={12} />
                Dimensional Sync Failed
             </motion.div>
             
             <motion.h2 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight tracking-tighter"
             >
               Lost in the <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-500">Event-Verse</span>
             </motion.h2>
             
             <motion.p 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5 }}
               className="text-slate-500 dark:text-slate-400 text-xl font-bold leading-relaxed"
             >
               The coordinates you've entered do not correspond to any known event architecture in this timeline.
             </motion.p>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16"
          >
            <Link
              to="/"
              className="group relative w-full sm:w-auto px-12 py-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10 flex items-center justify-center gap-3">
                 <Home size={18} />
                 Re-establish Sync
              </span>
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto px-12 py-6 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl text-slate-900 dark:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              <ArrowLeft size={18} />
              Previous Vector
            </button>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

export default PageNotFound;
