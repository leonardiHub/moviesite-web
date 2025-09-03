"use client";

import { useState, useEffect } from "react";
import { XMarkIcon, PhotoIcon } from "@heroicons/react/24/outline";

interface Country {
  id: string;
  name: string;
  code: string;
  nativeName?: string;
}

interface Language {
  id: string;
  name: string;
  code: string;
  nativeName?: string;
}

interface Movie {
  id: string;
  title: string;
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
  trailerUrl?: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    sources: number;
    subtitles: number;
  };
}

interface CreateMovieData {
  title: string;
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
  posterFile?: File;
  posterUrl?: string;
  videoFile?: File;
  trailerUrl?: string;
}

interface MovieModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie?: Movie | null;
  mode: "create" | "edit";
  onSave: (movie: CreateMovieData) => void;
}

const availableAgeRatings = [
  "G",
  "PG",
  "PG-13",
  "R",
  "NC-17",
  "TV-Y",
  "TV-Y7",
  "TV-G",
  "TV-PG",
  "TV-14",
  "TV-MA",
];

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function MovieModal({
  isOpen,
  onClose,
  movie,
  mode,
  onSave,
}: MovieModalProps) {
  const [formData, setFormData] = useState<CreateMovieData>({
    title: "",
    synopsis: "",
    year: new Date().getFullYear(),
    runtime: undefined,
    ageRating: "",

    countries: [],
    status: "draft",
    rating: undefined,
    director: "",
    cast: [],
    genreIds: [],
    tagIds: [],
    trailerUrl: "",
  });

  const [newGenre, setNewGenre] = useState("");
  const [newTag, setNewTag] = useState("");
  const [newCastMember, setNewCastMember] = useState("");

  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(false);
  const [isLoadingGenres, setIsLoadingGenres] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingCast, setIsLoadingCast] = useState(false);

  // These will be populated from API calls
  const [availableGenres, setAvailableGenres] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableTags, setAvailableTags] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [availableCast, setAvailableCast] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [selectedPosterFile, setSelectedPosterFile] = useState<File | null>(
    null
  );
  const [posterPreview, setPosterPreview] = useState<string | null>(null);
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  useEffect(() => {
    console.log("movie", movie);
  }, [movie]);

  // Fetch countries from API
  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoadingCountries(true);
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          console.error("No authentication token found");
          setIsLoadingCountries(false);
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
          }/v1/admin/countries?page=1&limit=1000&sortBy=name&sortOrder=asc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCountries(data.items || []);
        } else if (response.status === 401) {
          console.error("Unauthorized: Please log in again");
        } else {
          console.error("Failed to fetch countries:", response.status);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      } finally {
        setIsLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  // Fetch genres from API
  useEffect(() => {
    const fetchGenres = async () => {
      setIsLoadingGenres(true);
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          console.error("No authentication token found");
          setIsLoadingGenres(false);
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
          }/v1/admin/genres?page=1&limit=1000&sortBy=genreName&sortOrder=asc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          setAvailableGenres(data.items || []);
        } else if (response.status === 401) {
          console.error("Unauthorized: Please log in again");
        } else {
          console.error("Failed to fetch genres:", response.status);
        }
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoadingGenres(false);
      }
    };

    fetchGenres();
  }, []);

  // Fetch tags from API
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoadingTags(true);
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          console.error("No authentication token found");
          setIsLoadingTags(false);
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
          }/v1/admin/tags?page=1&limit=1000&sortBy=tagName&sortOrder=asc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          setAvailableTags(data.items || []);
        } else if (response.status === 401) {
          console.error("Unauthorized: Please log in again");
        } else {
          console.error("Failed to fetch tags:", response.status);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
      } finally {
        setIsLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Fetch cast from API
  useEffect(() => {
    const fetchCast = async () => {
      setIsLoadingCast(true);
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) {
          console.error("No authentication token found");
          setIsLoadingCast(false);
          return;
        }

        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_BASE || "http://51.79.254.237:4000"
          }/v1/admin/cast?page=1&limit=1000&sortBy=castName&sortOrder=asc`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();

          setAvailableCast(data.items || []);
        } else if (response.status === 401) {
          console.error("Unauthorized: Please log in again");
        } else {
          console.error("Failed to fetch cast:", response.status);
        }
      } catch (error) {
        console.error("Error fetching cast:", error);
      } finally {
        setIsLoadingCast(false);
      }
    };

    fetchCast();
  }, []);

  useEffect(() => {
    if (movie && mode === "edit") {
      // Handle countries - extract countryId from MovieCountry objects
      let countryIds: string[] = [];

      if (movie.countries && movie.countries.length > 0) {
        // Countries are MovieCountry objects with nested country data
        countryIds = movie.countries.map((mc) => mc.countryId);
      }

      // Extract genre IDs from the nested structure
      const genreIds =
        movie.genres && movie.genres.length > 0
          ? movie.genres
              .map((g) => g.genreId) // Extract genreId from { movieId, genreId, genre: { id, name } }
              .filter(Boolean) // Remove any undefined/null values
          : [];

      // Extract tag IDs from the nested structure
      const tagIds =
        movie.tags && movie.tags.length > 0
          ? movie.tags
              .map((t) => t.tagId) // Extract tagId from { movieId, tagId, tag: { id, name, code, ... } }
              .filter(Boolean) // Remove any undefined/null values
          : [];

      setFormData({
        title: movie.title,
        synopsis: movie.synopsis || "",
        year: movie.year || new Date().getFullYear(),
        runtime: movie.runtime || undefined,
        ageRating: movie.ageRating || "",

        countries: countryIds,
        status: movie.status,
        rating: movie.rating || undefined,
        director: movie.director || "",
        cast: movie.cast && movie.cast.length > 0 ? movie.cast : [],
        genreIds: genreIds.filter(Boolean), // Ensure no undefined values
        tagIds: tagIds.filter(Boolean), // Ensure no undefined values
        posterUrl:
          movie.posterUrl &&
          movie.posterUrl.trim() !== "" &&
          isValidUrl(movie.posterUrl)
            ? movie.posterUrl
            : undefined,
        trailerUrl: movie.trailerUrl || "",
      });

      // Set poster preview if movie has poster
      if (movie.posterUrl) {
        setPosterPreview(movie.posterUrl);
      }

      // Set video preview for existing videos
      if (movie.videoUrl) {
        console.log("Setting video preview:", movie.videoUrl);
        console.log("Movie object:", movie);
        setVideoPreview(movie.videoUrl);
      } else {
        console.log("No video URL found for movie:", movie);
        console.log("Available movie properties:", Object.keys(movie));
      }
    } else {
      // Reset form for create mode
      setFormData({
        title: "",
        synopsis: "",
        year: new Date().getFullYear(),
        runtime: undefined,
        ageRating: "",

        countries: [],
        status: "draft",
        rating: undefined,
        director: "",
        cast: [],
        genreIds: [],
        posterUrl: undefined,
        trailerUrl: "",
      });
      setPosterPreview(null);
      setSelectedPosterFile(null);
    }
  }, [movie, mode, countries]);

  const handleInputChange = (field: keyof CreateMovieData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addGenre = () => {
    if (newGenre && !(formData.genreIds || []).includes(newGenre)) {
      setFormData((prev) => ({
        ...prev,
        genreIds: [...(prev.genreIds || []), newGenre],
      }));
      setNewGenre("");
    }
  };

  const removeGenre = (genreToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      genreIds: (prev.genreIds || []).filter((g) => g !== genreToRemove),
    }));
  };

  const addTag = () => {
    if (newTag && !(formData.tagIds || []).includes(newTag)) {
      setFormData((prev) => ({
        ...prev,
        tagIds: [...(prev.tagIds || []), newTag],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tagIds: (prev.tagIds || []).filter((t) => t !== tagToRemove),
    }));
  };

  const addCastMember = () => {
    if (newCastMember && !formData.cast?.includes(newCastMember)) {
      setFormData((prev) => ({
        ...prev,
        cast: [...(prev.cast || []), newCastMember],
      }));
      setNewCastMember("");
    }
  };

  const removeCastMember = (memberToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      cast: (prev.cast || []).filter((m) => m !== memberToRemove),
    }));
  };

  const addCountry = (countryId: string) => {
    if (countryId && !(formData.countries || []).includes(countryId)) {
      setFormData((prev) => ({
        ...prev,
        countries: [...(prev.countries || []), countryId],
      }));
    }
  };

  const removeCountry = (countryIdToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      countries: (prev.countries || []).filter(
        (id) => id !== countryIdToRemove
      ),
    }));
  };

  // Helper function to validate if a string is a valid URL
  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedPosterFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPosterPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePoster = () => {
    setSelectedPosterFile(null);
    setPosterPreview(null);
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedVideoFile(file);

      // Create preview URL for video
      const reader = new FileReader();
      reader.onload = (e) => {
        setVideoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeVideo = () => {
    setSelectedVideoFile(null);
    setVideoPreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that video file is provided (either new upload or existing video)
    if (!selectedVideoFile && !(movie && movie.videoUrl)) {
      alert("Please upload a video file. Video is required for all movies.");
      return;
    }

    // Format data according to API structure
    const submitData: CreateMovieData = {
      title: formData.title,
      synopsis: formData.synopsis || undefined,
      year: formData.year || undefined,
      runtime: formData.runtime || undefined,
      ageRating: formData.ageRating || undefined,

      countries:
        formData.countries && formData.countries.length > 0
          ? formData.countries
          : undefined,
      status: formData.status,
      rating: formData.rating || undefined,
      director: formData.director || undefined,
      cast:
        formData.cast && formData.cast.length > 0 ? formData.cast : undefined,
      genreIds:
        formData.genreIds && formData.genreIds.length > 0
          ? formData.genreIds
          : undefined,
      tagIds:
        formData.tagIds && formData.tagIds.length > 0
          ? formData.tagIds
          : undefined,
      posterFile: selectedPosterFile || undefined,
      // Only include posterUrl if there's no new poster file and posterUrl exists and is a valid URL
      ...(selectedPosterFile ||
      !formData.posterUrl ||
      formData.posterUrl.trim() === "" ||
      !isValidUrl(formData.posterUrl)
        ? {}
        : { posterUrl: formData.posterUrl }),
      videoFile: selectedVideoFile || undefined,
      trailerUrl: formData.trailerUrl || undefined,
    };

    // Debug: Log what's being sent
    console.log("MovieModal submitData:", {
      hasPosterFile: !!selectedPosterFile,
      posterUrl: formData.posterUrl,
      posterUrlValid: formData.posterUrl
        ? isValidUrl(formData.posterUrl)
        : false,
      finalPosterUrl:
        selectedPosterFile ||
        !formData.posterUrl ||
        formData.posterUrl.trim() === "" ||
        !isValidUrl(formData.posterUrl)
          ? undefined
          : formData.posterUrl,
      trailerUrl: formData.trailerUrl,
      submitData,
    });

    onSave(submitData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-8 max-w-4xl w-11/12 shadow-2xl rounded-2xl bg-white">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {mode === "create" ? "Add New Movie" : "Edit Movie"}
            </h3>
            <p className="text-gray-500 mt-1">
              {mode === "create"
                ? "Create a new movie entry"
                : "Update movie information"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter movie title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <input
                  type="number"
                  min="1900"
                  max={new Date().getFullYear() + 5}
                  value={formData.year || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "year",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Runtime (minutes)
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.runtime || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "runtime",
                      e.target.value ? parseInt(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="120"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age Rating
                </label>
                <select
                  value={formData.ageRating}
                  onChange={(e) =>
                    handleInputChange("ageRating", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="">Select age rating</option>
                  {availableAgeRatings.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={formData.rating || ""}
                  onChange={(e) =>
                    handleInputChange(
                      "rating",
                      e.target.value ? parseFloat(e.target.value) : undefined
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="8.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Director
                </label>
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) =>
                    handleInputChange("director", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Director name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    handleInputChange(
                      "status",
                      e.target.value as "draft" | "published" | "archived"
                    )
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Synopsis
            </h4>
            <textarea
              rows={4}
              value={formData.synopsis}
              onChange={(e) => handleInputChange("synopsis", e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
              placeholder="Enter a brief description of the movie..."
            />
          </div>

          {/* Poster Upload */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Movie Poster
            </h4>
            <div className="flex items-center gap-6">
              {/* Current Poster Display */}
              {posterPreview && (
                <div className="flex items-center gap-4">
                  <img
                    src={posterPreview}
                    alt="Poster preview"
                    className="w-20 h-28 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removePoster}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* Poster Upload Input */}
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePosterChange}
                  className="hidden"
                  id="poster-upload"
                />
                <label
                  htmlFor="poster-upload"
                  className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  <PhotoIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {posterPreview ? "Change Poster" : "Upload Poster"}
                  </span>
                </label>
                {!posterPreview && (
                  <p className="text-sm text-gray-500 mt-2">
                    Recommended: 300x450px, JPG/PNG
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Video Upload */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Movie Video *
            </h4>
            <div className="space-y-4">
              {/* Video File Upload */}
              <div className="flex items-center gap-6">
                {/* Current Video Display */}
                {(() => {
                  const videoSrc = videoPreview || movie?.videoUrl;
                  console.log("Video display check:", {
                    videoPreview,
                    movieVideoUrl: movie?.videoUrl,
                    videoSrc,
                    shouldShow: !!(videoPreview || (movie && movie.videoUrl)),
                    movieExists: !!movie,
                    hasVideoUrl: !!movie?.videoUrl,
                    hasVideoPreview: !!videoPreview,
                  });
                  return (
                    (videoPreview || (movie && movie.videoUrl)) &&
                    videoSrc && (
                      <div className="flex items-center gap-4">
                        <video
                          src={videoSrc}
                          className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200"
                          controls
                          muted
                          onLoadStart={() =>
                            console.log("Video loading started:", videoSrc)
                          }
                          onLoadedData={() =>
                            console.log("Video loaded successfully:", videoSrc)
                          }
                          onError={(e) => {
                            console.log("Video failed to load:", videoSrc);
                            console.log("Error details:", e);
                            // If video fails to load, show placeholder
                            const videoElement = e.target as HTMLVideoElement;
                            const parent = videoElement.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                            <div class="w-32 h-20 bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
                              <div class="text-center">
                                <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                <p class="text-xs text-gray-500">Video Preview</p>
                              </div>
                            </div>
                          `;
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={removeVideo}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )
                  );
                })()}

                {/* Video Upload Input */}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                    id="video-upload"
                    name="videoFile"
                  />
                  <label
                    htmlFor="video-upload"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                  >
                    <svg
                      className="w-5 h-5 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium text-gray-700">
                      {videoPreview || movie?.videoUrl
                        ? "Change Video"
                        : "Upload Video"}
                    </span>
                  </label>
                  {!videoPreview && !movie?.videoUrl && (
                    <p className="text-sm text-gray-500 mt-2">
                      Supported formats: MP4, WebM, MOV, AVI{" "}
                      <span className="text-red-500">*Required</span>
                    </p>
                  )}
                  {movie?.videoUrl && !videoPreview && (
                    <div className="mt-2">
                      <p className="text-sm text-blue-500">
                        Video available but preview not loaded
                      </p>
                      <p className="text-xs text-gray-400 mt-1 break-all">
                        URL: {movie.videoUrl}
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          console.log("Testing video URL:", movie.videoUrl);
                          window.open(movie.videoUrl, "_blank");
                        }}
                        className="mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                      >
                        Test Video URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Trailer URL */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Trailer URL
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  YouTube Trailer URL
                </label>
                <input
                  type="url"
                  value={formData.trailerUrl || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      trailerUrl: e.target.value,
                    }))
                  }
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Enter a YouTube URL for the movie trailer
                </p>
              </div>

              {/* Trailer Preview */}
              {formData.trailerUrl && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trailer Preview
                  </label>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    {(() => {
                      const youtubeId = extractYouTubeId(formData.trailerUrl);
                      if (youtubeId) {
                        return (
                          <iframe
                            width="100%"
                            height="200"
                            src={`https://www.youtube.com/embed/${youtubeId}`}
                            title="Movie Trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="rounded-lg"
                          />
                        );
                      } else {
                        return (
                          <div className="text-center py-8 text-gray-500">
                            <p>Invalid YouTube URL</p>
                            <p className="text-sm">
                              Please enter a valid YouTube URL
                            </p>
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Countries */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Countries
            </h4>
            <div className="grid grid-cols-1 gap-6">
              {/* Countries */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Countries
                </label>
                <div className="mb-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        addCountry(e.target.value);
                        e.target.value = ""; // Reset selection
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    disabled={isLoadingCountries}
                  >
                    <option value="">
                      {isLoadingCountries
                        ? "Loading countries..."
                        : "Select countries to add"}
                    </option>
                    {countries
                      .filter(
                        (country) =>
                          !(formData.countries || []).includes(country.id)
                      )
                      .map((country) => (
                        <option key={country.id} value={country.id}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(formData.countries || []).map((countryId, idx) => {
                    const country = countries.find((c) => c.id === countryId);

                    return (
                      <span
                        key={`country-${countryId}-${idx}`}
                        className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-green-100 text-green-800 font-medium"
                      >
                        {country
                          ? `${country.name} (${country.code})`
                          : countryId}
                        <button
                          type="button"
                          onClick={() => removeCountry(countryId)}
                          className="ml-2 text-green-600 hover:text-green-800 hover:bg-green-200 rounded-full w-4 h-4 flex items-center justify-center"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Genres */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Genres</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Genres
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.genreIds || [])
                .filter(Boolean) // Filter out undefined/null values
                .map((genreId, index) => {
                  const genre = availableGenres.find((g) => g.id === genreId);

                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800"
                    >
                      {genre ? genre.name : `Loading... (${genreId})`}
                      <button
                        type="button"
                        onClick={() => removeGenre(genreId)}
                        className="ml-2 text-purple-600 hover:text-purple-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
            </div>
            <div className="flex gap-2">
              <select
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isLoadingGenres}
              >
                <option value="">
                  {isLoadingGenres ? "Loading genres..." : "Select genre"}
                </option>
                {availableGenres
                  .filter(
                    (genre) => !(formData.genreIds || []).includes(genre.id)
                  )
                  .map((genre) => (
                    <option key={genre.id} value={genre.id}>
                      {genre.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addGenre}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Tags</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.tagIds || [])
                .filter(Boolean) // Filter out undefined/null values
                .map((tagId, index) => {
                  const tag = availableTags.find((t) => t.id === tagId);

                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800"
                    >
                      {tag ? tag.name : `Loading... (${tagId})`}
                      <button
                        onClick={() => removeTag(tagId)}
                        className="ml-2 text-yellow-600 hover:text-yellow-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
            </div>
            <div className="flex gap-2">
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isLoadingTags}
              >
                <option value="">
                  {isLoadingTags ? "Loading tags..." : "Select tag"}
                </option>
                {availableTags
                  .filter((tag) => !(formData.tagIds || []).includes(tag.id))
                  .map((tag) => (
                    <option key={tag.id} value={tag.id}>
                      {tag.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Cast */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Cast</h4>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cast
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {(formData.cast || [])
                .filter(Boolean) // Filter out undefined/null values
                .map((memberId, index) => {
                  const castMember = availableCast.find(
                    (c) => c.id === memberId
                  );
                  return (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                    >
                      {castMember
                        ? castMember.name
                        : `Loading... (${memberId})`}
                      <button
                        type="button"
                        onClick={() => removeCastMember(memberId)}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
            </div>
            <div className="flex gap-2">
              <select
                value={newCastMember}
                onChange={(e) => setNewCastMember(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={isLoadingCast}
              >
                <option value="">
                  {isLoadingCast ? "Loading cast..." : "Select cast member"}
                </option>
                {availableCast
                  .filter((cast) => !(formData.cast || []).includes(cast.id))
                  .map((cast) => (
                    <option key={cast.id} value={cast.id}>
                      {cast.name}
                    </option>
                  ))}
              </select>
              <button
                type="button"
                onClick={addCastMember}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              {mode === "create" ? "Create Movie" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
