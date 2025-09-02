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
  Star
} from "lucide-react";
import toast from "react-hot-toast";

interface UserStats {
  eventsCreated: number;
  eventsAttended: number;
  upcomingEvents: number;
  totalSpent: number;
  favoriteEvents: number;
}

interface UserEvent {
  _id: string;
  title: string;
  date: string;
  status: string;
  type: 'created' | 'attending';
  venue: {
    name: string;
    city: string;
  };
}

const ProfilePage = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentEvents, setRecentEvents] = useState<UserEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Mock user stats - replace with actual API calls
      const mockStats: UserStats = {
        eventsCreated: user?.role === 'event_manager' ? 5 : 0,
        eventsAttended: 12,
        upcomingEvents: 3,
        totalSpent: 450,
        favoriteEvents: 8
      };

      const mockEvents: UserEvent[] = [
        {
          _id: "1",
          title: "Jazz Night",
          date: "2024-09-15",
          status: "upcoming",
          type: "attending",
          venue: { name: "Blue Note", city: "New York" }
        },
        {
          _id: "2",
          title: "Food Festival",
          date: "2024-08-10",
          status: "completed",
          type: "attending",
          venue: { name: "Central Park", city: "New York" }
        }
      ];
      
      setStats(mockStats);
      setRecentEvents(mockEvents);
    } catch (error: any) {
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color = "blue" }: {
    icon: any;
    title: string;
    value: string | number;
    color?: string; 
  }) => (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center">
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "text-blue-600 bg-blue-100";
      case "completed": return "text-green-600 bg-green-100";
      case "cancelled": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {/* User Overview Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/10 rounded-full">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">My Profile</h1>
                  <p className="text-purple-100">Manage your account and track your events</p>
                </div>
              </div>
            </div>

            {/* User Stats */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
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
                <ProfileForm showTitle={true} />
              </div>

              {/* User Dashboard */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Browse Events</span>
                      </div>
                    </button>
                    {user?.role !== 'event_manager' && (
                      <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium">Request Event</span>
                        </div>
                      </button>
                    )}
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Ticket className="h-5 w-5 text-purple-600" />
                        <span className="text-sm font-medium">My Tickets</span>
                      </div>
                    </button>
                    <button className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium">Favorites</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Events</h3>
                  <div className="space-y-3">
                    {recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <div key={event._id} className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mb-2">
                            {event.venue.name}, {event.venue.city}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No recent events found
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Status */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <div className="flex items-center space-x-3 mb-3">
                    <User className="h-5 w-5 text-blue-600" />
                    <h3 className="text-sm font-semibold text-blue-800">Account Status</h3>
                  </div>
                  <div className="text-sm text-blue-700">
                    <p><strong>Role:</strong> {user?.role?.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Status:</strong> {user?.status?.toUpperCase()}</p>
                    {user?.role === 'event_manager' && (
                      <div className="mt-3">
                        <p className="font-medium">Event Manager Benefits:</p>
                        <ul className="mt-1 space-y-1 text-xs">
                          <li>• Create and manage events</li>
                          <li>• Access event analytics</li>
                          <li>• Manage attendee lists</li>
                          <li>• Generate revenue reports</li>
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
