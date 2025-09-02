/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import {
  submitEventManagerRequest,
  getUserRequest,
  deleteRequest,
   type SubmitRequestData,
  type EventManagerRequest,
} from "../services/eventManagerRequestService";

const EventManagerRequestForm: React.FC = () => {
  const [formData, setFormData] = useState<SubmitRequestData>({
    reason: "",
    experience: "",
  });
  const [showForm, setShowForm] = useState(false);

  const queryClient = useQueryClient();

  // Get existing request
  const { data: existingRequest, isLoading } = useQuery({
    queryKey: ["userEventManagerRequest"],
    queryFn: getUserRequest,
    retry: false,
  });

  // Submit request mutation
  const submitMutation = useMutation({
    mutationFn: submitEventManagerRequest,
    onSuccess: () => {
      toast.success("Event Manager request submitted successfully!");
      setFormData({ reason: "", experience: "" });
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ["userEventManagerRequest"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to submit request";
      toast.error(message);
    },
  });

  // Delete request mutation
  const deleteMutation = useMutation({
    mutationFn: deleteRequest,
    onSuccess: () => {
      toast.success("Request deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["userEventManagerRequest"] });
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to delete request";
      toast.error(message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim()) {
      toast.error("Please provide a reason for your request");
      return;
    }
    if (formData.reason.length < 10) {
      toast.error("Reason must be at least 10 characters long");
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (existingRequest?.data && window.confirm("Are you sure you want to delete your request?")) {
      deleteMutation.mutate(existingRequest.data._id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show existing request if exists
  if (existingRequest?.data) {
    const request: EventManagerRequest = existingRequest.data;
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6">Your Event Manager Request</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Status</h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Reason</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.reason}</p>
          </div>

          {request.experience && (
            <div>
              <h3 className="text-lg font-medium mb-2">Experience</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded">{request.experience}</p>
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium mb-2">Submitted</h3>
            <p className="text-gray-600">
              {new Date(request.submittedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>

          {request.adminResponse && (
            <div>
              <h3 className="text-lg font-medium mb-2">Admin Response</h3>
              <p className="text-gray-700 bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                {request.adminResponse}
              </p>
            </div>
          )}

          {request.processedAt && (
            <div>
              <h3 className="text-lg font-medium mb-2">Processed</h3>
              <p className="text-gray-600">
                {new Date(request.processedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}

          {request.status === "pending" && (
            <div className="pt-4 border-t">
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Request"}
              </button>
            </div>
          )}

          {request.status === "rejected" && (
            <div className="pt-4 border-t">
              <button
                onClick={() => handleDelete()}
                disabled={deleteMutation.isPending}
                className="mr-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Request"}
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Submit New Request
              </button>
            </div>
          )}

          {request.status === "approved" && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800">
                🎉 Congratulations! Your request has been approved. You are now an Event Manager!
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Become an Event Manager</h2>
        <p className="text-gray-600">
          Request to become an Event Manager to create and manage events on our platform.
        </p>
      </div>

      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
        >
          Request Event Manager Role
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Request *
            </label>
            <textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Please explain why you want to become an event manager..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              required
              minLength={10}
              maxLength={500}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.reason.length}/500 characters (minimum 10)
            </p>
          </div>

          <div>
            <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
              Relevant Experience (Optional)
            </label>
            <textarea
              id="experience"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="Tell us about your experience in event management, organization, or related fields..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              maxLength={1000}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.experience?.length || 0}/1000 characters
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitMutation.isPending}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {submitMutation.isPending ? "Submitting..." : "Submit Request"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EventManagerRequestForm;
