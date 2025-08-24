'use client'

import { useState, useEffect } from 'react'

// Modern Round Icons
const DashboardIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="3" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="14" y="3" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="14" y="14" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <rect x="3" y="14" width="7" height="7" rx="2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

const FilmIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="3" width="20" height="14" rx="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <circle cx="8" cy="10" r="1" />
    <path d="M16 21v-4a2 2 0 00-2-2h-4a2 2 0 00-2 2v4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M7 7h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M17 7h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

const ChartIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path d="M3 12a9 9 0 1 0 9-9" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M12 3v9l4 4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

const UsersIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

const BrushIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M8 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

const StarIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <circle cx="9" cy="9" r="1" />
    <circle cx="15" cy="9" r="1" />
  </svg>
)

const SearchIcon = () => (
  <svg className="sidebar-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    <path d="m21 21-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
  </svg>
)

// Mock Data
const mockStats = {
  totalMovies: 1248,
  totalSeries: 384,
  totalUsers: 25680,
  totalViews: 8950000,
  monthlyGrowth: 12.5,
  avgRating: 8.6,
  activeUsers: 18430,
  revenue: 450000
}

const mockMovies = [
  { id: 1, title: 'Avatar: The Way of Water', year: 2022, genre: 'Sci-Fi', status: 'Published', views: 1250000, rating: 9.2 },
  { id: 2, title: 'Black Panther: Wakanda Forever', year: 2022, genre: 'Action', status: 'Published', views: 980000, rating: 8.8 },
  { id: 3, title: 'Top Gun: Maverick', year: 2022, genre: 'Action', status: 'Published', views: 1180000, rating: 9.0 },
  { id: 4, title: 'Doctor Strange: Multiverse', year: 2022, genre: 'Sci-Fi', status: 'Draft', views: 0, rating: 0 },
  { id: 5, title: 'Thor: Love and Thunder', year: 2022, genre: 'Action', status: 'Published', views: 850000, rating: 8.5 },
  { id: 6, title: 'Jurassic World Dominion', year: 2022, genre: 'Adventure', status: 'Published', views: 920000, rating: 8.3 },
]

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(false)

  // Smooth page transitions
  const handleViewChange = (view: string) => {
    if (view === activeView) return
    
    setIsLoading(true)
    setTimeout(() => {
      setActiveView(view)
      setIsLoading(false)
    }, 150) // Light delay for loading effect
  }

  // Dashboard View
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="content-header">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Dashboard Overview</h1>
        <p className="text-slate-600 font-medium text-sm">Real-time system status and key performance indicators</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Total Movies</p>
              <p className="text-2xl font-bold text-slate-900">{mockStats.totalMovies.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">+{mockStats.totalSeries} Series</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl">
              <FilmIcon />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Total Users</p>
              <p className="text-2xl font-bold text-slate-900">{mockStats.totalUsers.toLocaleString()}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">{mockStats.activeUsers.toLocaleString()} Active</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl">
              <UsersIcon />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Total Views</p>
              <p className="text-2xl font-bold text-slate-900">{(mockStats.totalViews / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">+{mockStats.monthlyGrowth}% This Month</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl">
              <ChartIcon />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-1">Average Rating</p>
              <p className="text-2xl font-bold text-slate-900">{mockStats.avgRating}</p>
              <p className="text-xs text-emerald-600 font-medium mt-1">Excellent Quality</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl">
              <div className="text-white text-lg">⭐</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Popular Content */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-900">Top Movies</h3>
              <button className="btn-ghost text-xs">View All</button>
            </div>
            <div className="space-y-3">
              {mockMovies.slice(0, 6).map((movie, index) => (
                <div key={movie.id} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{movie.title}</p>
                      <p className="text-xs text-slate-600">{movie.year} • {movie.genre} • ⭐ {movie.rating}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">{movie.views.toLocaleString()}</p>
                    <p className="text-xs text-slate-600">Views</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-5">
          <div className="card">
            <h3 className="text-base font-bold text-slate-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-sm">API Service</span>
                <span className="badge-success text-xs">Running</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-sm">Database</span>
                <span className="badge-success text-xs">Normal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-sm">CDN</span>
                <span className="badge-success text-xs">Normal</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium text-sm">Storage Usage</span>
                <span className="badge-warning text-xs">68%</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-base font-bold text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <button className="w-full btn-primary text-left text-sm">+ Add New Movie</button>
              <button className="w-full btn-secondary text-left text-sm">📊 View Detailed Report</button>
              <button className="w-full btn-secondary text-left text-sm">👥 Manage Users</button>
              <button className="w-full btn-secondary text-left text-sm">⚙️ System Settings</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Placeholder View Component
  const PlaceholderView = ({ title, description, icon }: { title: string, description: string, icon: string }) => (
    <div className="space-y-6">
      <div className="content-header">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{title}</h1>
        <p className="text-slate-600 font-medium text-sm">{description}</p>
      </div>
      
      <div className="card text-center py-12">
        <div className="text-5xl mb-4">{icon}</div>
        <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-600 text-base mb-6">{description}</p>
        <div className="flex justify-center space-x-3">
          <button className="btn-primary text-sm">Get Started</button>
          <button className="btn-secondary text-sm">View Documentation</button>
        </div>
      </div>
    </div>
  )

  // Render current view
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-80">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-600 font-medium text-sm">Loading...</p>
          </div>
        </div>
      )
    }

    switch (activeView) {
      case 'dashboard':
        return <DashboardView />
      case 'content':
        return <PlaceholderView title="Content Management" description="Manage all movies, series and media assets" icon="🎬" />
      case 'analytics':
        return <PlaceholderView title="Analytics" description="Deep insights into user behavior and content performance" icon="📊" />
      case 'users':
        return <PlaceholderView title="User Management" description="Manage user accounts and community moderation" icon="👥" />
      case 'brand':
        return <PlaceholderView title="Brand & Theme" description="Customize website appearance and brand elements" icon="🎨" />
      case 'sponsors':
        return <PlaceholderView title="Sponsors & Ads" description="Manage sponsor relationships and advertising campaigns" icon="⭐" />
      case 'search':
        return <PlaceholderView title="Search & SEO" description="Optimize search experience and search engine visibility" icon="🔍" />
      default:
        return <DashboardView />
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="sidebar-container">
        <div className="p-4 border-b border-slate-200/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <FilmIcon />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">MovieSite</h1>
              <p className="text-xs text-slate-600">Admin Dashboard</p>
            </div>
          </div>
        </div>

        <nav className="p-3 space-y-1">
          <button
            onClick={() => handleViewChange('dashboard')}
            className={`sidebar-link w-full group ${activeView === 'dashboard' ? 'active' : ''}`}
          >
            <DashboardIcon />
            <span className="ml-2 font-semibold text-sm">Dashboard</span>
          </button>

          <button
            onClick={() => handleViewChange('content')}
            className={`sidebar-link w-full group ${activeView === 'content' ? 'active' : ''}`}
          >
            <FilmIcon />
            <span className="ml-2 font-semibold text-sm">Content</span>
          </button>

          <button
            onClick={() => handleViewChange('analytics')}
            className={`sidebar-link w-full group ${activeView === 'analytics' ? 'active' : ''}`}
          >
            <ChartIcon />
            <span className="ml-2 font-semibold text-sm">Analytics</span>
          </button>

          <button
            onClick={() => handleViewChange('users')}
            className={`sidebar-link w-full group ${activeView === 'users' ? 'active' : ''}`}
          >
            <UsersIcon />
            <span className="ml-2 font-semibold text-sm">Users</span>
          </button>

          <button
            onClick={() => handleViewChange('brand')}
            className={`sidebar-link w-full group ${activeView === 'brand' ? 'active' : ''}`}
          >
            <BrushIcon />
            <span className="ml-2 font-semibold text-sm">Brand</span>
          </button>

          <button
            onClick={() => handleViewChange('sponsors')}
            className={`sidebar-link w-full group ${activeView === 'sponsors' ? 'active' : ''}`}
          >
            <StarIcon />
            <span className="ml-2 font-semibold text-sm">Sponsors</span>
          </button>

          <button
            onClick={() => handleViewChange('search')}
            className={`sidebar-link w-full group ${activeView === 'search' ? 'active' : ''}`}
          >
            <SearchIcon />
            <span className="ml-2 font-semibold text-sm">Search & SEO</span>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-3">
            <div className="text-xs">
              <div className="font-bold text-slate-900">System Version</div>
              <div className="text-slate-600">v2.1.0</div>
              <div className="text-xs text-slate-500 mt-1">
                Last Updated: {new Date().toLocaleDateString('en-US')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-content flex flex-col">
        {/* Top Navigation Bar */}
        <header className="nav-header">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeView === 'dashboard' && 'Dashboard Overview'}
                {activeView === 'content' && 'Content Management'}
                {activeView === 'analytics' && 'Analytics'}
                {activeView === 'users' && 'User Management'}
                {activeView === 'brand' && 'Brand & Theme'}
                {activeView === 'sponsors' && 'Sponsors & Ads'}
                {activeView === 'search' && 'Search & SEO'}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-xs text-slate-600">
                Welcome back, <span className="font-semibold text-slate-900">Admin</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white text-xs font-bold">A</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="content-area flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}