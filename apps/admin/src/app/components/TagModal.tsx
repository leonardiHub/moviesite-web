"use client";

import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface Tag {
  id: string;
  tagName: string;
  tagCode: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moviesCount: number;
  seriesCount: number;
}

interface CreateTagData {
  tagName: string;
  tagCode: string;
}

interface UpdateTagData {
  tagName?: string;
  tagCode?: string;
}

interface TagModalProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: Tag | null;
  mode: "create" | "edit";
  onSubmit: (data: CreateTagData | UpdateTagData) => void;
}

export default function TagModal({
  isOpen,
  onClose,
  tag,
  mode,
  onSubmit,
}: TagModalProps) {
  const [formData, setFormData] = useState<CreateTagData>({
    tagName: "",
    tagCode: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form data when editing
  useEffect(() => {
    if (mode === "edit" && tag) {
      setFormData({
        tagName: tag.tagName,
        tagCode: tag.tagCode,
      });
    } else {
      setFormData({
        tagName: "",
        tagCode: "",
      });
    }
    setErrors({});
  }, [mode, tag]);

  const handleInputChange = (field: keyof CreateTagData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.tagName.trim()) {
      newErrors.tagName = "Tag name is required";
    } else if (formData.tagName.length > 100) {
      newErrors.tagName = "Tag name must be less than 100 characters";
    }

    if (!formData.tagCode.trim()) {
      newErrors.tagCode = "Tag code is required";
    } else if (formData.tagCode.length < 2 || formData.tagCode.length > 10) {
      newErrors.tagCode = "Tag code must be between 2 and 10 characters";
    } else if (!/^[A-Z0-9]+$/.test(formData.tagCode)) {
      newErrors.tagCode =
        "Tag code must contain only uppercase letters and numbers";
    }

    // Ensure code is always uppercase
    if (formData.tagCode !== formData.tagCode.toUpperCase()) {
      newErrors.tagCode = "Tag code must be in uppercase";
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
              {mode === "create" ? "Add New Tag" : "Edit Tag"}
            </h3>
            <p className="text-gray-500 mt-1">
              {mode === "create"
                ? "Create a new tag entry"
                : "Update tag information"}
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
          {/* Tag Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Name *
            </label>
            <input
              type="text"
              required
              value={formData.tagName}
              onChange={(e) => handleInputChange("tagName", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.tagName
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter tag name (e.g., Blockbuster, Oscar Winner, Cult Classic)"
            />
            {errors.tagName && (
              <p className="mt-1 text-sm text-red-600">{errors.tagName}</p>
            )}
          </div>

          {/* Tag Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Code *
            </label>
            <input
              type="text"
              required
              value={formData.tagCode}
              onChange={(e) =>
                handleInputChange("tagCode", e.target.value.toUpperCase())
              }
              maxLength={10}
              pattern="[A-Z0-9]*"
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono ${
                errors.tagCode
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Enter tag code (e.g., BLKB, OSCAR, CULT)"
            />
            {errors.tagCode && (
              <p className="mt-1 text-sm text-red-600">{errors.tagCode}</p>
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
              {mode === "create" ? "Create Tag" : "Update Tag"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
