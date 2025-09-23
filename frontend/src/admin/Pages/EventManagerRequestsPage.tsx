/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import Sidebar from "../components/SideBar";
import {
  getAllRequests,
  approveRequest,
  rejectRequest,
  type GetRequestsResponse,
} from "../../services/eventManagerRequestService";
import { capitalizeFirstLetter } from "../../utils/roles";

const EventManagerRequestsPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [currentPage, setCurrentPage] = useState(1);

  const queryClient = useQueryClient();

  // 🔥 Fetch Requests with normalized shape
  const { data, isLoading, error } = useQuery<GetRequestsResponse>({
    queryKey: ["eventManagerRequests", selectedStatus, currentPage],
    queryFn: () =>
      getAllRequests({
        status: selectedStatus === "all" ? undefined : selectedStatus,
        page: currentPage,
        limit: 10,
      }),
  });

  const requests = data?.data || [];
  const pagination = data?.pagination;

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ id, response }: { id: string; response?: string }) =>
      approveRequest(id, response),
    onSuccess: () => {
      toast.success("✅ Request approved");
      queryClient.invalidateQueries({ queryKey: ["eventManagerRequests"] });
    },
    onError: () => toast.error("❌ Failed to approve request"),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, response }: { id: string; response?: string }) =>
      rejectRequest(id, response),
    onSuccess: () => {
      toast.success("❌ Request rejected");
      queryClient.invalidateQueries({ queryKey: ["eventManagerRequests"] });
    },
    onError: () => toast.error("❌ Failed to reject request"),
  });

  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Event Manager Requests</h1>

        {/* Filters */}
        <select
          value={selectedStatus}
          onChange={(e) => {
            setSelectedStatus(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 border rounded mb-6"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>

        {/* Loading */}
        {isLoading && <p>Loading requests...</p>}
        {error && <p className="text-red-500">Failed to load</p>}

        {/* Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">User</th>
                <th className="px-4 py-2">Email</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Submitted</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No requests found.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2 flex items-center gap-2">
                      <img
                        src={req.user.profileImage || "/default-avatar.png"}
                        alt={req.user.name}
                        className="h-8 w-8 rounded-full"
                      />
                      {capitalizeFirstLetter(req.user.name)}
                    </td>
                    <td className="px-4 py-2">{req.user.email}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          req.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : req.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      {new Date(req.submittedAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              approveMutation.mutate({ id: req._id })
                            }
                            className="px-3 py-1 bg-green-500 text-white rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              rejectMutation.mutate({ id: req._id })
                            }
                            className="px-3 py-1 bg-red-500 text-white rounded"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="mt-4 flex justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded"
            >
              Prev
            </button>
            <p>
              Page {pagination.currentPage} of {pagination.totalPages}
            </p>
            <button
              onClick={() =>
                setCurrentPage((p) =>
                  Math.min(pagination.totalPages, p + 1)
                )
              }
              disabled={currentPage === pagination.totalPages}
              className="px-3 py-1 border rounded"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagerRequestsPage;
