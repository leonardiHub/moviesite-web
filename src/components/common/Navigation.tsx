import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBrandConfig } from '../../hooks/useMovies';

const Navigation: React.FC = () => {
  const location = useLocation();
  const { data: brandConfig } = useBrandConfig();

  const navItems = [
    { path: '/', label: 'หน้าหลัก' },
    { path: '/catalog', label: 'หนังทั้งหมด' },
    { path: '/catalog/Action', label: 'หนังแอคชั่น' },
    { path: '/catalog/Comedy', label: 'หนังตลก' },
    { path: '/catalog/Drama', label: 'หนังดราม่า' },
    { path: '/catalog/Animation', label: 'อนิเมะ' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black bg-opacity-90 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          {brandConfig?.logo?.light && (
            <Link to="/">
              <img 
                src={brandConfig.logo.light} 
                alt={brandConfig.name}
                className="h-8"
              />
            </Link>
          )}
          <Link to="/" className="text-xl font-bold hover:text-red-500 transition-colors">
            {brandConfig?.name || 'EZ Movie'}
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="hidden md:flex space-x-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`transition-colors ${
                isActive(item.path)
                  ? 'text-red-500'
                  : 'text-gray-300 hover:text-red-500'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Search and User Actions */}
        <div className="flex items-center space-x-4">
          <button className="text-gray-300 hover:text-red-500 transition-colors">
            🔍
          </button>
          <button className="text-gray-300 hover:text-red-500 transition-colors">
            👤
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation; 