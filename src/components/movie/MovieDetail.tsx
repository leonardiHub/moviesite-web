import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovieDetail, usePlayAuth, useBrandConfig } from '../../hooks/useMovies';
import Loading from '../common/Loading';
import { ErrorFallback } from '../common/ErrorBoundary';
import StartPlayButton from '../common/StartPlayButton';

const MovieDetail: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'cast' | 'related'>('overview');

  // Fetch movie data using the API
  const { 
    data: movie, 
    isLoading: movieLoading, 
    error: movieError,
    refetch: refetchMovie
  } = useMovieDetail(movieId || '');

  // Fetch brand config for styling
  const { data: brandConfig } = useBrandConfig();

  // Fetch play authorization (disabled by default)
  const { 
    data: playAuth,
    refetch: fetchPlayAuth,
    isLoading: playLoading
  } = usePlayAuth(movieId || '');

  // Handle play button click
  const handlePlayClick = async () => {
    if (movieId) {
      await fetchPlayAuth();
      // Navigate to watch page
      navigate(`/watch/${movieId}`);
    }
  };

  // Error handling
  if (movieError) {
    return <ErrorFallback onRetry={() => refetchMovie()} />;
  }

  // Loading state
  if (movieLoading || !movie) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      {/* Header with brand styling */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {brandConfig?.logo?.light && (
              <img 
                src={brandConfig.logo.light} 
                alt={brandConfig.name}
                className="h-8"
              />
            )}
            <span className="text-xl font-bold">{brandConfig?.name || 'EZ Movie'}</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            <a href="/" className="hover:text-red-500">หน้าหลัก</a>
            <a href="/หนังฝรั่ง" className="hover:text-red-500">หนังฝรั่ง</a>
            <a href="#" className="hover:text-red-500">ซีรีส์</a>
            <a href="#" className="hover:text-red-500">อนิเมะ</a>
          </nav>
        </div>
      </header>

      {/* Hero Section with Backdrop */}
      <section className="relative pt-16 min-h-[70vh]">
        {movie.backdrop && (
          <div className="absolute inset-0">
            <img
              src={movie.backdrop}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0c12] via-transparent to-transparent" />
          </div>
        )}

        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
            {/* Movie Poster */}
            <div className="lg:col-span-1">
              <div className="relative">
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-full max-w-sm rounded-lg shadow-2xl"
                />
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
                  <button
                    onClick={handlePlayClick}
                    disabled={playLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {playLoading ? 'กำลังโหลด...' : '▶️ ดูหนัง'}
                  </button>
                </div>
              </div>
            </div>

            {/* Movie Info */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {movie.title}
              </h1>
              
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="text-xl text-gray-400 mb-4">
                  {movie.originalTitle}
                </p>
              )}

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <span className="bg-yellow-500 text-black px-3 py-1 rounded-full font-bold">
                  ⭐ {movie.rating}
                </span>
                {movie.year && (
                  <span className="bg-gray-700 px-3 py-1 rounded-full">
                    {movie.year}
                  </span>
                )}
                {movie.runtime && (
                  <span className="bg-gray-700 px-3 py-1 rounded-full">
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                )}
                {movie.ageRating && (
                  <span className="bg-gray-700 px-3 py-1 rounded-full">
                    {movie.ageRating}
                  </span>
                )}
              </div>

              {/* Genres */}
              {movie.genres && movie.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="bg-red-600 px-3 py-1 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {movie.synopsis && (
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  {movie.synopsis}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={handlePlayClick}
                  disabled={playLoading}
                  className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {playLoading ? 'กำลังโหลด...' : '▶️ ดูหนังตอนนี้'}
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                  ❤️ เพิ่มในรายการโปรด
                </button>
                <button className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors">
                  📤 แชร์
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Tabs */}
      <section className="container mx-auto px-4 py-8">
        <div className="border-b border-gray-700 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'ภาพรวม' },
              { id: 'cast', label: 'นักแสดง' },
              { id: 'related', label: 'หนังที่เกี่ยวข้อง' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-500'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Additional Details */}
              <div>
                <h3 className="text-xl font-semibold mb-4">รายละเอียดเพิ่มเติม</h3>
                <div className="space-y-3">
                  {movie.languages && movie.languages.length > 0 && (
                    <div>
                      <span className="text-gray-400">ภาษา:</span>
                      <span className="ml-2">{movie.languages.join(', ')}</span>
                    </div>
                  )}
                  {movie.countries && movie.countries.length > 0 && (
                    <div>
                      <span className="text-gray-400">ประเทศ:</span>
                      <span className="ml-2">{movie.countries.join(', ')}</span>
                    </div>
                  )}
                  {movie.status && (
                    <div>
                      <span className="text-gray-400">สถานะ:</span>
                      <span className="ml-2">{movie.status}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {movie.tags && movie.tags.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">แท็ก</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.tags.map((tag: string, index: number) => (
                      <span
                        key={index}
                        className="bg-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'cast' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">นักแสดงและทีมงาน</h3>
              
              {/* Cast */}
              {movie.cast && movie.cast.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-lg font-medium mb-4 text-gray-300">นักแสดง</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movie.cast.map((person: any) => (
                      <div key={person.id} className="text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">👤</span>
                        </div>
                        <p className="font-medium text-sm">{person.name}</p>
                        <p className="text-xs text-gray-400">{person.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Crew */}
              {movie.crew && movie.crew.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium mb-4 text-gray-300">ทีมงาน</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {movie.crew.map((person: any) => (
                      <div key={person.id} className="text-center">
                        <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                          <span className="text-2xl">🎬</span>
                        </div>
                        <p className="font-medium text-sm">{person.name}</p>
                        <p className="text-xs text-gray-400">{person.role}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'related' && (
            <div>
              <h3 className="text-xl font-semibold mb-6">หนังที่เกี่ยวข้อง</h3>
              
              {movie.related && movie.related.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {movie.related.map((relatedMovie: any) => (
                    <div key={relatedMovie.id} className="group cursor-pointer">
                      <div className="relative overflow-hidden rounded-lg bg-gray-800">
                        <img
                          src={relatedMovie.poster}
                          alt={relatedMovie.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        
                        {/* Overlay with Play Button */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
                          <StartPlayButton movieId={relatedMovie.id} />
                        </div>

                        {/* Rating Badge */}
                        <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
                          ⭐ {relatedMovie.rating}
                        </div>
                      </div>

                      {/* Movie Info */}
                      <div className="mt-3">
                        <h4 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-red-400 transition-colors">
                          {relatedMovie.title}
                        </h4>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{relatedMovie.year}</span>
                          <span className="text-red-400">⭐ {relatedMovie.rating}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">ไม่มีหนังที่เกี่ยวข้อง</p>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MovieDetail; 