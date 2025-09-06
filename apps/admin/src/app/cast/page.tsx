"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import CastModal from "../components/CastModal";
import ConfirmModal from "../components/ConfirmModal";

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

interface CastListResponse {
  items: CastMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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

export default function CastPage() {
  const [castMembers, setCastMembers] = useState<CastMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("castName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCast, setSelectedCast] = useState<CastMember | null>(null);
  const [castToDelete, setCastToDelete] = useState<CastMember | null>(null);

  // API base URL
  const API_BASE = `${
    process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
  }/v1`;

  // Get admin token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("admin_token");
  };

  // Fetch cast members from backend
  const fetchCastMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
        sortBy,
        sortOrder,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && {
          isActive: statusFilter === "active" ? "true" : "false",
        }),
      });

      const response = await fetch(`${API_BASE}/admin/cast?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: CastListResponse = await response.json();
        setCastMembers(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else if (response.status === 401) {
        setError("Unauthorized: Please log in again");
      } else {
        setError(`Failed to fetch cast members: ${response.status}`);
      }
    } catch (error) {
      setError("Failed to fetch cast members");
      console.error("Error fetching cast members:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch cast members on component mount and when dependencies change
  useEffect(() => {
    fetchCastMembers();
  }, [fetchCastMembers]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCastMembers();
  };

  // Handle status filter change
  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle create cast member
  const handleCreateCast = async (
    castData: CreateCastData | UpdateCastData
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Type guard to ensure we have the required fields for creation
      if (!("castName" in castData) || !castData.castName) {
        setError("Cast name is required");
        return;
      }

      // Always use FormData for both create and edit operations
      const formData = new FormData();

      // Always add the image file (even if it's undefined, it will be handled by the backend)
      if (castData.castImageFile) {
        formData.append("castImageFile", castData.castImageFile);
      }

      // Add the cast data as JSON string to preserve types
      const { castImageFile, ...dataWithoutFile } = castData;
      formData.append("castData", JSON.stringify(dataWithoutFile));

      const response = await fetch(`${API_BASE}/admin/cast`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create cast member: ${
            errorData.message || response.statusText
          }`
        );
      }

      const newCast = await response.json();
      setCastMembers((prev) => [newCast, ...prev]);
      setIsCreateModalOpen(false);
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to create cast member"
      );
      console.error("Error creating cast member:", error);
    }
  };

  // Handle edit cast member
  const handleEditCast = async (castData: CreateCastData | UpdateCastData) => {
    if (!selectedCast) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Always use FormData for both create and edit operations
      const formData = new FormData();

      // Always add the image file (even if it's undefined, it will be handled by the backend)
      if (castData.castImageFile) {
        formData.append("castImageFile", castData.castImageFile);
      }

      // Add the cast data as JSON string to preserve types
      const { castImageFile, ...dataWithoutFile } = castData;
      formData.append("castData", JSON.stringify(dataWithoutFile));

      const response = await fetch(
        `${API_BASE}/admin/cast/${selectedCast.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update cast member: ${
            errorData.message || response.statusText
          }`
        );
      }

      setIsEditModalOpen(false);
      setSelectedCast(null);
      fetchCastMembers();
      setError(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to update cast member"
      );
      console.error("Error updating cast member:", error);
    }
  };

  // Handle delete cast member
  const handleDeleteCast = async () => {
    if (!castToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/cast/${castToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setCastToDelete(null);
        fetchCastMembers();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete cast member");
      }
    } catch (error) {
      setError("Failed to delete cast member");
      console.error("Error deleting cast member:", error);
    }
  };

  // Open edit modal
  const openEditModal = (castMember: CastMember) => {
    setSelectedCast(castMember);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (castMember: CastMember) => {
    setCastToDelete(castMember);
    setIsDeleteModalOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedCast(null);
    setCastToDelete(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get cast image display with enhanced styling (exactly like movies page)
  const getCastImageDisplay = (castMember: CastMember) => {
    if (castMember.castImage) {
      console.log("castImage from backend:", castMember.castImage);
      return (
        <div className="relative group">
          <img
            src={castMember.castImage}
            alt={`${castMember.castName} photo`}
            className="w-12 h-12 rounded-full object-cover shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-md flex items-center justify-center">
        <UsersIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  };

  if (loading && castMembers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#fe6a3c]"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-transparent dark:text-gray-100">
      {/* Enhanced Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Search & Filters
          </h2>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Cast Members
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, description..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={handleStatusFilterChange}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end gap-2">
              <button
                type="submit"
                className="flex-1 bg-[#fe6a3c] text-white px-6 py-3 rounded-xl hover:bg-[#fe6a3c]/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
              >
                Search
              </button>
              {(searchTerm || statusFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("");
                    setCurrentPage(1);
                  }}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  title="Clear all filters"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Enhanced Cast Members Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Cast Members
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Showing {castMembers.length} of {total} cast members
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#fe6a3c] text-white px-6 py-3 rounded-xl hover:bg-[#fe6a3c]/90 transition-all duration-200 flex items-center gap-3 shadow-sm"
              title="Add Cast Member"
            >
              <PlusIcon className="w-6 h-6" />
              <span className="font-semibold">Add Cast Member</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/30">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  <button
                    onClick={() => handleSortChange("castName")}
                    className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    Cast Member
                    {sortBy === "castName" && (
                      <span className="text-blue-600">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Movies/Series
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {castMembers.map((castMember) => (
                <tr
                  key={castMember.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="max-w-xs">
                      <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {castMember.castName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getCastImageDisplay(castMember)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-gray-100 max-w-xs truncate">
                      {castMember.castDescription || "No description"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {castMember.moviesCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        castMember.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {castMember.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(castMember.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEditModal(castMember)}
                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150"
                        title="Edit cast member"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(castMember)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                        title="Delete cast member"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {castMembers.length === 0 && !loading && (
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No cast members found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter
                ? "Try adjusting your search or filter criteria."
                : "Get started by creating a new cast member."}
            </p>
            {!searchTerm && !statusFilter && (
              <div className="mt-6">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#fe6a3c] hover:bg-[#fe6a3c]/90"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Cast Member
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Pagination - Always show pagination info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 px-6 py-4 mt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-700 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">
                  {total > 0 ? (currentPage - 1) * 20 + 1 : 0}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(currentPage * 20, total)}
                </span>{" "}
                of <span className="font-medium">{total}</span> results
                {totalPages === 1 && total > 0 && (
                  <span className="text-gray-500 dark:text-gray-400 ml-2">
                    (All results on this page)
                  </span>
                )}
              </p>
            </div>
            <div>
              {totalPages > 1 ? (
                <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-all duration-150 ${
                          page === currentPage
                            ? "z-10 bg-[#fe6a3c]/10 dark:bg-[#fe6a3c]/20 border-[#fe6a3c] text-[#fe6a3c] shadow-sm"
                            : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <ChevronRightIcon className="h-5 w-5" />
                  </button>
                </nav>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/30 px-3 py-2 rounded-lg">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <CastModal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        mode="create"
        onSubmit={handleCreateCast}
      />

      {selectedCast && (
        <CastModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          mode="edit"
          castMember={selectedCast}
          onSubmit={handleEditCast}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        title="Delete Cast Member"
        message={`Are you sure you want to delete "${castToDelete?.castName}"? This action cannot be undone.`}
        onConfirm={handleDeleteCast}
        confirmText="Delete"
      />
    </div>
  );
}
