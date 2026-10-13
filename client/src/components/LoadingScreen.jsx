import React from 'react';
import Spinner from './Spinner';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        {/* Logo circle */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-9 w-9"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
        </div>

        {/* Brand name */}
        <span className="text-2xl font-bold tracking-tight text-indigo-700">
          LearnConnect
        </span>

        {/* Spinner */}
        <Spinner size="md" className="mt-2" />

        {/* Subtitle */}
        <p className="text-sm text-gray-400">Loading your classroom…</p>
      </div>
    </div>
  );
}
