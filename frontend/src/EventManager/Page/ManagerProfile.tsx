import React, { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Camera, Mail, User, Shield, Lock, Phone } from 'lucide-react';
import toast from 'react-hot-toast';
import ManagerSideBar from '../components/ManagerSidebar';
import { getProfile, updateProfile as updateProfileApi, changePassword as changePasswordApi, type UserProfile } from '../../services/userService';
import { uploadAvatar as uploadImageToCloudinary } from '../../services/eventService';

const ManagerProfile: React.FC = () => {
  const { data, refetch, isLoading, isError, error } = useQuery<{ success: boolean; user: UserProfile}>({
    queryKey: ['manager-profile'],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const profile = data?.user;

  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    currentPassword: '',
    newPassword: '',
    phone: '',
    birthDate: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        name: profile.name || '',
        avatar: profile.profileImage || '',
        phone: profile.phone || '',
        birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      }));
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (resp: { success: boolean; user: UserProfile }) => {
      toast.success('Profile updated successfully!');
      // Update stored user so Navbar and other components reflect changes immediately
      try {
        const storedUserStr = localStorage.getItem('user') || sessionStorage.getItem('user');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          const updatedUser = { ...storedUser, ...resp.user };
          if (localStorage.getItem('user')) {
            localStorage.setItem('user', JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem('user', JSON.stringify(updatedUser));
          }
          window.dispatchEvent(new Event('userLogin'));
        }
      } catch { /* noop */ }
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update profile.');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    },
  });

  const handleChange = (field: string, value: string) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleAvatarFile = async (file: File) => {
    try {
      const url = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, avatar: url }));
      toast.success('Avatar uploaded');
      // Auto-persist avatar immediately
      updateProfileMutation.mutate({ profileImage: url });
    } catch {
      toast.error('Failed to upload image');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ 
      name: formData.name, 
      profileImage: formData.avatar,
      phone: formData.phone || undefined,
      dateOfBirth: formData.birthDate || undefined,
    });
    if (formData.currentPassword && formData.newPassword) {
      changePasswordMutation.mutate({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 flex">
        <aside className="w-64 bg-white border-r">
          <ManagerSideBar />
        </aside>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 flex">
        <aside className="w-64 bg-white border-r">
          <ManagerSideBar />
        </aside>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-3">⚠️</div>
            <p className="text-gray-700 mb-2">Failed to load profile</p>
            <p className="text-gray-500 text-sm mb-4">{(error as any)?.message || 'Please try again.'}</p>
            <button onClick={() => refetch()} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex">
      <aside className="w-64 bg-white border-r">
        <ManagerSideBar />
      </aside>
      <div className="flex-1 min-w-0 bg-white p-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="relative">
            <img
              src={formData.avatar || profile?.profileImage || ''}
              alt="Manager Avatar"
              className="w-32 h-32 rounded-full border-4 border-gray-200"
            />
            <label className="absolute bottom-2 right-2 bg-red-500 p-2 rounded-full cursor-pointer">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) handleAvatarFile(e.target.files[0]);
                }}
              />
            </label>
          </div>
          <h2 className="text-2xl font-bold mt-4">{profile?.name || 'Event Manager'}</h2>
          <p className="text-gray-600 flex items-center gap-2">
            <Shield className="w-4 h-4 text-red-500" />
            {profile?.role || 'event_manager'}
          </p>
        </div>

        {/* Profile form */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <User className="w-4 h-4" /> Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Mail className="w-4 h-4" /> Email
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+911234567890"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>

          {/* Birth Date */}
          <div>
            <label className="text-gray-700 mb-1 block">Birth Date</label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) => handleChange('birthDate', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4 lg:col-span-2">
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                <Lock className="w-4 h-4" /> Current Password
              </label>
              <input
                type="password"
                value={formData.currentPassword}
                onChange={(e) => handleChange('currentPassword', e.target.value)}
                placeholder="Enter current password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
            <div>
              <label className="text-gray-700 mb-1 block">New Password</label>
              <input
                type="password"
                value={formData.newPassword}
                onChange={(e) => handleChange('newPassword', e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Joined on: {profile?.createdAt ? new Date(profile.createdAt).toDateString() : '—'}</p>
          </div>

          <button
            type="submit"
            disabled={updateProfileMutation.isPending || changePasswordMutation.isPending}
            className="w-full lg:w-auto bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
          >
            {updateProfileMutation.isPending || changePasswordMutation.isPending ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ManagerProfile;