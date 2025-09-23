import React, { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Camera, Mail, User, Shield, Phone } from "lucide-react";
import SideBar from "../components/SideBar";
import { getProfile, updateProfile as updateProfileApi, type UserProfile } from "../../services/userService";
import { uploadAvatar as uploadImageToCloudinary } from "../../services/eventService";
import { capitalizeFirstLetter } from "../../utils/roles";

const AdminProfilePage: React.FC = () => {
  const { data, refetch, isLoading, isError, error } = useQuery<{ success: boolean; user: UserProfile }>({
    queryKey: ["admin-profile"],
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  const profile = data?.user;

  const [formData, setFormData] = useState({
    name: "",
    avatar: "",
    phone: "",
    birthDate: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        name: profile.name || "",
        avatar: profile.profileImage || "",
        phone: profile.phone || "",
        birthDate: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : "",
      }));
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (resp: { success: boolean; user: UserProfile }) => {
      toast.success("Profile updated successfully!");
      // Optimistically update stored user so Navbar and other components reflect changes immediately
      try {
        const storedUserStr = localStorage.getItem("user") || sessionStorage.getItem("user");
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          const updatedUser = { ...storedUser, ...resp.user };
          if (localStorage.getItem("user")) {
            localStorage.setItem("user", JSON.stringify(updatedUser));
          } else {
            sessionStorage.setItem("user", JSON.stringify(updatedUser));
          }
          // Notify listeners (Navbar listens to this custom event)
          window.dispatchEvent(new Event("userLogin"));
        }
      } catch { /* ignore */ }
      refetch();
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update profile.");
    },
  });

  // Removed password change for admin profile per request

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarFile = async (file: File) => {
    try {
      const url = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, avatar: url }));
      toast.success("Avatar uploaded");
      // Auto-persist avatar immediately
      updateProfileMutation.mutate({ profileImage: url });
    } catch (e: any) {
      const msg = e?.message || e?.response?.data?.message || "Failed to upload image";
      toast.error(msg);
      console.error("Avatar upload failed:", e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update name/avatar/phone/birth date
    updateProfileMutation.mutate({ 
      name: formData.name, 
      profileImage: formData.avatar, 
      phone: formData.phone || undefined,
      dateOfBirth: formData.birthDate || undefined,
    });
  };

  if (isLoading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-6 flex">
          <aside className="w-64 bg-white border-r">
            <SideBar />
          </aside>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 py-6 flex">
          <aside className="w-64 bg-white border-r">
            <SideBar />
          </aside>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-3">⚠️</div>
              <p className="text-gray-700 mb-2">Failed to load profile</p>
              <p className="text-gray-500 text-sm mb-4">{(error as any)?.message || "Please try again."}</p>
              <button
                onClick={() => refetch()}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>

      <div className="min-h-screen bg-gray-50 py-6 flex">
        <aside className="w-64 bg-white border-r">
        <SideBar/>
      </aside>
        <div className="flex-1 min-w-0 bg-white p-8">
          {/* Header */}
          <div className="flex flex-col items-start text-left mb-8">
            <div className="relative">
              <img
                src={(() => {
                  const src = formData.avatar || profile?.profileImage || "";
                  if (!src || src.includes("default-profile_qxqv2r.png")) return "/default-avatar.svg";
                  return src;
                })()}
                alt="Admin Avatar"
                className="w-32 h-32 rounded-full border-4 border-gray-200"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/default-avatar.svg"; }}
              />
              <label className="absolute bottom-2 right-2 bg-red-500 p-2 rounded-full cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarFile(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold mt-4">{profile?.name ? capitalizeFirstLetter(profile.name) : "Admin"}</h2>
            <p className="text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              {profile?.role || "admin"}
            </p>
          </div>

          {/* Profile Details */}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Name */}
            <div className="col-span-1">
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                <User className="w-4 h-4" /> Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Email - read only */}
            <div className="col-span-1">
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            {/* Phone */}
            <div className="col-span-1">
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                <Phone className="w-4 h-4" /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="+911234567890"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Birth Date */}
            <div className="col-span-1">
              <label className="text-gray-700 mb-1 block">Birth Date</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Joined Date */}
            <div className="col-span-1 lg:col-span-2">
              <p className="text-sm text-gray-500">
                Joined on: {profile?.createdAt ? new Date(profile.createdAt).toDateString() : "—"}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full lg:w-auto bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
      
    </>
  );
};

export default AdminProfilePage;
