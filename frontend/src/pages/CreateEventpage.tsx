/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ImageUpload from "../components/ImageUpload";
import { useQuery, useMutation } from "@tanstack/react-query";
import { fetchCategories } from "../services/categoryService";
import { createEventRequest,type EventRequestData } from "../services/eventService";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Calendar, MapPin, Users, DollarSign, Tag, FileText, Send } from "lucide-react";


// CategorySelect component using TanStack Query
interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const CategorySelect: React.FC<CategorySelectProps> = ({ value, onChange, error }) => {
  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });

  return (
    <div>
      <select
        className={`mt-1 w-full rounded-lg border px-3 py-2 text-gray-700 focus:border-red-500 focus:ring focus:ring-red-300 ${
          error ? "border-red-500" : ""
        }`}
        name="category"
        value={value}
        onChange={e => onChange(e.target.value)}
        required
      >
        <option value="" disabled>
          {isLoading ? "Loading categories..." : queryError ? "Error loading categories" : "Select category"}
        </option>
        {Array.isArray(data) &&
          data.map((cat: any) => (
            <option key={cat._id || cat.id} value={cat._id || cat.id}>
              {cat.name}
            </option>
          ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

const CreateEventPage: React.FC = () => {
  const navigate = useNavigate();
  
  // Form state
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
  
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Create event request mutation
  const createEventMutation = useMutation({
    mutationFn: createEventRequest,
    onSuccess: (_response) => {
      toast.success("Event request submitted successfully! Waiting for admin approval.");
      navigate("/my-events"); // Redirect to user's events page
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Failed to submit event request";
      toast.error(message);
      console.error("Event creation error:", error);
    }
  });

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Event title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.startDate) newErrors.startDate = "Start date is required";
    if (!formData.endDate) newErrors.endDate = "End date is required";
    if (!formData.startTime) newErrors.startTime = "Start time is required";
    if (!formData.endTime) newErrors.endTime = "End time is required";
    if (!formData.venueName.trim()) newErrors.venueName = "Venue name is required";
    if (!formData.venueAddress.trim()) newErrors.venueAddress = "Venue address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.ticketPrice || parseFloat(formData.ticketPrice) < 0) newErrors.ticketPrice = "Valid ticket price is required";
    if (!formData.ticketQuantity || parseInt(formData.ticketQuantity) < 1) newErrors.ticketQuantity = "Valid ticket quantity is required";

    // Date validation
    const startDate = formData.startDate ? new Date(formData.startDate) : null;
    const endDate = formData.endDate ? new Date(formData.endDate) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate && startDate <= today) newErrors.startDate = "Start date must be in the future";
    if (startDate && endDate && endDate <= startDate) newErrors.endDate = "End date must be after start date";

    // Time validation
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = "End time must be after start time";
    }

    // Registration deadline validation
    

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors before submitting");
      return;
    }

    const eventRequestData: EventRequestData = {
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
        state: formData.state.trim()
      },
      ticketPricing: [{
        type: formData.ticketType,
        price: parseFloat(formData.ticketPrice),
        quantity: parseInt(formData.ticketQuantity)
      }],
      images,
      tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(Boolean) : []
    };

    createEventMutation.mutate(eventRequestData);
  };

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Event Request</h1>
              <p className="text-gray-600">
                Submit your event for admin approval. Once approved, you'll become an Event Manager!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                  <FileText className="w-5 h-5 mr-2 text-red-500" />
                  Basic Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Enter event title"
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${
                        errors.title ? "border-red-500 bg-red-50" : ""
                      }`}
                      maxLength={100}
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Category *
                    </label>
                    <CategorySelect
                      value={formData.category}
                      onChange={(value) => handleInputChange("category", value)}
                      error={errors.category}
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Describe your event in detail"
                    rows={4}
                    className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition resize-none ${errors.description ? "border-red-500 bg-red-50" : ""}`}
                    maxLength={2000}
                  />
                  {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                  <p className="text-xs text-gray-500 mt-1">{formData.description.length}/2000 characters</p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                  <Calendar className="w-5 h-5 mr-2 text-red-500" />
                  Date & Time
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.startDate ? "border-red-500 bg-red-50" : ""}`}
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange("endDate", e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.endDate ? "border-red-500 bg-red-50" : ""}`}
                      min={formData.startDate || new Date().toISOString().split('T')[0]}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
                  </div>

                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => handleInputChange("startTime", e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.startTime ? "border-red-500 bg-red-50" : ""}`}
                    />
                    {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => handleInputChange("endTime", e.target.value)}
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.endTime ? "border-red-500 bg-red-50" : ""}`}
                    />
                    {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
                  </div>
                </div>

                
              </div>

              {/* Venue Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                  <MapPin className="w-5 h-5 mr-2 text-red-500" />
                  Venue Information
                </h3>
                
                <div className="space-y-6">
                  {/* Venue Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Name *
                    </label>
                    <input
                      type="text"
                      value={formData.venueName}
                      onChange={(e) => handleInputChange("venueName", e.target.value)}
                      placeholder="Enter venue name"
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.venueName ? "border-red-500 bg-red-50" : ""}`}
                    />
                    {errors.venueName && <p className="text-red-500 text-sm mt-1">{errors.venueName}</p>}
                  </div>

                  {/* Venue Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Venue Address *
                    </label>
                    <input
                      type="text"
                      value={formData.venueAddress}
                      onChange={(e) => handleInputChange("venueAddress", e.target.value)}
                      placeholder="Enter full venue address"
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.venueAddress ? "border-red-500 bg-red-50" : ""}`}
                    />
                    {errors.venueAddress && <p className="text-red-500 text-sm mt-1">{errors.venueAddress}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* City */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City *
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        placeholder="Enter city"
                        className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.city ? "border-red-500 bg-red-50" : ""}`}
                      />
                      {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                    </div>

                    {/* State */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State *
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange("state", e.target.value)}
                        placeholder="Enter state"
                        className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.state ? "border-red-500 bg-red-50" : ""}`}
                      />
                      {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                  <DollarSign className="w-5 h-5 mr-2 text-red-500" />
                  Ticket Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Ticket Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Type
                    </label>
                    <select
                      value={formData.ticketType}
                      onChange={(e) => handleInputChange("ticketType", e.target.value)}
                      className="w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition"
                    >
                      <option value="regular">Regular</option>
                      <option value="early_bird">Early Bird</option>
                      <option value="vip">VIP</option>
                      <option value="premium">Premium</option>
                    </select>
                  </div>

                  {/* Ticket Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={formData.ticketPrice}
                      onChange={(e) => handleInputChange("ticketPrice", e.target.value)}
                      placeholder="0.00"
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.ticketPrice ? "border-red-500 bg-red-50" : ""}`}
                      min="0"
                      step="0.01"
                    />
                    {errors.ticketPrice && <p className="text-red-500 text-sm mt-1">{errors.ticketPrice}</p>}
                  </div>

                  {/* Ticket Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Tickets *
                    </label>
                    <input
                      type="number"
                      value={formData.ticketQuantity}
                      onChange={(e) => handleInputChange("ticketQuantity", e.target.value)}
                      placeholder="Enter quantity"
                      className={`w-full rounded-lg border px-4 py-3 text-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none transition ${errors.ticketQuantity ? "border-red-500 bg-red-50" : ""}`}
                      min="1"
                    />
                    {errors.ticketQuantity && <p className="text-red-500 text-sm mt-1">{errors.ticketQuantity}</p>}
                  </div>
                </div>
              </div>

              {/* Event Images */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="flex items-center text-lg font-semibold text-gray-900 mb-4">
                  <Tag className="w-5 h-5 mr-2 text-red-500" />
                  Event Images
                </h3>
                
                <ImageUpload
                  onImagesChange={setImages}
                  maxImages={1}
                  existingImages={images}
                />
              </div>

              
             
              {/* Submit Button */}
              <div className="flex items-center justify-center pt-6">
                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="flex items-center justify-center px-8 py-4 bg-red-500 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-red-600 focus:ring-4 focus:ring-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
                >
                  {createEventMutation.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Submit Event Request
                    </>
                  )}
                </button>
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <Users className="h-5 w-5 text-blue-500 mt-0.5" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-900">
                      What happens next?
                    </h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        Your event request will be reviewed by our admin team. Once approved, you'll automatically become an Event Manager and your event will be published on our platform.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CreateEventPage;
