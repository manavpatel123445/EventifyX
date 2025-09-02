import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Camera, Mail, User, Shield } from "lucide-react";
import SideBar from "../components/SideBar";


// Mock API (replace with backend API calls)
const fetchAdminProfile = async () => ({
  name: "",
  email: "",
  role: "",
  joinedAt: "2",
  avatar: "",
});

const updateAdminProfile = async (data: {
  name: string;
  password?: string;
  avatar?: string;
}) => {
  // Replace with backend PATCH API
  return { success: true, ...data };
};

const AdminProfilePage: React.FC = () => {
  const { data: profile } = useQuery({
    queryKey: ["admin-profile"],
    queryFn: fetchAdminProfile,
  });

  const [formData, setFormData] = useState({
    name: profile?.name || "",
    password: "",
    avatar: profile?.avatar || "",
  });

  const mutation = useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully!");
    },
    onError: () => {
      toast.error("Failed to update profile.");
    },
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <>

      <div className="min-h-screen bg-gray-50 py-6 px-4 flex">
        <aside className="w-64 bg-white border-r">
        <SideBar/>
      </aside>
        <div className="bg-white shadow-lg rounded-2xl w-full max-w-3xl p-8 mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative">
              <img
                src={formData.avatar || "https://via.placeholder.com/150"}
                alt="Admin Avatar"
                className="w-32 h-32 rounded-full border-4 border-gray-200"
              />
              <label className="absolute bottom-2 right-2 bg-red-500 p-2 rounded-full cursor-pointer">
                <Camera className="w-5 h-5 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files &&
                    handleChange("avatar", URL.createObjectURL(e.target.files[0]))
                  }
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold mt-4">{profile?.name}</h2>
            <p className="text-gray-600 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              {profile?.role}
            </p>
          </div>

          {/* Profile Details */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
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
            <div>
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                <Mail className="w-4 h-4" /> Email
              </label>
              <input
                type="email"
                value={profile?.email}
                disabled
                className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-gray-700 mb-1 block">New Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Enter new password"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              />
            </div>

            {/* Joined Date */}
            <div>
              <p className="text-sm text-gray-500">
                Joined on: {new Date(profile?.joinedAt || "").toDateString()}
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={mutation.isPending}
              className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
            >
              {mutation.isPending ? "Updating..." : "Update Profile"}
            </button>
          </form>
        </div>
      </div>
      
    </>
  );
};

export default AdminProfilePage;
