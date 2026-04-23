/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../app/store";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProfileForm from "../components/ProfileForm";
import { 
  User,
  Ticket,
  Shield,
  Camera,
  Activity,
  Zap,
  Globe,
  Settings
} from "lucide-react";
import toast from "react-hot-toast";
import { getRoleDisplayName, capitalizeFirstLetter } from "../utils/roleUtils";
import { uploadAvatar } from "../services/eventService";
import { type UserProfile, getProfile, updateProfile } from "../services/userService";
import TiltCard from "../components/TiltCard";
import { motion, AnimatePresence } from "framer-motion";


const ProfilePage = () => {
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'security'>('profile');

  useEffect(() => {
    if (authUser) loadUserData();
  }, [authUser]);

  useEffect(() => {
    if (user?.profileImage) setAvatarPreview(user.profileImage);
  }, [user]);

  const loadUserData = async () => {
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!accessToken) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await getProfile();
      if (response && response.success && response.user) setUser(response.user);
    } catch (error) {
      toast.error('Failed to sync profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    
    try {
      const imageUrl = await uploadAvatar(file);
      if (imageUrl && user) {
        await updateProfile({ profileImage: imageUrl });
        setUser({ ...user, profileImage: imageUrl });
        toast.success('Identity Avatar Synchronized');
      }
    } catch (error) {
      toast.error('Avatar sync failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <main className="pt-32 pb-20">
        <div className="container mx-auto px-6 max-w-7xl">
          
          {/* Panoramic Hero Header */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[300px] rounded-[3rem] overflow-hidden mb-[-100px] z-0 shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-slate-900 to-blue-900" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-20 mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-50/100 dark:from-slate-950/100 to-transparent" />
          </motion.div>

          {/* User Hub */}
          <div className="relative z-10">
            <div className="grid lg:grid-cols-12 gap-10">
              
              {/* Left Profile Card */}
              <div className="lg:col-span-4">
                <TiltCard damping={20} stiffness={120}>
                  <div className="p-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl text-center relative overflow-hidden group">
                    <div className="relative inline-block mb-6">
                      <div className="w-32 h-32 rounded-full p-1 bg-gradient-to-br from-purple-500 to-blue-500 shadow-2xl relative z-10">
                        <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden border-4 border-slate-900">
                          {avatarPreview ? (
                            <img src={avatarPreview} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-12 h-12 text-slate-500" />
                          )}
                        </div>
                      </div>
                      <label className="absolute bottom-0 right-0 w-10 h-10 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 active:scale-95 transition-all z-20 hover:text-purple-600">
                        <Camera size={18} />
                        <input type="file" className="hidden" onChange={handleAvatarChange} />
                      </label>
                      <div className="absolute inset-0 bg-purple-500/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-2">
                       {user?.name ? capitalizeFirstLetter(user.name) : 'User 0x1'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-bold mb-6">{user?.email}</p>
                    
                    <div className="flex justify-center gap-2 mb-8">
                       <span className="px-4 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">
                         {user?.role ? getRoleDisplayName(user.role) : 'Citizen'}
                       </span>
                       <span className="px-4 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                         Verified
                       </span>
                    </div>

                    <div className="space-y-3">
                       <ProfileNavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon={User} label="Profile Nexus" />
                       <ProfileNavButton active={activeTab === 'activity'} onClick={() => setActiveTab('activity')} icon={Activity} label="Pulse Stream" />
                       <ProfileNavButton active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon={Shield} label="Neural Shield" />
                    </div>
                  </div>
                </TiltCard>

                {/* Network Status Widget */}
                <div className="mt-8 p-8 bg-slate-900 dark:bg-slate-900/50 rounded-[2.5rem] border border-slate-800 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-700" />
                   <div className="flex items-center justify-between mb-6">
                      <h4 className="text-white font-black text-sm uppercase tracking-widest">Network Pulse</h4>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Latency</p>
                         <p className="text-lg font-black text-white">24ms</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Uptime</p>
                         <p className="text-lg font-black text-white">99.9%</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Right Content Stream */}
              <div className="lg:col-span-8">
                <AnimatePresence mode="wait">
                  {activeTab === 'profile' && (
                    <motion.div 
                      key="profile"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl p-10">
                        <div className="flex items-center justify-between mb-10">
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                            <Settings className="text-purple-600" />
                            Nexus Configuration
                          </h3>
                          <button 
                            onClick={() => setIsEditing(!isEditing)}
                            className={`px-6 py-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                              isEditing 
                                ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {isEditing ? 'Cancel Sync' : 'Reconfigure'}
                          </button>
                        </div>
                        <ProfileForm 
                          showTitle={false}
                          user={user}
                          onUpdate={async (data) => {
                            await updateProfile(data);
                            loadUserData();
                            setIsEditing(false);
                            toast.success('Nexus Updated');
                          } }
                          isEditing={isEditing}
                          onChangePassword={async (_current, _new) => {
                            toast.error('Security Protocol Active: Manual Bypass Denied');
                          } } 
                          onEditToggle={() => setIsEditing(!isEditing)}               
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                         <AccountStat label="Events Attended" value="24" icon={Zap} color="text-yellow-500" />
                         <AccountStat label="Global Ranking" value="#4,102" icon={Globe} color="text-blue-500" />
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'activity' && (
                    <motion.div 
                      key="activity"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-3xl border border-white/50 dark:border-slate-800 rounded-[3rem] shadow-2xl p-10"
                    >
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-10">Activity Logs</h3>
                      <div className="space-y-6">
                         {[1,2,3].map(i => (
                           <div key={i} className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl">
                              <div className="w-14 h-14 bg-purple-600/10 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                                 <Ticket size={24} />
                              </div>
                              <div className="flex-1">
                                 <h4 className="font-black text-slate-900 dark:text-white">Ticket Purchased</h4>
                                 <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Cyberpunk Festival 2077</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">2h ago</p>
                                 <p className="font-black text-emerald-500">+$250.00</p>
                              </div>
                           </div>
                         ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

const ProfileNavButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button 
    onClick={onClick}
    className={`w-full h-14 px-6 rounded-2xl flex items-center justify-between transition-all duration-300 font-black text-sm tracking-tight ${
      active 
        ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-xl shadow-purple-500/20' 
        : 'bg-transparent text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon size={18} />
      {label}
    </div>
    {active && <Zap size={14} className="animate-pulse" />}
  </button>
);

const AccountStat = ({ label, value, icon: Icon, color }: any) => (
  <div className="p-8 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-white dark:border-slate-800 shadow-xl flex items-center gap-6">
    <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 shadow-lg flex items-center justify-center ${color}`}>
       <Icon size={28} />
    </div>
    <div>
       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
       <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
    </div>
  </div>
);

export default ProfilePage;
