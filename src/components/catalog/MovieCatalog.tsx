import React, { useState } from 'react';
import { useMoviesList, useBrandConfig } from '../../hooks/useMovies';
import Loading, { MovieCardSkeleton } from '../common/Loading';
import { ErrorFallback } from '../common/ErrorBoundary';
import MovieCard from '../common/MovieCard';
import Navigation from '../common/Navigation';

interface MovieCatalogProps {
  title?: string;
  initialGenre?: string;
  initialYear?: number;
  initialSort?: string;
}

const MovieCatalog: React.FC<MovieCatalogProps> = ({
  title = "หนังทั้งหมด",
  initialGenre = "",
  initialYear = undefined,
  initialSort = "popular"
}) => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 24,
    genre: initialGenre,
    year: initialYear,
    sort: initialSort
  });

  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedYear, setSelectedYear] = useState(initialYear);
  const [selectedSort, setSelectedSort] = useState(initialSort);

  // Fetch movies using the API
  const { 
    data: moviesData, 
    isLoading, 
    error, 
    refetch 
  } = useMoviesList(filters);

  // Fetch brand config for styling
  const { data: brandConfig } = useBrandConfig();

  // Available genres and years for filters
  const availableGenres = [
    "Action", "Adventure", "Animation", "Biography", "Comedy", 
    "Crime", "Drama", "Fantasy", "Horror", "Romance", "Sci-Fi", "Thriller"
  ];

  const availableYears = Array.from({ length: 25 }, (_, i) => 2024 - i);

  const sortOptions = [
    { value: "popular", label: "ยอดนิยม" },
    { value: "rating", label: "คะแนนสูงสุด" },
    { value: "year", label: "ปีล่าสุด" },
    { value: "title", label: "ชื่อ A-Z" }
  ];

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  // Apply filters
  const applyFilters = () => {
    setFilters(prev => ({
      ...prev,
      genre: selectedGenre,
      year: selectedYear,
      sort: selectedSort,
      page: 1
    }));
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedGenre("");
    setSelectedYear(undefined);
    setSelectedSort("popular");
    setFilters({
      page: 1,
      limit: 24,
      genre: "",
      year: undefined,
      sort: "popular"
    });
  };

  // Error handling
  if (error) {
    return <ErrorFallback onRetry={() => refetch()} />;
  }

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      {/* Header with brand styling */}
      <Navigation />

      {/* Main Content */}
      <div className="pt-20 container mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{title}</h1>
          <p className="text-gray-400">
            {moviesData ? `${moviesData.total} หนัง` : 'กำลังโหลด...'}
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Genre Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">ประเภท</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">ทุกประเภท</option>
                {availableGenres.map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">ปี</label>
              <select
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">ทุกปี</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">เรียงตาม</label>
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Filter Actions */}
            <div className="flex items-end space-x-2">
              <button
                onClick={applyFilters}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                ใช้ตัวกรอง
              </button>
              <button
                onClick={resetFilters}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                รีเซ็ต
              </button>
            </div>
          </div>
        </div>

        {/* Movies Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        ) : moviesData?.items ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
              {moviesData.items.map((movie: any) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  size="large"
                  showPlayButton={true}
                />
              ))}
            </div>

            {/* Pagination */}
            {moviesData.total > moviesData.limit && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(moviesData.page - 1)}
                  disabled={moviesData.page <= 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  ก่อนหน้า
                </button>
                
                <span className="px-4 py-2 text-gray-300">
                  หน้า {moviesData.page} จาก {Math.ceil(moviesData.total / moviesData.limit)}
                </span>
                
                <button
                  onClick={() => handlePageChange(moviesData.page + 1)}
                  disabled={!moviesData.hasMore}
                  className="px-4 py-2 bg-gray-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600"
                >
                  ถัดไป
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">ไม่พบหนังที่ตรงกับตัวกรอง</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCatalog; 