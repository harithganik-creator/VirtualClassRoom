import { Link } from 'react-router-dom';
import { Home, BookOpen, SearchX } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-36 h-36 bg-indigo-100 rounded-full flex items-center justify-center">
              <SearchX className="w-16 h-16 text-indigo-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>

        {/* 404 */}
        <p className="text-8xl font-extrabold text-indigo-600 tracking-tight leading-none mb-4">
          404
        </p>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>

        {/* Message */}
        <p className="text-gray-500 text-base leading-relaxed mb-8 max-w-sm mx-auto">
          Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on
          track.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition shadow-sm text-sm"
          >
            <Home className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-3 rounded-xl transition text-sm"
          >
            Go Back
          </button>
        </div>

        {/* Brand */}
        <div className="mt-12 flex items-center justify-center gap-2 text-gray-400">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">LearnConnect</span>
        </div>
      </div>
    </div>
  );
}
