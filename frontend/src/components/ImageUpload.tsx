import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { uploadImage } from "../services/eventService";
import toast from "react-hot-toast";

interface ImageUploadProps {
  onImagesChange: (imageUrls: string[]) => void;
  maxImages?: number;
  existingImages?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  onImagesChange, 
  maxImages = 5, 
  existingImages = [] 
}) => {
  const [images, setImages] = useState<string[]>(existingImages);
  const [uploading, setUploading] = useState<string[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList) => {
    if (images.length + files.length > maxImages) {
      toast.error(`You can only upload up to ${maxImages} images`);
      return;
    }

    const selectedFiles = Array.from(files);
    // Generate unique fileIds for each file ONCE
    const fileIds = selectedFiles.map((file, _idx) => `${file.name}_${file.size}_${file.lastModified}`);
    // Create previews
    const newPreviews: { [key: string]: string } = {};
    selectedFiles.forEach((file, idx) => {
      const fileId = fileIds[idx];
      newPreviews[fileId] = URL.createObjectURL(file);
    });
    setPreviews(prev => ({ ...prev, ...newPreviews }));

    // Upload files
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      const fileId = fileIds[i];
      // Validate file type
      if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
        toast.error(`${file.name} is not a valid image format`);
        continue;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }
      setUploading(prev => [...prev, fileId]);
      try {
        const imageUrl = await uploadImage(file);
        setImages(prev => {
          // Prevent duplicate images
          if (prev.includes(imageUrl)) return prev;
          const newImages = [...prev, imageUrl];
          setTimeout(() => onImagesChange(newImages), 0);
          return newImages;
        });
        toast.success(`${file.name} uploaded successfully`);
      } catch (error) {
        console.error("Upload error:", error);
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploading(prev => prev.filter(id => id !== fileId));
        // Clean up preview URL
        if (newPreviews[fileId]) {
          URL.revokeObjectURL(newPreviews[fileId]);
          setPreviews(prev => {
            const updated = { ...prev };
            delete updated[fileId];
            return updated;
          });
        }
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeImage = (imageUrl: string) => {
    setImages(prev => {
      const newImages = prev.filter(img => img !== imageUrl);
      onImagesChange(newImages);
      return newImages;
    });
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Event Images ({images.length}/{maxImages})
        </label>
        {images.length < maxImages && (
          <button
            type="button"
            onClick={openFileDialog}
            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Add Images
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Drop zone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition"
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">
            Drop images here or <span className="text-red-500 font-medium">browse</span>
          </p>
          <p className="text-sm text-gray-500">
            Support: JPG, PNG, GIF, WebP (max 10MB each)
          </p>
        </div>
      )}

      {/* Uploaded Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <img
                src={imageUrl}
                alt={`Event image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
              />
              <button
                type="button"
                onClick={() => removeImage(imageUrl)}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              {index === 0 && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black bg-opacity-50 text-white text-xs rounded">
                  Main Image
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(previews).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(previews).map(([fileId, previewUrl]) => (
            <div key={fileId} className="relative">
              <img
                src={previewUrl}
                alt="Uploading..."
                className="w-full h-32 object-cover rounded-lg border border-gray-200 opacity-50"
              />
              {uploading.includes(fileId) && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
                  <Loader2 className="h-8 w-8 text-white animate-spin" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No images placeholder */}
      {images.length === 0 && Object.keys(previews).length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No images uploaded yet</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
