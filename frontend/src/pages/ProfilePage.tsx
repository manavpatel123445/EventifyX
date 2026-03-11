/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { type RootState } from "../app/store";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ProfileForm from "../components/ProfileForm";
import { 
  Calendar, 
  Clock, 
  User,
  Heart,
  Ticket,
  Star,
  Shield,
  BarChart3,
  Upload
} from "lucide-react";
import toast from "react-hot-toast";
import { ROLES, getRoleDisplayName, getRoleStyles, hasRole, capitalizeFirstLetter } from "../utils/roleUtils";
import { NavLink } from "react-router-dom";
import { uploadAvatar } from "../services/eventService";
import { type UserProfile, getProfile, updateProfile, type UpdateProfileData } from "../services/userService";

interface UserStats {
  eventsCreated: number;
  eventsAttended: number;
  upcomingEvents: number;
  totalSpent: number;
  favoriteEvents: number;
}

type EventStatus = 'upcoming' | 'completed' | 'cancelled' | 'in_progress';

interface UserEvent {
  _id: string;
  title: string;
  date: string;
  status: EventStatus;
  type: 'created' | 'attending';
  venue: {
    name: string;
    city: string;
  };
}

const ProfilePage = () => {
  const { user: authUser } = useSelector((state: RootState) => state.auth);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [recentEvents] = useState<UserEvent[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  useEffect(() => {
    if (authUser) {
      loadUserData();
    }
  }, [authUser]);

  useEffect(() => {
    if (user?.profileImage) {
      setAvatarPreview(user.profileImage);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      const { success, user: userData } = await getProfile();
      if (success && userData) {
        setUser(userData);
        
        // Initialize stats (you can replace with actual API calls)
        const userStats: UserStats = {
          eventsCreated: hasRole(userData.role, ROLES.EVENT_MANAGER) ? 5 : 0,
          eventsAttended: 12,
          upcomingEvents: 3,
          totalSpent: 450,
          favoriteEvents: 8
        };
        
        setStats(userStats);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);
    
    try {
      const imageUrl = await uploadAvatar(file);
      if (imageUrl && user) {
        await updateProfile({ profileImage: imageUrl });
        setUser({ ...user, profileImage: imageUrl });
        toast.success('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to update profile picture');
      setAvatarPreview('');
    }
  };
  
  const handleProfileUpdate = async (data: UpdateProfileData) => {
    try {
      const { success, user: updatedUser } = await updateProfile(data);
      if (success && updatedUser) {
        setUser(updatedUser);
        toast.success('Profile updated successfully');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };
  

  const StatCard = ({ 
    icon: Icon, 
    title, 
    value, 
    color = "blue" 
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    color?: string;
  }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100 dark:bg-gray-700`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: EventStatus): string => {
    const statusStyles: Record<EventStatus, string> = {
      'upcoming': 'text-blue-600 bg-blue-100',
      'completed': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100',
      'in_progress': 'text-yellow-600 bg-yellow-100'
    };
    return statusStyles[status] || 'text-gray-600 bg-gray-100';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* User Overview Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
              <div className="flex items-center space-x-6">
                <div className="relative group">
                  <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt={user?.name || 'User'} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-10 w-10 text-white" />
                    )}
                  </div>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full cursor-pointer"
                    title="Change profile picture"
                  >
                    <Upload className="h-5 w-5 text-white" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </label>
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{user?.name ? capitalizeFirstLetter(user.name) : 'My Profile'}</h1>
                  <p className="text-purple-100">{user?.email || 'Manage your account and track your events'}</p>
                  {user?.role && (
                    <span 
                      className={`mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        getRoleStyles(user.role).bg
                      } ${getRoleStyles(user.role).text}`}
                    >
                      {capitalizeFirstLetter(getRoleDisplayName(user.role))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* User Stats */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 animate-pulse">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-gray-200 w-12 h-12"></div>
                      <div className="ml-4 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {user?.role === 'event_manager' && (
                  <StatCard
                    icon={Calendar}
                    title="Events Created"
                    value={stats.eventsCreated}
                    color="blue"
                  />
                )}
                <StatCard
                  icon={Ticket}
                  title="Events Attended"
                  value={stats.eventsAttended}
                  color="green"
                />
                <StatCard
                  icon={Clock}
                  title="Upcoming Events"
                  value={stats.upcomingEvents}
                  color="purple"
                />
                <StatCard
                  icon={Star}
                  title="Total Spent"
                  value={`$${stats.totalSpent}`}
                  color="emerald"
                />
                <StatCard
                  icon={Heart}
                  title="Favorite Events"
                  value={stats.favoriteEvents}
                  color="red"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Form */}
              <div className="lg:col-span-2">
                <ProfileForm 
                  showTitle={true}
                  user={user}
                  onUpdate={handleProfileUpdate}
                  isEditing={isEditing}
                  onEditToggle={() => setIsEditing(!isEditing)} onChangePassword={function (_currentPassword: string, _newPassword: string): Promise<void> {
                    throw new Error("Function not implemented.");
                  } }                />
              </div>

              {/* User Dashboard */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <NavLink to="/events">
                      <div className="flex items-center space-x-3">
                        
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Browse Events</span>
                      
                      </div>
                      </NavLink>
                    </button>
                    {user?.role !== ROLES.EVENT_MANAGER && (
                      <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Request Event</span>
                        </div>
                      </button>
                    )}
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <NavLink to="/my-tickets">
                      <div className="flex items-center space-x-3">
                        
                        <Ticket className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">My Tickets</span>
                      
                      </div>
                      </NavLink>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-red-600"/>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Favorites</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <div key={event._id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{capitalizeFirstLetter(event.title)}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {capitalizeFirstLetter(event.status)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                            {capitalizeFirstLetter(event.venue.name)}, {capitalizeFirstLetter(event.venue.city)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No recent events found
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">Account Status</h3>
                  </div>
                  <div className="text-sm text-gray-800 dark:text-gray-100">
                    <div className="flex items-center mb-2">
                      <span className="font-medium mr-2">Role:</span>
                      <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user?.role ? getRoleStyles(user.role).bg : 'bg-gray-100'
                      } ${user?.role ? getRoleStyles(user.role).text : 'text-gray-800'}`}
                    >
                      {user?.role ? capitalizeFirstLetter(getRoleDisplayName(user.role)) : 'User'}
                    </span>
                    </div>
                    <p className="mb-2"><strong>Status:</strong> {user?.status?.toUpperCase()}</p>
                    
                    {/* Role-specific benefits */}
                    {user?.role === ROLES.EVENT_MANAGER && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="font-medium text-blue-800 dark:text-blue-300 flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {capitalizeFirstLetter(getRoleDisplayName(user.role))} Benefits
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-blue-700 dark:text-blue-200">
                          <li className="flex items-start">
                            <span className="mr-1">*</span>
                            <span>Create and manage events</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-1">*</span>
                            <span>Access event analytics</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-1">*</span>
                            <span>Manage event registrations</span>
                          </li>
                        </ul>
                      </div>
                    )}
                    
                    {user?.role === ROLES.ADMIN && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="font-medium text-red-800 dark:text-red-300 flex items-center">
                          <Shield className="w-4 h-4 mr-2" />
                          Administrator Benefits
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-red-700 dark:text-red-200">
                          <li className="flex items-start">
                            <span className="mr-1">*</span>
                            <span>Full system access</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-1">*</span>
                            <span>User management</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-1">*</span>
                            <span>System configuration</span>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer /> 
    </>
  );
};

export default ProfilePage

