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
  FilmIcon,
} from "@heroicons/react/24/outline";
import GenreModal from "../components/GenreModal";
import ConfirmModal from "../components/ConfirmModal";

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

interface GenreListResponse {
  items: Genre[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateGenreData {
  genreName: string;
  genreCode: string;
}

interface UpdateGenreData {
  genreName?: string;
  genreCode?: string;
}

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("genreName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [genreToDelete, setGenreToDelete] = useState<Genre | null>(null);

  // API base URL
  const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE || 'http://51.79.254.237:4000'}/v1`;

  // Get admin token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("admin_token");
  };

  // Fetch genres from backend
  const fetchGenres = useCallback(async () => {
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

      const response = await fetch(`${API_BASE}/admin/genres?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data: GenreListResponse = await response.json();
        setGenres(data.items);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      } else if (response.status === 401) {
        setError("Unauthorized: Please log in again");
      } else {
        setError(`Failed to fetch genres: ${response.status}`);
      }
    } catch (error) {
      setError("Failed to fetch genres");
      console.error("Error fetching genres:", error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder]);

  // Fetch genres on component mount and when dependencies change
  useEffect(() => {
    fetchGenres();
  }, [fetchGenres]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchGenres();
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

  // Handle create genre
  const handleCreateGenre = async (
    genreData: CreateGenreData | UpdateGenreData
  ) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Type guard to ensure we have the required fields for creation
      if (!("genreName" in genreData) || !genreData.genreName) {
        setError("Genre name is required");
        return;
      }

      const response = await fetch(`${API_BASE}/admin/genres`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(genreData),
      });

      if (response.ok) {
        setIsCreateModalOpen(false);
        fetchGenres();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create genre");
      }
    } catch (error) {
      setError("Failed to create genre");
      console.error("Error creating genre:", error);
    }
  };

  // Handle edit genre
  const handleEditGenre = async (
    genreData: CreateGenreData | UpdateGenreData
  ) => {
    if (!selectedGenre) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/genres/${selectedGenre.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(genreData),
        }
      );

      if (response.ok) {
        setIsEditModalOpen(false);
        setSelectedGenre(null);
        fetchGenres();
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update genre");
      }
    } catch (error) {
      setError("Failed to update genre");
      console.error("Error updating genre:", error);
    }
  };

  // Handle delete genre
  const handleDeleteGenre = async () => {
    if (!genreToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/genres/${genreToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setIsDeleteModalOpen(false);
        setGenreToDelete(null);
        fetchGenres();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete genre");
      }
    } catch (error) {
      setError("Failed to delete genre");
      console.error("Error deleting genre:", error);
    }
  };

  // Open edit modal
  const openEditModal = (genre: Genre) => {
    setSelectedGenre(genre);
    setIsEditModalOpen(true);
  };

  // Open delete modal
  const openDeleteModal = (genre: Genre) => {
    setGenreToDelete(genre);
    setIsDeleteModalOpen(true);
  };

  // Close modals
  const closeModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedGenre(null);
    setGenreToDelete(null);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && genres.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading genres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Genres Management</h1>
              <p className="text-blue-100 text-lg">
                Manage your movie and series genres with ease
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 transition-all duration-200 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FilmIcon className="w-6 h-6" />
              <span className="font-semibold">Add Genre</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Error Display with better styling */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <FunnelIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              Search & Filters
            </h2>
          </div>

          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Genres
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by name or code..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
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
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
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
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200"
                    title="Clear all filters"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FilmIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Genres
                </p>
                <p className="text-2xl font-bold text-gray-900">{total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {genres.filter((g) => g.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-gray-900">
                  {genres.filter((g) => !g.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">
                  {genres.reduce(
                    (sum, genre) => sum + genre.moviesCount + genre.seriesCount,
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Genres Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h3 className="text-lg font-semibold text-gray-900">
              Genres Catalog
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Showing {genres.length} of {total} genres
            </p>
          </div>

          {genres.length === 0 && !loading ? (
            <div className="text-center py-12">
              <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No genres found
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first genre."}
              </p>
              {!searchTerm && !statusFilter && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Genre
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSortChange("name")}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Genre Name
                        {sortBy === "name" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      <button
                        onClick={() => handleSortChange("genreCode")}
                        className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      >
                        Genre Code
                        {sortBy === "genreCode" && (
                          <span className="text-blue-600">
                            {sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Movies
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Series
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {genres.map((genre) => (
                    <tr
                      key={genre.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {genre.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-mono">
                          {genre?.genreCode?.toUpperCase()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {genre.moviesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {genre.seriesCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            genre.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {genre.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(genre.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openEditModal(genre)}
                            className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors duration-150"
                            title="Edit genre"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(genre)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors duration-150"
                            title="Delete genre"
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
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-4 mt-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
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
                    <span className="text-gray-500 ml-2">
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
                      className="relative inline-flex items-center px-3 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
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
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600 shadow-sm"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    )}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-3 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                    >
                      <ChevronRightIcon className="h-5 w-5" />
                    </button>
                  </nav>
                ) : (
                  <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GenreModal
        isOpen={isCreateModalOpen}
        onClose={closeModals}
        mode="create"
        onSubmit={handleCreateGenre}
      />

      {selectedGenre && (
        <GenreModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          mode="edit"
          genre={selectedGenre}
          onSubmit={handleEditGenre}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        title="Delete Genre"
        message={`Are you sure you want to delete "${genreToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteGenre}
        confirmText="Delete"
      />
    </div>
  );
}
