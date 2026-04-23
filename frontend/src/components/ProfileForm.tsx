/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../app/slices/authslice";
import { getProfile, updateProfile, changePassword, type UserProfile, type UpdateProfileData } from "../services/userService";
import toast from "react-hot-toast";
import { User, Mail, Shield, Lock, Save, RefreshCw, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProfileFormProps {
  showTitle?: boolean;
  className?: string;
  user: UserProfile | null;
  onUpdate: (data: UpdateProfileData) => Promise<void>;
  onChangePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isEditing: boolean;
  onEditToggle: () => void;
  onAvatarUpdate?: (imageUrl: string) => void;
}

const ProfileForm = ({ showTitle = true, className = "", user, isEditing }: ProfileFormProps) => {
  const dispatch = useDispatch();
  
  const [profile, setProfile] = useState<UserProfile | null>(user);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    profileImage: user?.profileImage || ""
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        profileImage: user.profileImage || ""
      });
    }
  }, [user]);

  const loadProfile = async (): Promise<void> => {
    if (user) return; // Skip if user is already provided via props
    
    const accessToken = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
    if (!accessToken) return;

    try {
      setLoading(true);
      const response = await getProfile();
      if (response && response.success) {
        setProfile(response.user);
        setFormData({
          name: response.user.name || "",
          email: response.user.email || "",
          phone: response.user.phone || "",
          profileImage: response.user.profileImage || ""
        });
      }
    } catch (error: any) {
      toast.error("Decryption Failed: Profile Locked");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const response = await updateProfile(formData);
      if (response.success) {
        setProfile(response.user);
        dispatch(setUser(response.user as any));
        toast.success("Identity Matrix Updated");
      }
    } catch (error: any) {
      toast.error("Transmission Interrupted");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Security Mismatch: Passwords differ");
      return;
    }
    setChangingPassword(true);
    try {
      const response = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      if (response.success) {
        toast.success("Security Protocols Updated");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      }
    } catch (error: any) {
      toast.error("Security Override Failed");
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600" />
    </div>
  );

  return (
    <div className={`space-y-10 ${className}`}>
      {showTitle && (
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-8">Identity Settings</h2>
      )}
      
      <form onSubmit={handleProfileUpdate} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
           <PremiumInput 
             label="Primary Identifier" 
             value={formData.name} 
             onChange={(v: any) => setFormData({...formData, name: v})} 
             icon={User} 
             disabled={!isEditing}
           />
           <PremiumInput 
             label="Network Node (Email)" 
             value={formData.email} 
             onChange={(v: any) => setFormData({...formData, email: v})} 
             icon={Mail} 
             disabled={!isEditing}
           />
           <PremiumInput 
             label="Comms Frequency (Phone)" 
             value={formData.phone} 
             onChange={(v: any) => setFormData({...formData, phone: v})} 
             icon={Smartphone} 
             disabled={!isEditing}
           />
           <div className="space-y-2 opacity-60">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4">Account Status</label>
              <div className="h-14 px-6 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-between border border-transparent">
                 <span className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-wider">{profile?.role?.replace('_', ' ')}</span>
                 <Shield size={18} className="text-emerald-500" />
              </div>
           </div>
        </div>

        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <button 
              type="submit" 
              disabled={updating}
              className="w-full h-16 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            >
              {updating ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
              {updating ? 'Transmitting...' : 'Sync Identity'}
            </button>
          </motion.div>
        )}
      </form>

      {/* Security Hub */}
      <div className="pt-10 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                 <Lock size={20} />
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Security Core</h3>
           </div>
           <button 
             onClick={() => setShowPasswordForm(!showPasswordForm)}
             className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400 hover:opacity-70 transition-opacity"
           >
             {showPasswordForm ? 'Abort Override' : 'Initiate Password Reset'}
           </button>
        </div>

        <AnimatePresence>
          {showPasswordForm && (
            <motion.form 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handlePasswordChange} 
              className="space-y-6 overflow-hidden"
            >
              <div className="grid md:grid-cols-3 gap-6">
                 <PremiumInput label="Old Code" type="password" value={passwordData.currentPassword} onChange={(v: any) => setPasswordData({...passwordData, currentPassword: v})} />
                 <PremiumInput label="New Sequence" type="password" value={passwordData.newPassword} onChange={(v: any) => setPasswordData({...passwordData, newPassword: v})} />
                 <PremiumInput label="Verify Sequence" type="password" value={passwordData.confirmPassword} onChange={(v: any) => setPasswordData({...passwordData, confirmPassword: v})} />
              </div>
              <button 
                type="submit" 
                disabled={changingPassword}
                className="w-full h-14 bg-red-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-500/20 flex items-center justify-center gap-3"
              >
                {changingPassword ? <RefreshCw className="animate-spin" size={16} /> : <Shield size={16} />}
                Confirm Security Override
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const PremiumInput = ({ label, type = "text", value, onChange, icon: Icon, disabled }: any) => (
  <div className="space-y-2 group">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-4 group-focus-within:text-purple-600 transition-colors">{label}</label>
    <div className="relative">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-purple-600 transition-colors">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-14 pl-14 pr-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500/20 text-slate-900 dark:text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
      />
    </div>
  </div>
);

export default ProfileForm;
