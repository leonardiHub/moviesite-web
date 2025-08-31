"use client";

import { useState } from "react";
import {
  HomeIcon,
  FilmIcon,
  ChartBarIcon,
  UsersIcon,
  CogIcon,
  StarIcon,
  MagnifyingGlassIcon,
  ArrowRightOnRectangleIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import MoviesPage from "../movies/page";
import CountriesPage from "../countries/page";
import GenresPage from "../genres/page";
import TagsPage from "../tags/page";
import CastPage from "../cast/page";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  name: string;
  permissions: string[];
  roles: string[];
}

interface NavigationItem {
  id: string;
  name: string;
  icon: any;
  permission: string | null;
}

interface DashboardProps {
  user: AdminUser;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeView, setActiveView] = useState("dashboard");

  const navigation: NavigationItem[] = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: HomeIcon,
      permission: "dashboard.view",
    },
    {
      id: "content",
      name: "Content",
      icon: FilmIcon,
      permission: "content.movies.view",
    },
    {
      id: "countries",
      name: "Countries",
      icon: GlobeAltIcon,
      permission: null, // Accessible to all authenticated users
    },
    {
      id: "genres",
      name: "Genres",
      icon: FilmIcon,
      permission: null, // Accessible to all authenticated users
    },
    {
      id: "tags",
      name: "Tags",
      icon: FilmIcon,
      permission: null, // Accessible to all authenticated users
    },
    {
      id: "cast",
      name: "Cast",
      icon: UsersIcon,
      permission: null, // Accessible to all authenticated users
    },

    {
      id: "analytics",
      name: "Analytics",
      icon: ChartBarIcon,
      permission: "analytics.view",
    },
    {
      id: "users",
      name: "Users",
      icon: UsersIcon,
      permission: "admin.users.view",
    },
    { id: "brand", name: "Brand", icon: StarIcon, permission: "brand.manage" },
    {
      id: "sponsors",
      name: "Sponsors",
      icon: StarIcon,
      permission: "sponsors.manage",
    },
    {
      id: "search",
      name: "Search & SEO",
      icon: MagnifyingGlassIcon,
      permission: "system.settings",
    },
    {
      id: "settings",
      name: "Settings",
      icon: CogIcon,
      permission: "system.settings",
    },
  ];

  const hasPermission = (permission: string | null) => {
    // If no permission required, allow access to all authenticated users
    if (permission === null) {
      return true;
    }

    // Superadmin bypass - if user has superadmin role, allow everything
    if (
      user.roles.includes("superadmin") ||
      user.roles.includes("Super Admin")
    ) {
      return true;
    }

    // For development/testing - allow access to countries if user has any admin permissions
    if (permission === "countries.view" && user.permissions.length > 0) {
      return true;
    }

    return user.permissions.includes(permission);
  };

  const filteredNavigation = navigation.filter((item) =>
    hasPermission(item.permission)
  );

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return <DashboardView user={user} />;
      case "content":
        return <ContentView />;
      case "countries":
        return <CountriesView user={user} />;
      case "genres":
        return <GenresPage />;
      case "tags":
        return <TagsPage />;
      case "cast":
        return <CastPage />;

      case "analytics":
        return <AnalyticsView />;
      case "users":
        return <UsersView />;
      case "brand":
        return <BrandView />;
      case "sponsors":
        return <SponsorsView />;
      case "search":
        return <SearchView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <FilmIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">MovieSite</h1>
              <p className="text-sm text-gray-600">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isSuperadminAccess =
              (user.roles.includes("superadmin") ||
                user.roles.includes("Super Admin")) &&
              item.permission !== null &&
              !user.permissions.includes(item.permission);
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-colors ${
                  activeView === item.id
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
                title={
                  isSuperadminAccess ? "Access granted via superadmin role" : ""
                }
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
                {isSuperadminAccess && (
                  <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    SA
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        {/* <div className="fixed bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-600">{user.roles.join(", ")}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              title="Logout"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div> */}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              {navigation.find((n) => n.id === activeView)?.name || "Dashboard"}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-medium">{user.name}</span>
              </div>
              {(user.roles.includes("superadmin") ||
                user.roles.includes("Super Admin")) && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-medium">
                  🚀 Super Admin
                </span>
              )}
              {activeView === "countries" &&
                !user.permissions.includes("countries.view") && (
                  <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-medium">
                    ⚠️ Dev Access
                  </span>
                )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">{renderContent()}</main>
      </div>
    </div>
  );
}

// Dashboard View Component
function DashboardView({ user }: { user: AdminUser }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Movies</p>
              <p className="text-2xl font-bold text-gray-900">1,248</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FilmIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">25,680</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <UsersIcon className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">8.9M</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <ChartBarIcon className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">8.6</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <StarIcon className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <FilmIcon className="w-8 h-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-900">Add New Movie</h4>
            <p className="text-sm text-gray-600">
              Upload and configure new content
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <UsersIcon className="w-8 h-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-900">Manage Users</h4>
            <p className="text-sm text-gray-600">
              View and moderate user accounts
            </p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
            <ChartBarIcon className="w-8 h-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-900">View Analytics</h4>
            <p className="text-sm text-gray-600">Check performance metrics</p>
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder View Components
function ContentView() {
  return <MoviesPage />;
}

function CountriesView({ user }: { user: AdminUser }) {
  return (
    <div>
      <CountriesPage />
    </div>
  );
}

function AnalyticsView() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytics</h2>
      <p className="text-gray-600">
        Deep insights into user behavior and content performance.
      </p>
    </div>
  );
}

function UsersView() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        User Management
      </h2>
      <p className="text-gray-600">
        Manage user accounts and community moderation.
      </p>
    </div>
  );
}

function BrandView() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Brand & Theme
      </h2>
      <p className="text-gray-600">
        Customize website appearance and brand elements.
      </p>
    </div>
  );
}

function SponsorsView() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        Sponsors & Ads
      </h2>
      <p className="text-gray-600">
        Manage sponsor relationships and advertising campaigns.
      </p>
    </div>
  );
}

function SearchView() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Search & SEO</h2>
      <p className="text-gray-600">
        Optimize search experience and search engine visibility.
      </p>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        System Settings
      </h2>
      <p className="text-gray-600">
        Configure system preferences and security settings.
      </p>
    </div>
  );
}
