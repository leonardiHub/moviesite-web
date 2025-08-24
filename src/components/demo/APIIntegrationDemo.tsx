import React, { useState } from 'react';
import { useHomeData, useMoviesList, useBrandConfig } from '../../hooks/useMovies';
import MovieCard from '../common/MovieCard';
import Navigation from '../common/Navigation';
import Loading from '../common/Loading';

const APIIntegrationDemo: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'home' | 'movies' | 'brand'>('home');

  // Fetch all API data
  const { data: homeData, isLoading: homeLoading } = useHomeData();
  const { data: moviesData, isLoading: moviesLoading } = useMoviesList({ limit: 6 });
  const { data: brandConfig, isLoading: brandLoading } = useBrandConfig();

  const isLoading = homeLoading || moviesLoading || brandLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0c12] text-white">
        <Navigation />
        <div className="pt-20 container mx-auto px-4 py-8">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white">
      <Navigation />
      
      <div className="pt-20 container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">🎬 API Integration Demo</h1>
        
        {/* Section Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800 rounded-lg p-1">
            {[
              { id: 'home', label: '🏠 Home API' },
              { id: 'movies', label: '🎭 Movies API' },
              { id: 'brand', label: '🎨 Brand API' }
            ].map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-red-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Home API Section */}
        {activeSection === 'home' && homeData && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">🏠 Home API Data</h2>
            
            {/* Brand Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Brand Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p><strong>Name:</strong> {homeData.brand?.name}</p>
                  <p><strong>Primary Color:</strong> {homeData.brand?.palette?.primary}</p>
                  <p><strong>Background:</strong> {homeData.brand?.palette?.bg}</p>
                </div>
                <div>
                  <p><strong>Logo Light:</strong> {homeData.brand?.logo?.light ? '✅ Available' : '❌ Not Available'}</p>
                  <p><strong>Logo Dark:</strong> {homeData.brand?.logo?.dark ? '✅ Available' : '❌ Not Available'}</p>
                </div>
              </div>
            </div>

            {/* Content Sections */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Content Sections ({homeData.sections?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {homeData.sections?.map((section: any, index: number) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">{section.title}</h4>
                    <p className="text-sm text-gray-400">Type: {section.kind}</p>
                    <p className="text-sm text-gray-400">Items: {section.items?.length || 0}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sponsors */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Sponsors ({homeData.sponsors?.length || 0})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {homeData.sponsors?.map((sponsor: any, index: number) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg">
                    <p><strong>Placement:</strong> {sponsor.placement}</p>
                    <p><strong>Image:</strong> {sponsor.image ? '✅ Available' : '❌ Not Available'}</p>
                    <p><strong>URL:</strong> {sponsor.url}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Movies API Section */}
        {activeSection === 'movies' && moviesData && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">🎭 Movies API Data</h2>
            
            {/* API Info */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">API Response Info</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{moviesData.total}</p>
                  <p className="text-sm text-gray-400">Total Movies</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{moviesData.items?.length || 0}</p>
                  <p className="text-sm text-gray-400">Current Page</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{moviesData.page}</p>
                  <p className="text-sm text-gray-400">Page Number</p>
                </div>
                <div className="bg-gray-700 p-4 rounded-lg">
                  <p className="text-2xl font-bold text-red-400">{moviesData.limit}</p>
                  <p className="text-sm text-gray-400">Items Per Page</p>
                </div>
              </div>
            </div>

            {/* Movies Grid */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Sample Movies</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {moviesData.items?.map((movie: any) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    size="medium"
                    showPlayButton={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Brand API Section */}
        {activeSection === 'brand' && brandConfig && (
          <div className="space-y-8">
            <h2 className="text-2xl font-bold">🎨 Brand API Data</h2>
            
            {/* Brand Details */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Brand Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Basic Info</h4>
                  <p><strong>Name:</strong> {brandConfig.name}</p>
                  <p><strong>Font Family:</strong> {brandConfig.fontFamily}</p>
                  <p><strong>Favicon:</strong> {brandConfig.favicon ? '✅ Available' : '❌ Not Available'}</p>
                  <p><strong>OG Image:</strong> {brandConfig.ogImage ? '✅ Available' : '❌ Not Available'}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Color Palette</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: brandConfig.palette.primary }}></div>
                      <span><strong>Primary:</strong> {brandConfig.palette.primary}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: brandConfig.palette.accent }}></div>
                      <span><strong>Accent:</strong> {brandConfig.palette.accent}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: brandConfig.palette.bg }}></div>
                      <span><strong>Background:</strong> {brandConfig.palette.bg}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded border" style={{ backgroundColor: brandConfig.palette.text }}></div>
                      <span><strong>Text:</strong> {brandConfig.palette.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Logo Variants */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Logo Variants</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['light', 'dark', 'mono'].map(variant => (
                  <div key={variant} className="bg-gray-700 p-4 rounded-lg text-center">
                    <h5 className="font-semibold mb-2 capitalize">{variant} Logo</h5>
                    {brandConfig.logo?.[variant as keyof typeof brandConfig.logo] ? (
                      <div className="text-green-400">✅ Available</div>
                    ) : (
                      <div className="text-red-400">❌ Not Available</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* API Status Footer */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6 text-center">
          <h3 className="text-xl font-semibold mb-4">🚀 API Integration Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-900 p-4 rounded-lg">
              <p className="text-green-400 font-semibold">✅ Home API</p>
              <p className="text-sm text-gray-400">Fully Integrated</p>
            </div>
            <div className="bg-green-900 p-4 rounded-lg">
              <p className="text-green-400 font-semibold">✅ Movies API</p>
              <p className="text-sm text-gray-400">Fully Integrated</p>
            </div>
            <div className="bg-green-900 p-4 rounded-lg">
              <p className="text-green-400 font-semibold">✅ Brand API</p>
              <p className="text-sm text-gray-400">Fully Integrated</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIIntegrationDemo; 