"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Genre {
  id: string;
  name: string;
  genreCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moviesCount: number;
  seriesCount: number;
}

interface CreateGenreData {
  genreName: string;
  genreCode: string;
}

interface UpdateGenreData {
  genreName?: string;
  genreCode?: string;
}

interface GenreModalProps {
  isOpen: boolean;
  onClose: () => void;
  genre?: Genre | null;
  mode: "create" | "edit";
  onSubmit: (data: CreateGenreData | UpdateGenreData) => void;
}

export default function GenreModal({
  isOpen,
  onClose,
  genre,
  mode,
  onSubmit,
}: GenreModalProps) {
  const [formData, setFormData] = useState<CreateGenreData>({
    genreName: "",
    genreCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && genre) {
      setFormData({
        genreName: genre.name,
        genreCode: genre.genreCode || "",
      });
    } else {
      setFormData({
        genreName: "",
        genreCode: "",
      });
    }
    setErrors({});
  }, [mode, genre]);

  const handleInputChange = (field: keyof CreateGenreData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.genreName.trim()) {
      newErrors.genreName = "Genre name is required";
    } else if (formData.genreName.length > 100) {
      newErrors.genreName = "Genre name must be less than 100 characters";
    }

    if (!formData.genreCode.trim()) {
      newErrors.genreCode = "Genre code is required";
    } else if (
      formData.genreCode.length < 2 ||
      formData.genreCode.length > 10
    ) {
      newErrors.genreCode = "Genre code must be between 2 and 10 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.genreCode)) {
      newErrors.genreCode =
        "Genre code must contain only uppercase letters and numbers";
    }

    // Ensure code is always uppercase
    if (formData.genreCode !== formData.genreCode.toUpperCase()) {
      newErrors.genreCode = "Genre code must be in uppercase";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 max-w-2xl w-11/12 shadow-2xl rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add New Genre" : "Edit Genre"}
            </h3>
            <p className="text-gray-500 mt-1">
              {mode === "create"
                ? "Create a new genre entry"
                : "Update genre information"}
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
          {/* Genre Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre Name *
            </label>
            <input
              type="text"
              required
              value={formData.genreName}
              onChange={(e) => handleInputChange("genreName", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.genreName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter genre name (e.g., Action, Drama, Comedy)"
            />
            {errors.genreName && (
              <p className="mt-1 text-sm text-red-600">{errors.genreName}</p>
            )}
          </div>

          {/* Genre Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genre Code *
            </label>
            <input
              type="text"
              required
              value={formData.genreCode}
              onChange={(e) =>
                handleInputChange("genreCode", e.target.value.toUpperCase())
              }
              maxLength={10}
              pattern="[A-Z0-9]*"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono ${
                errors.genreCode
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter genre code (e.g., ACT, DRM, COM)"
            />
            {errors.genreCode && (
              <p className="mt-1 text-sm text-red-600">{errors.genreCode}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Code will be automatically converted to uppercase
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
              {mode === "create" ? "Create Genre" : "Update Genre"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
