/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, UserCheck, UserX, UserCog, Mail, Phone, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";

import SideBar from "../components/SideBar";
import { type User } from "../../types/user";
import { getAllUsers, updateUserStatus, deleteUser, getDashboardStats } from "../../services/adminService";
import toast from "react-hot-toast";
import { capitalizeFirstLetter } from "../../utils/roles";

const UserListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [statusFilter] = useState<string>("all");
  const [roleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const limit = 9;

  const { data, isLoading, isRefetching } = useQuery({
    queryKey: ["admin-users", { search, status: statusFilter, role: roleFilter, page, limit }],
    queryFn: () => getAllUsers({ 
      search, 
      status: statusFilter !== 'all' ? statusFilter : undefined, 
      role: roleFilter !== 'all' ? roleFilter : undefined,
      page, 
      limit 
    }),
  });

  // Lightweight count queries for dynamic stats
    const { data: statsResp } = useQuery({ 
    queryKey: ["admin-dashboard-stats"], 
    queryFn: getDashboardStats 
  });
  const { data: activeResp } = useQuery({ 
    queryKey: ["admin-users-count", "active"], 
    queryFn: () => getAllUsers({ status: "active", page: 1, limit: 1 }) 
  });
  const { data: blockedResp } = useQuery({ 
    queryKey: ["admin-users-count", "blocked"], 
    queryFn: () => getAllUsers({ status: "blocked", page: 1, limit: 1 }) 
  });

  const users: User[] = (data as any)?.data?.users || [];
  const displayUsers: User[] = useMemo(() => users.filter(u => u.role !== "admin"), [users]);
  const totalUsers = (data as any)?.data?.pagination?.total || 0;
  const pages: number = (data as any)?.data?.pagination?.pages || 1;

  // Derive dynamic stats with safe fallbacks
  const stats = useMemo(() => {
    const s = (statsResp as any)?.data ?? statsResp;
    return {
      total: s?.users?.total ?? totalUsers,
      active: (activeResp as any)?.data?.pagination?.total ?? 0,
      blocked: (blockedResp as any)?.data?.pagination?.total ?? 0,
      pending: 0, // Add this if you track pending users
    };
  }, [statsResp, activeResp, blockedResp, totalUsers]);


  const pendingManagers = useMemo(() => {
    const s = (statsResp as any)?.data ?? statsResp;
    return s?.requests?.pending ?? 0;
  }, [statsResp]);

  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "blocked" }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success("User status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update user status");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
      toast.success("User deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete user");
    },
  });

  if (isLoading && !isRefetching) {
    return (
      <div className="flex min-h-screen">
        <SideBar />
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6">Users</h1>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r">
        <SideBar />
      </aside>
      <div className="flex-1 p-6 space-y-6">
        {/* Search + Filters */}
        <div className="flex justify-between items-center">
          <div className="relative w-1/3">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => { setPage(1); setSearch(e.target.value); }}
              className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring focus:ring-primary focus:outline-none"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <Users className="text-blue-500" />
              <div>
                <p className="text-gray-500">Total Users</p>
                <h3 className="text-xl font-bold">{totalUsers}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <UserCheck className="text-green-500" />
              <div>
                <p className="text-gray-500">Active Users</p>
                <h3 className="text-xl font-bold">{stats.active}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <UserCog className="text-yellow-500" />
              <div>
                <p className="text-gray-500">Pending Managers</p>
                <h3 className="text-xl font-bold">{pendingManagers}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <UserX className="text-red-500" />
              <div>
                <p className="text-gray-500">Suspended Users</p>
                <h3 className="text-xl font-bold">{stats.blocked}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

      {/* User Table */}
      <div className="bg-white shadow rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">Loading...</td></tr>
            ) : displayUsers.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">No users found</td></tr>
            ) : displayUsers.map((user) => (
              <tr key={user._id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 flex items-center gap-2">
                            {capitalizeFirstLetter(user.name)}
                </td>
                <td className="px-4 py-3">{user.email}</td>
                <td className="px-4 py-3">{user.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${
                      user.status === "active"
                        ? "bg-green-100 text-green-700"
                        : user.status === "blocked"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {user.status?.toString().toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 space-x-2">
                  <Button 
                    variant="link" 
                    className="text-blue-600" 
                    onClick={() => {
                      setSelectedUser(user);
                      setIsViewModalOpen(true);
                    }}
                  >
                    View
                  </Button>
                  {user.status === "active" ? (
                    <Button 
                      variant="link" 
                      className="text-yellow-600" 
                      disabled={updateStatusMutation.isPending} 
                      onClick={() => updateStatusMutation.mutate({ userId: user._id, status: "blocked" })}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button 
                      variant="link" 
                      className="text-green-600" 
                      disabled={updateStatusMutation.isPending} 
                      onClick={() => updateStatusMutation.mutate({ userId: user._id, status: "active" })}
                    >
                      Activate
                    </Button>
                  )}
                  <Button 
                    variant="link" 
                    className="text-red-600" 
                    disabled={deleteMutation.isPending} 
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${capitalizeFirstLetter(user.name)}?`)) {
                        deleteMutation.mutate(user._id);
                      }
                    }}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center p-4">
          <span className="text-sm text-gray-500">Page {page} of {pages}</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" disabled={page<=1} onClick={() => setPage(p=>Math.max(1,p-1))}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page>=pages} onClick={() => setPage(p=>p+1)}>Next</Button>
          </div>
        </div>
      </div>
      </div>

      {/* View User Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>User Details</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
                className="h-8 w-8 p-0"
              >
               
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl font-bold text-gray-600 border-2 border-gray-200">
                  {selectedUser.name.charAt(0).toUpperCase()}
                  {selectedUser.profileImage && (
                    <img 
                      src={selectedUser.profileImage} 
                      alt={selectedUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">{capitalizeFirstLetter(selectedUser.name)}</h3>
                    <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                      {selectedUser.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center text-sm text-gray-500">
                    <span 
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        selectedUser.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedUser.status?.toString().toUpperCase()}
                    </span>
                    {selectedUser.lastLogin && (
                      <>
                        <span className="mx-2 text-gray-300">•</span>
                        <span className="text-xs">
                          Last active: {new Date(selectedUser.lastLogin).toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Information */}
              <div className="space-y-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700">Account Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <div className="w-4 h-4 mr-3 mt-0.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 2a6 6 0 110 12 6 6 0 010-12z" clipRule="evenodd" />
                          <path fillRule="evenodd" d="M10 5a1 1 0 00-1 1v5a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">User ID</p>
                        <p className="text-sm text-gray-900 font-mono">{selectedUser._id}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="w-4 h-4 mr-3 mt-0.5 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Member Since</p>
                        <p className="text-sm text-gray-900">
                          {selectedUser?.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    {selectedUser.dateOfBirth && (
                      <div className="flex items-start">
                        <Calendar className="w-4 h-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Date of Birth</p>
                          <p className="text-sm text-gray-900">
                            {selectedUser.dateOfBirth instanceof Date 
                              ? selectedUser.dateOfBirth.toLocaleDateString('en-GB')
                              : new Date(selectedUser.dateOfBirth).toLocaleDateString('en-GB')
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Mail className="w-4 h-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-500">Email</p>
                        <a 
                          href={`mailto:${selectedUser.email}`} 
                          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {selectedUser.email}
                        </a>
                      </div>
                    </div>

                    {selectedUser.phone !== undefined && selectedUser.phone !== '' && (
                      <div className="flex items-start">
                        <Phone className="w-4 h-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Phone</p>
                          <a 
                            href={`tel:${selectedUser.phone}`}
                            className="text-sm text-gray-900 hover:text-blue-600"
                          >
                            {selectedUser.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedUser.lastLogin && (
                      <div className="flex items-start">
                        <Clock className="w-4 h-4 mr-3 mt-0.5 text-gray-400 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500">Last Active</p>
                          <p className="text-sm text-gray-900">
                            {new Date(selectedUser.lastLogin).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Activity */}
              {selectedUser.role === 'event_manager' && (
                <div className="space-y-4 border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-700">Event Manager Details</h4>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">Event Manager Status</h3>
                        <div className="mt-2 text-sm text-blue-700">
                          <p>
                            This user is registered as an event manager and can create and manage events on the platform.
                          </p>
                        </div>
                        {selectedUser.managedEvents && selectedUser.managedEvents.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-blue-800">Managed Events: {selectedUser.managedEvents.length}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant={selectedUser.status === "active" ? "destructive" : "default"}
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to ${selectedUser.status === 'active' ? 'block' : 'unblock'} this user?`)) {
                      updateStatusMutation.mutate({
                        userId: selectedUser._id,
                        status: selectedUser.status === "active" ? "blocked" : "active"
                      });
                      setIsViewModalOpen(false);
                    }
                  }}
                  disabled={updateStatusMutation.isPending}
                >
                  {selectedUser.status === "active" ? "Block User" : "Unblock User"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserListPage;
