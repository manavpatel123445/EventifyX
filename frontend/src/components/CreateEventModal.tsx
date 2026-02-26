/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { createEventRequest, uploadImage } from "../services/eventService"; // ✅ adjust path
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { fetchCategories } from "../services/categoryService";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    city: "",
    state: "",
    ticketType: "regular" as  "regular" | "vip" | "premium",
    ticketPrice: "",
    ticketQuantity: "",
    
    tags: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();

  const { data: categories, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  // ✅ create event mutation
  const mutation = useMutation({
    mutationFn: createEventRequest,
    onSuccess: () => {
      toast.success("Event created successfully 🎉");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      onClose();
      if (onSuccess) onSuccess();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to create event";
      toast.error(msg);
    },
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImages(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optionally add validation here if needed
    // if (!validateForm()) {
    //   toast.error("Please fix the form errors before submitting");
    //   return;
    // }

    setUploading(true);
    try {
      let imageUrls: string[] = [];
      if (images.length > 0) {
        // Upload all images and collect their URLs
        imageUrls = await Promise.all(images.map(img => uploadImage(img)));
      }
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: {

          name: formData.venueName.trim(),
          address: formData.venueAddress.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
        },
        ticketPricing: [
          {
            type: formData.ticketType,
            price: parseFloat(formData.ticketPrice),
            quantity: parseInt(formData.ticketQuantity),
          },
        ],
        images: imageUrls,
        tags: formData.tags ? formData.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      };
      await mutation.mutateAsync(payload);
    } catch (err) {
      console.error("Event create error:", err);
      toast.error("Failed to create event");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-8 relative overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Create New Event</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            {categoriesLoading ? (
              <div className="text-gray-400 text-sm">Loading categories...</div>
            ) : categoriesError ? (
              <div className="text-red-500 text-sm">Failed to load categories</div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              >
                <option value="" disabled>Select a category</option>
                {categories && Array.isArray(categories) && categories.map((cat: any) => (
                  <option key={cat._id || cat.id} value={cat._id || cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Venue Name & Venue Address Row */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Venue Name</label>
              <input
                type="text"
                name="venueName"
                value={formData.venueName}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Venue Address</label>
              <input
                type="text"
                name="venueAddress"
                value={formData.venueAddress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* City & State Row */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">City</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">State</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Ticket Price & Total Tickets Row */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium">Ticket Price</label>
              <input
                type="number"
                name="ticketPrice"
                value={formData.ticketPrice}
                onChange={handleChange}
                required
                min="0"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Total Tickets</label>
              <input
                type="number"
                name="ticketQuantity"
                value={formData.ticketQuantity}
                onChange={handleChange}
                required
                min="1"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Description (Full Row) */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Dates & Times Row */}
          <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">End Time</label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium">Upload Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageSelect}
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="flex gap-2 mt-2 flex-wrap">
              {images.length > 0 &&
                images.map((img, i) => (
                  <span
                    key={i}
                    className="text-xs bg-gray-100 px-2 py-1 rounded-md"
                  >
                    {img.name}
                  </span>
                ))}
            </div>
          </div>
          <button
            type="submit"
            disabled={mutation.isPending || uploading}
            className="w-60 bg-red-500 text-white  rounded-md hover:bg-red-600 transition disabled:opacity-50"
          >
            {uploading
              ? "Uploading images..."
              : mutation.isPending
              ? "Creating..."
              : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventModal;

