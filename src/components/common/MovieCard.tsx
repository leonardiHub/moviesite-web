import React from 'react';
import { Link } from 'react-router-dom';
import StartPlayButton from './StartPlayButton';

interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    poster: string;
    year?: number;
    rating?: number;
    genres?: string[];
    slug?: string;
  };
  showPlayButton?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  showPlayButton = true,
  size = 'medium',
  className = ''
}) => {
  const sizeClasses = {
    small: 'h-32',
    medium: 'h-48',
    large: 'h-64'
  };

  const textSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-sm'
  };

  return (
    <div className={`group cursor-pointer ${className}`}>
      <div className="relative overflow-hidden rounded-lg bg-gray-800">
        {/* Movie Poster */}
        <img
          src={movie.poster}
          alt={movie.title}
          className={`w-full ${sizeClasses[size]} object-cover group-hover:scale-105 transition-transform duration-300`}
        />
        
        {/* Overlay with Play Button */}
        {showPlayButton && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center">
            <StartPlayButton movieId={movie.id} />
          </div>
        )}

        {/* Rating Badge */}
        {movie.rating && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
            ⭐ {movie.rating}
          </div>
        )}
      </div>

      {/* Movie Info */}
      <div className="mt-3">
        <Link to={`/movie-detail/${movie.id}`}>
          <h3 className={`font-semibold line-clamp-2 mb-1 group-hover:text-red-400 transition-colors ${textSize[size]}`}>
            {movie.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          {movie.year && <span>{movie.year}</span>}
          {movie.genres && movie.genres.length > 0 && (
            <span className="text-red-400">{movie.genres[0]}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard; 