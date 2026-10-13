import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BookOpen,
  Video,
  FileText,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Sparkles,
  Laptop,
  Clock,
  Award,
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <BookOpen className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
              LearnConnect
            </span>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to={user.role === 'admin' ? '/admin' : '/dashboard'}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
              >
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 transition"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-indigo-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100/80 text-indigo-700 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Next-Generation Virtual Classroom Experience
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Connect, Teach, and Learn{' '}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 bg-clip-text text-transparent">
              Everywhere.
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            The all-in-one virtual learning ecosystem: conduct live browser-based video lectures, organize coursework, review assignments, and empower student success.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-lg shadow-indigo-200 transition"
            >
              <GraduationCap className="w-5 h-5" /> Start Learning for Free
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm transition"
            >
              Sign In to Your Classes <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Built-in Jitsi Meet Video
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Interactive Assignment Grading
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Real-time Course Notifications
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              Complete Educational Toolset
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 mt-2">
              Everything Needed for Modern Online Classes
            </h3>
            <p className="mt-3 text-slate-500 text-sm">
              Designed from the ground up for seamless interaction between instructors, students, and academic administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <Video className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Live Video Classes</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Zero installation needed. Built-in Jitsi Meet integration allows students and teachers to connect right inside their browsers with screen sharing and chat.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Assignments & Evaluation</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Create structured assignments with deadlines. Collect student solution uploads, evaluate submissions, and assign scores with individualized feedback.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Lecture Materials & PDFs</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Distribute study materials, course outlines, and presentations securely in the cloud with instant view and download access for registered students.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Classroom Codes</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Teachers generate unique 8-character classroom codes that students use to enroll with one click without friction or email invites.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Intelligent Timetables</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Automatic status tracking shifts classes from upcoming to live and completed. Clear agendas ensure no student misses a lecture.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-slate-50/70 rounded-2xl p-6 border border-slate-100 space-y-3 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900">Administrative Governance</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Robust role-based access control (Student, Teacher, Admin). System admins can manage accounts, review security, and audit classes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action section */}
      <section className="py-16 bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to upgrade your virtual classroom?
          </h2>
          <p className="text-indigo-100 text-base max-w-xl mx-auto">
            Join LearnConnect today and discover a simpler, faster way to conduct online education.
          </p>
          <div className="pt-2">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-indigo-700 font-bold text-sm shadow-xl hover:bg-indigo-50 transition"
            >
              Create Your Free Account <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-white font-semibold">
            <BookOpen size={18} className="text-indigo-400" /> LearnConnect Virtual Classroom
          </div>
          <div>
            &copy; {new Date().getFullYear()} LearnConnect Education Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
