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
  TagIcon,
} from "@heroicons/react/24/outline";
import TagModal from "../components/TagModal";
import ConfirmModal from "../components/ConfirmModal";

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

interface TagListResponse {
  items: Tag[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateTagData {
  tagName: string;
  tagCode: string;
}

interface UpdateTagData {
  tagName?: string;
  tagCode?: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("tagName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);

  // API base URL
  const API_BASE = `${
    process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
  }/v1`;

  // Get admin token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("admin_token");
  };

  // Fetch tags from backend
  const fetchTags = useCallback(async () => {
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

      const response = await fetch(`${API_BASE}/admin/tags?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: TagListResponse = await response.json();
        setTags(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else if (response.status === 401) {
        setError("Unauthorized: Please log in again");
      } else {
        setError(`Failed to fetch tags: ${response.status}`);
      }
    } catch (error) {
      setError("Failed to fetch tags");
      console.error("Error fetching tags:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch tags on component mount and when dependencies change
  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTags();
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

  // Handle create tag
  const handleCreateTag = async (tagData: CreateTagData | UpdateTagData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Type guard to ensure we have the required fields for creation
      if (!("tagName" in tagData) || !tagData.tagName) {
        setError("Tag name is required");
        return;
      }

      const response = await fetch(`${API_BASE}/admin/tags`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        fetchTags();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create tag");
      }
    } catch (error) {
      setError("Failed to create tag");
      console.error("Error creating tag:", error);
    }
  };

  // Handle edit tag
  const handleEditTag = async (tagData: CreateTagData | UpdateTagData) => {
    if (!selectedTag) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`${API_BASE}/admin/tags/${selectedTag.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(tagData),
      });

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedTag(null);
        fetchTags();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update tag");
      }
    } catch (error) {
      setError("Failed to update tag");
      console.error("Error updating tag:", error);
    }
  };

  // Handle delete tag
  const handleDeleteTag = async () => {
    if (!tagToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(`${API_BASE}/admin/tags/${tagToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setTagToDelete(null);
        fetchTags();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete tag");
      }
    } catch (error) {
      setError("Failed to delete tag");
      console.error("Error deleting tag:", error);
    }
  };

  // Open edit modal
  const openEditModal = (tag: Tag) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedTag(null);
    setTagToDelete(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && tags.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Loading tags...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display with better styling */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 dark:border-red-500 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400 dark:text-red-300"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

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
                  Search Tags
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or code..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
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
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
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

        {/* Enhanced Tags Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Tags Catalog
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Showing {tags.length} of {total} tags
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#fe6a3c] text-white px-6 py-3 rounded-xl hover:bg-[#fe6a3c]/90 transition-all duration-200 flex items-center gap-3 shadow-sm"
                title="Add Tag"
              >
                <PlusIcon className="w-6 h-6" />
                <span className="font-semibold">Add Tag</span>
              </button>
            </div>
          </div>

          {tags.length === 0 && !loading ? (
            <div className="text-center py-12">
              <TagIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No tags found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first tag."}
              </p>
              {!searchTerm && !statusFilter && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#fe6a3c] hover:bg-[#fe6a3c]/90"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Tag
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSortChange("tagName")}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        Tag Name
                        {sortBy === "tagName" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      <button
                        onClick={() => handleSortChange("tagCode")}
                        className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        Tag Code
                        {sortBy === "tagCode" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Movies
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Series
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {tags.map((tag) => (
                    <tr
                      key={tag.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {tag.tagName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100 font-mono">
                          {tag.tagCode.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {tag.moviesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {tag.seriesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            tag.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {tag.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(tag.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(tag)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150"
                            title="Edit tag"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(tag)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                            title="Delete tag"
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
                              ? "z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-300 shadow-sm"
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
      </div>

      {/* Modals */}
      <TagModal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        mode="create"
        onSubmit={handleCreateTag}
      />

      {selectedTag && (
        <TagModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          mode="edit"
          tag={selectedTag}
          onSubmit={handleEditTag}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        title="Delete Tag"
        message={`Are you sure you want to delete "${tagToDelete?.tagName}"? This action cannot be undone.`}
        onConfirm={handleDeleteTag}
        confirmText="Delete"
      />
    </div>
  );
}
