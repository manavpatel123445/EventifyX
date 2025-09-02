/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Users, UserCheck, UserX, UserCog } from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";

import SideBar from "../components/SideBar";
import { getAllUsers, type User, updateUserStatus, deleteUser, getDashboardStats } from "../../services/adminService";
import toast from "react-hot-toast";

const UserListPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit =10;

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", { search, page, limit }],
    queryFn: () => getAllUsers({ search, page, limit }),
  });

  // Lightweight count queries for dynamic stats
  const { data: statsResp } = useQuery({ queryKey: ["admin-dashboard-stats"], queryFn: getDashboardStats });
  const { data: activeResp } = useQuery({ queryKey: ["admin-users-count", "active"], queryFn: () => getAllUsers({ status: "active", page: 1, limit: 1 }) });
  const { data: blockedResp } = useQuery({ queryKey: ["admin-users-count", "blocked"], queryFn: () => getAllUsers({ status: "blocked", page: 1, limit: 1 }) });

  const users: User[] = (data as any)?.data?.users || [];
  const displayUsers: User[] = useMemo(() => users.filter(u => u.role !== "admin"), [users]);
  const pages: number = (data as any)?.data?.pagination?.pages || 1;

  // Derive dynamic stats with safe fallbacks
  const totalUsers = useMemo(() => {
    const s = (statsResp as any)?.data ?? statsResp;
    return s?.users?.total ?? (data as any)?.data?.pagination?.total ?? users.length;
  }, [statsResp, data, users.length]);

  const activeUsers = useMemo(() => {
    const total = (activeResp as any)?.data?.pagination?.total
      ?? (activeResp as any)?.data?.pagination?.totalUsers
      ?? users.filter(u => u.status === "active").length;
    return total;
  }, [activeResp, users]);

  const suspendedUsers = useMemo(() => {
    const total = (blockedResp as any)?.data?.pagination?.total
      ?? (blockedResp as any)?.data?.pagination?.totalUsers
      ?? users.filter(u => u.status === "blocked").length;
    return total;
  }, [blockedResp, users]);

  const pendingManagers = useMemo(() => {
    const s = (statsResp as any)?.data ?? statsResp;
    return s?.requests?.pending ?? 0;
  }, [statsResp]);

  const queryClient = useQueryClient();

  const statusMutation = useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: "active" | "blocked" }) => updateUserStatus(userId, status),
    onSuccess: () => {
      toast.success("User status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    onError: () => toast.error("Failed to update user status"),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser(userId),
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-users-count"] });
      queryClient.invalidateQueries({ queryKey: ["admin-dashboard-stats"] });
    },
    onError: () => toast.error("Failed to delete user"),
  });

  return (
    <>
    
    <div className="flex min-h-screen">
      <aside className="w-64 bg-white border-r">
        <SideBar />
      </aside>
    <div className="p-6 space-y-6">
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
              <h3 className="text-xl font-bold">{activeUsers}</h3>
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
              <h3 className="text-xl font-bold">{suspendedUsers}</h3>
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
                            {user.name}
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
                  <Button variant="link" className="text-blue-600" onClick={() => alert(`View user: ${user.name}`)}>View</Button>
                  {user.status === "active" ? (
                    <Button variant="link" className="text-yellow-600" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ userId: user._id, status: "blocked" })}>Deactivate</Button>
                  ) : (
                    <Button variant="link" className="text-green-600" disabled={statusMutation.isPending} onClick={() => statusMutation.mutate({ userId: user._id, status: "active" })}>Activate</Button>
                  )}
                  <Button variant="link" className="text-red-600" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(user._id)}>Delete</Button>
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
    </div>
    </>
  );
};

export default UserListPage;
