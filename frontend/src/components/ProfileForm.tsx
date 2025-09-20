/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { type RootState } from "../app/store";
import { setUser } from "../app/slices/authslice";
import { getProfile, updateProfile, changePassword,type UserProfile,type UpdateProfileData,type ChangePasswordData } from "../services/userService";
import { uploadAvatar } from "../services/eventService";
import ImageUpload from "./ImageUpload";
import { Button } from "./ui/button";
import { Input } from "./ui/Input";
import toast from "react-hot-toast";

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

const ProfileForm = ({ showTitle = true, className = "" }: ProfileFormProps) => {
  const dispatch = useDispatch();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  useSelector((state: RootState) => state.auth);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Profile form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profileImage: ""
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [avatarInputKey, setAvatarInputKey] = useState(0);

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async (): Promise<void> => {
    try {
      const  response: { success: boolean; user: UserProfile } = await getProfile();
      if (response.success) {
        setProfile(response.user);
        setFormData({
          name: response.user.name || "",
          email: response.user.email || "",
          phone: response.user.phone || "",
          profileImage: response.user.profileImage || ""
        });
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setUpdating(true);
    try {
      const updateData: UpdateProfileData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        profileImage: formData.profileImage || undefined
      };

      const response = await updateProfile(updateData);
      if (response.success) {
        setProfile(response.user);
        dispatch(setUser(response.user as any));
        toast.success("Profile updated successfully");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setChangingPassword(true);
    try {
      const changeData: ChangePasswordData = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const response = await changePassword(changeData);
      if (response.success) {
        toast.success("Password changed successfully");
        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordForm(false);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, profileImage: imageUrl }));
  };

  const onSelectAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error("Please select a valid image (JPG, PNG, GIF, WebP)");
      setAvatarInputKey(prev => prev + 1);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large. Max size is 10MB");
      setAvatarInputKey(prev => prev + 1);
      return;
    }
    setUploadingAvatar(true);
    try {
      const url = await uploadAvatar(file);
      handleImageUpload(url);
      toast.success("Profile image uploaded");
    } catch (err: any) {
      toast.error(err?.message || "Failed to upload image");
    } finally {
      setUploadingAvatar(false);
      setAvatarInputKey(prev => prev + 1);
    }
  };

  if (loading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      {showTitle && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
      )}
      
      {/* Profile Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
        
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          {/* Profile Image */}
          <div className="flex items-center space-x-6">
            <div className="shrink-0">
              <img
                className="h-20 w-20 object-cover rounded-full ring-4 ring-gray-300"
                src={!formData.profileImage || formData.profileImage.includes("default-profile_qxqv2r.png") ? "/default-avatar.svg" : formData.profileImage}
                alt="Profile"
                onError={(e: any) => { e.currentTarget.src = "/default-avatar.svg"; }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
              <div className="flex items-center gap-3">
                <input
                  key={avatarInputKey}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={onSelectAvatar}
                />
                {uploadingAvatar && (
                  <span className="text-sm text-gray-600">Uploading...</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 10MB. JPG, PNG, GIF, WebP.</p>
            </div>
          </div>  

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1234567890"
            />
          </div>

          {/* Role & Status (Read Only) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <Input
                type="text"
                value={profile?.role?.replace('_', ' ').toUpperCase() || ""}
                className="bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Input
                type="text"
                value={profile?.status?.toUpperCase() || ""}
                className="bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={updating}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {updating ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Password</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPasswordForm(!showPasswordForm)}
          >
            {showPasswordForm ? "Cancel" : "Change Password"}
          </Button>
        </div>

        {showPasswordForm && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password *
              </label>
              <Input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password *
              </label>
              <Input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                minLength={6}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <Input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={changingPassword}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {changingPassword ? "Changing..." : "Change Password"}
            </Button>
          </form>
        )}
      </div>

      {/* Account Information */}
      {profile && (
        <div className="border-t pt-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Member Since:</span>
              <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-medium">Last Updated:</span>
              <p>{new Date(profile.updatedAt).toLocaleDateString()}</p>
            </div>
            {profile.lastLogin && (
              <div>
                <span className="font-medium">Last Login:</span>
                <p>{new Date(profile.lastLogin).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
