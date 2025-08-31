"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface CastMember {
  id: string;
  castName: string;
  castImage?: string;
  castDescription?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moviesCount: number;
}

interface CreateCastData {
  castName: string;
  castImage?: string;
  castImageFile?: File;
  castDescription?: string;
}

interface UpdateCastData {
  castName?: string;
  castImage?: string;
  castImageFile?: File;
  castDescription?: string;
}

interface CastModalProps {
  isOpen: boolean;
  onClose: () => void;
  castMember?: CastMember | null;
  mode: "create" | "edit";
  onSubmit: (data: CreateCastData | UpdateCastData) => void;
}

export default function CastModal({
  isOpen,
  onClose,
  castMember,
  mode,
  onSubmit,
}: CastModalProps) {
  const [formData, setFormData] = useState<CreateCastData>({
    castName: "",
    castImage: "",
    castDescription: "",
  });

  const [castImageFile, setCastImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && castMember) {
      setFormData({
        castName: castMember.castName,
        castImage: castMember.castImage || "",
        castDescription: castMember.castDescription || "",
      });
      setImagePreview(castMember.castImage || null);
      setCastImageFile(null);
    } else {
      setFormData({
        castName: "",
        castImage: "",
        castDescription: "",
      });
      setImagePreview(null);
      setCastImageFile(null);
    }
    setErrors({});
  }, [mode, castMember]);

  const handleInputChange = (field: keyof CreateCastData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleImageFileChange = (file: File | null) => {
    setCastImageFile(file);

    if (file) {
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      // Clear URL input when file is selected
      setFormData((prev) => ({ ...prev, castImage: "" }));
    } else {
      setImagePreview(null);
    }
  };

  const removeImage = () => {
    setCastImageFile(null);
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, castImage: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.castName.trim()) {
      newErrors.castName = "Cast member name is required";
    } else if (formData.castName.length > 100) {
      newErrors.castName = "Cast member name must be less than 100 characters";
    }

    // Validate image (either file or URL)
    if (castImageFile && !castImageFile.type.startsWith("image/")) {
      newErrors.castImage = "Please select a valid image file";
    }

    if (formData.castImage && formData.castImage.trim() && !castImageFile) {
      try {
        new URL(formData.castImage);
      } catch {
        newErrors.castImage = "Please enter a valid URL";
      }
    }

    if (formData.castDescription && formData.castDescription.length > 500) {
      newErrors.castDescription =
        "Description must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Always prepare FormData with image as binary
      const submitData: CreateCastData | UpdateCastData = {
        castName: formData.castName,
        castImageFile: castImageFile || undefined, // Always include image file if exists
        ...(formData.castDescription && {
          castDescription: formData.castDescription,
        }),
      };
      onSubmit(submitData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 max-w-2xl w-11/12 shadow-2xl rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add New Cast Member" : "Edit Cast Member"}
            </h3>
            <p className="text-gray-500 mt-1">
              {mode === "create"
                ? "Create a new cast member entry"
                : "Update cast member information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cast Member Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cast Member Name *
            </label>
            <input
              type="text"
              required
              value={formData.castName}
              onChange={(e) => handleInputChange("castName", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.castName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter cast member name (e.g., Tom Hanks, Meryl Streep)"
            />
            {errors.castName && (
              <p className="mt-1 text-sm text-red-600">{errors.castName}</p>
            )}
          </div>

          {/* Cast Member Image */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Cast Member Image
            </h4>
            <div className="flex items-center gap-6">
              {/* Current Image Display */}
              {imagePreview && (
                <div className="flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Cast image preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Image Upload Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleImageFileChange(e.target.files?.[0] || null)
                  }
                  className="hidden"
                  id="cast-image-upload"
                />
                <label
                  htmlFor="cast-image-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <PhotoIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </span>
                </label>
                {!imagePreview && (
                  <p className="text-sm text-gray-500 mt-2">
                    Recommended: 300x300px, JPG/PNG
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Cast Member Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.castDescription}
              onChange={(e) =>
                handleInputChange("castDescription", e.target.value)
              }
              rows={4}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.castDescription
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter a brief description or bio for the cast member..."
            />
            {errors.castDescription && (
              <p className="mt-1 text-sm text-red-600">
                {errors.castDescription}
              </p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Optional: Brief description or bio (max 500 characters)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {mode === "create" ? "Create Cast Member" : "Update Cast Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
