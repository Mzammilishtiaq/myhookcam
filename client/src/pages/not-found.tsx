// src/pages/NotFound.jsx
import { LucideHome } from 'lucide-react';
import React from 'react';
import { Link } from 'react-router-dom'; // if using react-router
// or use <a href="/"> if not using router

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* Logo / Brand mark */}
        {/* <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
            <span className="text-white text-2xl font-bold tracking-tight">AC</span>
          </div>
        </div> */}

        {/* 404 Number */}
        <h1 className="text-8xl md:text-9xl font-black text-gray-800 tracking-tight mb-2">
          404
        </h1>

        {/* Main heading */}
        <h2 className="text-3xl md:text-4xl font-bold text-gray-700 mb-4">
          Page Not Found
        </h2>

        {/* Description */}
        {/* <p className="text-lg text-gray-600 mb-10 leading-relaxed">
          The page you are looking for might have been removed, had its name changed,
          or is temporarily unavailable.
        </p> */}

        {/* CTA Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-600 
                     text-white font-medium rounded-xl shadow-md hover:shadow-lg 
                     transition-all duration-200 transform hover:-translate-y-0.5"
        >
        <LucideHome/>
          Go to Homepage
        </Link>

        {/* Support link */}
        {/* <p className="mt-12 text-sm text-gray-500">
          Need help?{' '}
          <a 
            href="mailto:support@yourdomain.com" 
            className="text-amber-600 hover:text-amber-700 hover:underline"
          >
            Contact Support
          </a>
        </p> */}
      </div>
    </div>
  );
}