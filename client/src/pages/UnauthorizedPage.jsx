import { Link } from 'react-router-dom';
import { ShieldOff, Home, BookOpen, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="text-center max-w-lg">
        {/* Illustration */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-36 h-36 bg-red-100 rounded-full flex items-center justify-center">
              <ShieldOff className="w-16 h-16 text-red-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-500 font-bold text-sm">403</span>
            </div>
          </div>
        </div>

        {/* Code */}
        <p className="text-8xl font-extrabold text-red-500 tracking-tight leading-none mb-4">
          403
        </p>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">Access Denied</h1>

        {/* Message */}
        <p className="text-gray-500 text-base leading-relaxed mb-3 max-w-sm mx-auto">
          You don't have permission to view this page. This area is restricted to authorized users
          only.
        </p>
        <p className="text-gray-400 text-sm mb-8 max-w-xs mx-auto">
          If you believe this is a mistake, please contact your administrator or sign in with an
          account that has the required permissions.
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
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>

        {/* Hint */}
        <div className="mt-8 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg px-4 py-2.5 text-xs">
          <span>💡</span>
          <span>Try signing in with an account that has the required role.</span>
        </div>

        {/* Brand */}
        <div className="mt-10 flex items-center justify-center gap-2 text-gray-400">
          <BookOpen className="w-4 h-4" />
          <span className="text-sm font-medium">LearnConnect</span>
        </div>
      </div>
    </div>
  );
}
