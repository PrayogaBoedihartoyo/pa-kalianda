import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-5">
        <div className="flex justify-between items-center py-4">
          
          {/* Logo/Title */}
          <div className="flex items-center">
            <div className="bg-green-500 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-gray-800">
              PA Kalianda
            </h1>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-2 md:space-x-4">
            <Link
              to="/"
              className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'bg-green-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              📄 Formulir Pengambilan
            </Link>
            
            <Link
              to="/eac"
              className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base font-medium transition-colors ${
                location.pathname === '/eac' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🔐 Permohonan EAC
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;