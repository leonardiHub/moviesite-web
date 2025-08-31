"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, GlobeAltIcon, FlagIcon } from "@heroicons/react/24/outline";

interface Country {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  moviesCount: number;
}

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: Country | null;
  mode: "create" | "edit";
  onSave: (data: any) => void;
}

interface FormData {
  name: string;
  code: string;
}

export default function CountryModal({
  isOpen,
  onClose,
  country,
  mode,
  onSave,
}: CountryModalProps) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    code: "",
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when country changes
  useEffect(() => {
    if (country && mode === "edit") {
      setFormData({
        name: country.name || "",
        code: country.code || "",
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: "",
        code: "",
      });
    }
    setErrors({});
  }, [country, mode]);

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Country name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Country code is required";
    } else if (formData.code.length !== 2) {
      newErrors.code = "Country code must be exactly 2 characters";
    } else if (!/^[A-Z]{2}$/.test(formData.code.toUpperCase())) {
      newErrors.code = "Country code must be 2 uppercase letters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
      };

      await onSave(submitData);
    } catch (error) {
      console.error("Error saving country:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Handle code input with auto-uppercase
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    setFormData((prev) => ({
      ...prev,
      code: value,
    }));

    if (errors.code) {
      setErrors((prev) => ({
        ...prev,
        code: undefined,
      }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mode === "create" ? "Add New Country" : "Edit Country"}
                </h2>
                <p className="text-sm text-gray-600">
                  {mode === "create"
                    ? "Create a new country entry"
                    : `Editing ${country?.name}`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.name
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., United States"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Country Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISO Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleCodeChange}
                    maxLength={2}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      errors.code
                        ? "border-red-300 focus:ring-red-500"
                        : "border-gray-300"
                    }`}
                    placeholder="e.g., US"
                  />
                  {errors.code && (
                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    ISO 3166-1 alpha-2 code (2 letters)
                  </p>
                </div>
              </div>


            </div>





            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>
                      {mode === "create" ? "Create Country" : "Update Country"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
