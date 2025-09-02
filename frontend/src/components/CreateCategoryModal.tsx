/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { createCategory } from "../services/categoryService"; // ✅ adjust path

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateCategoryModal: React.FC<CreateCategoryModalProps> = ({ isOpen, onClose }) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Category added successfully 🎉");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onClose();
      setForm({ name: "", description: "" });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to add category";
      toast.error(msg);
    },
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4">Add New Category</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium">Category Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              placeholder="e.g. Music, Technology, Sports"
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
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-red-500"
              placeholder="Short description of the category"
            />
          </div>

          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition disabled:opacity-50"
          >
            {mutation.isPending ? "Adding..." : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal;
