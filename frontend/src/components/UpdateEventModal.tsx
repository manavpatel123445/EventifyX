/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateEvent, uploadImage } from "../services/eventService";
import { getAllCategories } from "../services/categoryService";
import type { EventRequestData, Event } from "../services/eventService";

interface UpdateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
}

const UpdateEventModal: React.FC<UpdateEventModalProps> = ({ isOpen, onClose, event }) => {
  const [form, setForm] = useState<EventRequestData>({
    title: "",
    description: "",
    category: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    venue: {
      name: "",
      address: "",
      city: "",
      state: "",
    },
    ticketPricing: [
      { type: "regular", price: 0, quantity: 0 }
    ],
    images: [],
    tags: [],
  });
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  const queryClient = useQueryClient();
  
  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
  });

  // Prefill form when event loads
  useEffect(() => {
    if (event) {
      setForm({
        title: event.title,
        description: event.description,
        category: (event.category as any)?._id || (event.category as any) || "",
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
        venue: event.venue,
        ticketPricing: event.ticketPricing.map(tp => ({
          type: tp.type as "regular" | "vip" | "premium",
          price: tp.price,
          quantity: tp.quantity,
        })),
        images: Array.isArray(event.images) ? event.images : [],
        tags: event.tags || [],
      });
      setNewImageFiles([]);
    }
  }, [event]);

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<EventRequestData> }) =>
      updateEvent(id, data),
    onSuccess: () => {
      toast.success("Event updated successfully 🎉");
      queryClient.invalidateQueries({ queryKey: ["manager-managed-events"] });
      onClose();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update event";
      toast.error(msg);
    },
  });

  if (!isOpen || !event) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVenueChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm({
      ...form,
      venue: { ...form.venue, [e.target.name]: e.target.value },
    });
  };

  const handleTicketChange = (
    index: number,
    field: string,
    value: string | number
  ) => {
    const updatedTickets = [...form.ticketPricing];
    (updatedTickets[index] as any)[field] = value;
    setForm({ ...form, ticketPricing: updatedTickets });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewImageFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingImage = (idx: number) => {
    const imgs = Array.isArray(form.images) ? [...form.images] : [];
    imgs.splice(idx, 1);
    setForm({ ...form, images: imgs });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUploading(true);
      let uploadedUrls: string[] = [];
      if (newImageFiles.length > 0) {
        uploadedUrls = await Promise.all(newImageFiles.map(f => uploadImage(f)));
      }
      const images = [ ...(form.images || []), ...uploadedUrls ];
      const payload: Partial<EventRequestData> = {
        ...form,
        images,
      };
      await mutation.mutateAsync({ id: event._id, data: payload });
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload images or update event");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Update Event</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border px-3 py-2 rounded-md"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded-md"
              required
            >
              <option value="">Select a category</option>
              {Array.isArray(categories) && categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Start Time</label>
              <input
                type="time"
                name="startTime"
                value={form.startTime}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium">End Time</label>
              <input
                type="time"
                name="endTime"
                value={form.endTime}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded-md"
              />
            </div>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-sm font-medium">Venue</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                name="name"
                value={form.venue.name}
                onChange={handleVenueChange}
                placeholder="Venue Name"
                className="border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                name="city"
                value={form.venue.city}
                onChange={handleVenueChange}
                placeholder="City"
                className="border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                name="state"
                value={form.venue.state}
                onChange={handleVenueChange}
                placeholder="State"
                className="border px-3 py-2 rounded-md"
              />
              <input
                type="text"
                name="address"
                value={form.venue.address}
                onChange={handleVenueChange}
                placeholder="Address"
                className="border px-3 py-2 rounded-md col-span-2"
              />
            </div>
          </div>

          {/* Tickets */}
          <div>
            <label className="block text-sm font-medium mb-2">Tickets</label>
            {form.ticketPricing.map((ticket, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2 mb-2">
                <select
                  value={ticket.type}
                  onChange={(e) =>
                    handleTicketChange(idx, "type", e.target.value)
                  }
                  className="border px-2 py-1 rounded-md"
                >
                  <option value="regular">Regular</option>
                  <option value="vip">VIP</option>
                  <option value="premium">Premium</option>
                </select>
                <input
                  type="number"
                  value={ticket.price}
                  onChange={(e) =>
                    handleTicketChange(idx, "price", Number(e.target.value))
                  }
                  placeholder="Price"
                  className="border px-2 py-1 rounded-md"
                />
                <input
                  type="number"
                  value={ticket.quantity}
                  onChange={(e) =>
                    handleTicketChange(idx, "quantity", Number(e.target.value))
                  }
                  placeholder="Quantity"
                  className="border px-2 py-1 rounded-md"
                />
              </div>
            ))}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">Images</label>
            {Array.isArray(form.images) && form.images.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {form.images.map((url, idx) => (
                  <div key={idx} className="relative">
                    <img src={url} className="h-16 w-24 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(idx)}
                      className="absolute -top-2 -right-2 bg-white border rounded-full h-6 w-6 text-xs"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="w-full border px-3 py-2 rounded-md"
            />
            {newImageFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">{newImageFiles.length} new image(s) selected</p>
            )}
          </div>

          <button
            type="submit"
            disabled={mutation.isPending || uploading}
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : mutation.isPending ? "Updating..." : "Update Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateEventModal;
