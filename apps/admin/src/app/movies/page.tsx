"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  PhotoIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import MovieModal from "../components/MovieModal";
import ConfirmModal from "../components/ConfirmModal";

interface Movie {
  id: string;
  title: string;
  originalTitle?: string;
  synopsis?: string;
  year?: number;
  runtime?: number;
  ageRating?: string;

  countries: Array<{
    movieId: string;
    countryId: string;
    country: {
      id: string;
      name: string;
      code: string;
      nativeName?: string;
      flag?: string;
      flagUrl?: string;
      description?: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  status: "draft" | "published" | "archived";
  rating?: number;
  director?: string;
  cast?: string[];
  genres: Array<{
    movieId: string;
    genreId: string;
    genre: { id: string; name: string };
  }>;
  tags: Array<{
    movieId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      code: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }>;
  artworks: Array<{
    id: string;
    movieId: string;
    episodeId?: string;
    seriesId?: string;
    seasonId?: string;
    kind: string;
    url: string;
    width?: number;
    height?: number;
  }>;
  posterUrl?: string;
  posterId?: string;
  videoUrl?: string;
  videoId?: string;
  videoQuality?: string;
  videoType?: string;
  trailerUrl?: string;
  s3Url?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    sources: number;
    subtitles: number;
  };
}

interface MovieListResponse {
  items: Movie[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface CreateMovieData {
  title: string;
  originalTitle?: string;
  synopsis?: string;
  year?: number;
  runtime?: number;
  ageRating?: string;

  countries?: string[];
  status: "draft" | "published" | "archived";
  rating?: number;
  director?: string;
  cast?: string[];
  genreIds?: string[];
  tagIds?: string[];
  posterFile?: File; // Added for file upload
  logoFile?: File;
  posterUrl?: string;
  logoUrl?: string;
  videoFile?: File; // Added for video file upload
  videoUrl?: string;
  videoQuality?: string;
  videoType?: string;
}

interface UpdateMovieData extends CreateMovieData {}

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [selectedGenreId, setSelectedGenreId] = useState<string>("");
  const [selectedTagId, setSelectedTagId] = useState<string>("");
  const [selectedCountryId, setSelectedCountryId] = useState<string>("");
  const [selectedCastId, setSelectedCastId] = useState<string>("");

  const [availableGenres, setAvailableGenres] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableCountries, setAvailableCountries] = useState<
    Array<{ id: string; name: string; code: string }>
  >([]);
  const [availableCast, setAvailableCast] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movieToDelete, setMovieToDelete] = useState<Movie | null>(null);

  // API base URL
  const API_BASE = `${
    process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
  }/v1`;

  // Get admin token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem("admin_token");
  };

  // Fetch movies from backend
  const fetchMovies = useCallback(async () => {
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
        limit: "5",
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(yearFilter && { year: yearFilter }),
        ...(selectedGenreId && { genreId: selectedGenreId }),
        ...(selectedTagId && { tagId: selectedTagId }),
        ...(selectedCountryId && { countryId: selectedCountryId }),
        ...(selectedCastId && { castId: selectedCastId }),
      });

      const response = await fetch(`${API_BASE}/admin/movies?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Authentication failed. Please login again.");
          return;
        }
        throw new Error(`Failed to fetch movies: ${response.statusText}`);
      }

      const data: MovieListResponse = await response.json();
      setMovies(data.items);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch movies");
    } finally {
      setLoading(false);
    }
  }, [
    currentPage,
    searchTerm,
    statusFilter,
    yearFilter,
    selectedGenreId,
    selectedTagId,
    selectedCountryId,
    selectedCastId,
  ]);

  // Load movies on component mount and when filters change
  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Fetch options for filters once
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const token = getAuthToken();
        if (!token) return;
        const headers = { Authorization: `Bearer ${token}` } as any;
        const [g, t, c, s] = await Promise.all([
          fetch(
            `${API_BASE}/admin/genres?page=1&limit=1000&sortBy=genreName&sortOrder=asc`,
            { headers }
          ),
          fetch(
            `${API_BASE}/admin/tags?page=1&limit=1000&sortBy=tagName&sortOrder=asc`,
            { headers }
          ),
          fetch(
            `${API_BASE}/admin/countries?page=1&limit=1000&sortBy=name&sortOrder=asc`,
            { headers }
          ),
          fetch(
            `${API_BASE}/admin/cast?page=1&limit=1000&sortBy=castName&sortOrder=asc`,
            { headers }
          ),
        ]);
        if (g.ok) {
          const j = await g.json();
          setAvailableGenres(j.items || []);
        }
        if (t.ok) {
          const j = await t.json();
          setAvailableTags(j.items || []);
        }
        if (c.ok) {
          const j = await c.json();
          setAvailableCountries(j.items || []);
        }
        if (s.ok) {
          const j = await s.json();
          setAvailableCast(j.items || []);
        }
      } catch (_) {
        // ignore
      }
    };
    fetchOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create new movie
  const handleCreateMovie = async (movieData: CreateMovieData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Always use FormData for both create and edit operations
      const formData = new FormData();

      // Add the poster file if provided
      if (movieData.posterFile) {
        formData.append("poster", movieData.posterFile);
      }

      // Add the logo file if provided
      if (movieData.logoFile) {
        // support both keys if backend expects either
        formData.append("logo", movieData.logoFile);
      }

      // Add the video file if provided
      if (movieData.videoFile) {
        formData.append("videoFile", movieData.videoFile);
      }

      // Add the movie data as JSON string to preserve arrays and types
      // Remove file objects when there are new files
      const { posterFile, logoFile, videoFile, ...dataWithoutFiles } =
        movieData;
      formData.append("movieData", JSON.stringify(dataWithoutFiles));

      const response = await fetch(`${API_BASE}/admin/movies`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to create movie: ${errorData.message || response.statusText}`
        );
      }

      const newMovie = await response.json();
      setMovies((prev) => [newMovie, ...prev]);
      setIsCreateModalOpen(false);
      setError(null);

      // Debug: Log what's being sent
      console.log("Movie data being sent:", movieData);
      console.log("Always using FormData for consistency");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create movie");
    }
  };

  // Update existing movie
  const handleEditMovie = async (movieData: UpdateMovieData) => {
    if (!selectedMovie) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      // Always use FormData for both create and edit operations
      const formData = new FormData();

      // Add the poster file if provided
      if (movieData.posterFile) {
        formData.append("poster", movieData.posterFile);
      }

      // Add the logo file if provided
      if (movieData.logoFile) {
        formData.append("logo", movieData.logoFile);
      }

      // Add the video file if provided
      if (movieData.videoFile) {
        formData.append("videoFile", movieData.videoFile);
      }

      // Add the movie data as JSON string to preserve arrays and types
      // Remove file objects when there are new files
      const { posterFile, logoFile, videoFile, ...dataWithoutFiles } =
        movieData;
      formData.append("movieData", JSON.stringify(dataWithoutFiles));

      const response = await fetch(
        `${API_BASE}/admin/movies/${selectedMovie.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Failed to update movie: ${errorData.message || response.statusText}`
        );
      }

      const updatedMovie = await response.json();
      setMovies((prev) =>
        prev.map((movie) =>
          movie.id === selectedMovie.id ? updatedMovie : movie
        )
      );
      setIsEditModalOpen(false);
      setSelectedMovie(null);
      setError(null);

      // Debug: Log what's being sent
      console.log("Movie update data being sent:", movieData);
      console.log("Always using FormData for consistency");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update movie");
    }
  };

  // Delete movie
  const handleDeleteMovie = async () => {
    if (!movieToDelete) return;

    try {
      const token = getAuthToken();
      if (!token) {
        setError("No authentication token found");
        return;
      }

      const response = await fetch(
        `${API_BASE}/admin/movies/${movieToDelete.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete movie: ${response.statusText}`);
      }

      setMovies((prev) =>
        prev.filter((movie) => movie.id !== movieToDelete.id)
      );
      setIsDeleteModalOpen(false);
      setMovieToDelete(null);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete movie");
    }
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchMovies();
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  // Handle year filter change
  const handleYearFilterChange = (year: string) => {
    setYearFilter(year);
    setCurrentPage(1);
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setYearFilter("");
    setCurrentPage(1);
    setSelectedGenreId("");
    setSelectedTagId("");
    setSelectedCountryId("");
    setSelectedCastId("");
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get poster display with enhanced styling
  const getPosterDisplay = (movie: Movie) => {
    if (movie.posterUrl) {
      console.log("posterUrl from backend:", movie.posterUrl);
      return (
        <div className="relative group">
          <img
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            className="w-20 h-28 object-cover rounded-lg shadow-md transition-all duration-200 group-hover:scale-105 group-hover:shadow-lg"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
        </div>
      );
    }
    return (
      <div className="w-20 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-md flex items-center justify-center">
        <PhotoIcon className="w-8 h-8 text-gray-400" />
      </div>
    );
  };

  if (loading && movies.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Loading movies...
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
                  Search Movies
                </label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title, director..."
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
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  value={yearFilter}
                  onChange={(e) => handleYearFilterChange(e.target.value)}
                  placeholder="Year"
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#fe6a3c] text-white px-6 py-3 rounded-xl hover:bg-[#fe6a3c]/90 transition-all duration-200 font-medium shadow-sm hover:shadow-md"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                  title="Clear all filters"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
              {/* Genres */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Genres
                </label>
                <select
                  value={selectedGenreId}
                  onChange={(e) => setSelectedGenreId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All genres</option>
                  {availableGenres.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Tags */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <select
                  value={selectedTagId}
                  onChange={(e) => setSelectedTagId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All tags</option>
                  {availableTags.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              {/* Countries */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Countries
                </label>
                <select
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All countries</option>
                  {availableCountries.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              {/* Cast */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cast
                </label>
                <select
                  value={selectedCastId}
                  onChange={(e) => setSelectedCastId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-[#fe6a3c] focus:border-transparent transition-all duration-200 dark:bg-gray-900 dark:text-gray-100"
                >
                  <option value="">All cast</option>
                  {availableCast.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Enhanced Movies Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Movie Catalog
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Showing {movies.length} of {total} movies
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="bg-[#fe6a3c] text-white px-4 py-2 rounded-lg hover:bg-[#fe6a3c]/90 transition-all duration-200 flex items-center gap-2 shadow-sm"
                title="Add Movie"
              >
                <PlusIcon className="w-5 h-5" />
                <span className="font-medium">Add Movie</span>
              </button>
            </div>
          </div>

          {movies.length === 0 && !loading ? (
            <div className="text-center py-12">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                No movies found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {searchTerm || statusFilter || yearFilter
                  ? "Try adjusting your search criteria or filters."
                  : "Get started by creating your first movie."}
              </p>
              {!searchTerm && !statusFilter && !yearFilter && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#fe6a3c] hover:bg-[#fe6a3c]/90"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Add Movie
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
                      Poster
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Movie Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Year
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Genres
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                  {movies.map((movie) => (
                    <tr
                      key={movie.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPosterDisplay(movie)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="max-w-xs">
                          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                            {movie.title}
                          </div>
                          {movie.originalTitle &&
                            movie.originalTitle !== movie.title && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                {movie.originalTitle}
                              </div>
                            )}
                          {movie.director && (
                            <div className="text-xs text-gray-400 mt-1">
                              Dir. {movie.director}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {movie.year || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {movie.rating ? (
                          <div className="flex items-center">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < Math.floor(movie.rating! / 2)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                </svg>
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">
                              {movie.rating}/10
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">
                            No rating
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            movie.status === "published"
                              ? "bg-green-100 text-green-800"
                              : movie.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {movie.status.charAt(0).toUpperCase() +
                            movie.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {movie.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre.genreId}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                            >
                              {genre.genre.name}
                            </span>
                          ))}
                          {movie.genres.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              +{movie.genres.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(movie.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedMovie(movie);
                              setIsEditModalOpen(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors duration-150"
                            title="Edit movie"
                          >
                            <PencilIcon className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setMovieToDelete(movie);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                            title="Delete movie"
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
      </div>

      {/* Modals */}
      <MovieModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        movie={null}
        mode="create"
        onSave={handleCreateMovie}
      />

      <MovieModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        movie={selectedMovie as any}
        mode="edit"
        onSave={handleEditMovie}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMovie}
        title="Delete Movie"
        message={`Are you sure you want to delete "${movieToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}
