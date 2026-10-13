import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { classroomService } from '../../services';
import toast from 'react-hot-toast';
import {
  GraduationCap,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

export default function JoinClassroomPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [joinedClassroom, setJoinedClassroom] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cleanCode = code.trim().toUpperCase();
    if (!cleanCode) {
      toast.error('Please enter a classroom code');
      return;
    }

    try {
      setSubmitting(true);
      const res = await classroomService.join(cleanCode);
      const data = res.data?.data || res.data?.classroom || res.data;
      setJoinedClassroom(data);
      toast.success('Successfully joined the classroom!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to join classroom. Please verify the code.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Back link */}
      <div>
        <Link
          to="/classrooms"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classrooms
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 text-white text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center mx-auto mb-3 shadow-inner">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Join a Virtual Classroom</h1>
          <p className="mt-1 text-sm text-indigo-100 max-w-sm mx-auto">
            Enter the unique 8-character invitation code provided by your teacher.
          </p>
        </div>

        {/* Content area */}
        <div className="p-6 sm:p-8">
          {joinedClassroom ? (
            /* Success confirmation card */
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Enrolled Successfully!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  You are now enrolled in{' '}
                  <span className="font-semibold text-slate-800">
                    {joinedClassroom.title || 'the classroom'}
                  </span>
                  .
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-left text-sm space-y-1">
                <p className="text-slate-500">
                  <strong className="text-slate-700">Subject:</strong> {joinedClassroom.subject || 'General'}
                </p>
                {joinedClassroom.teacherId?.name && (
                  <p className="text-slate-500">
                    <strong className="text-slate-700">Teacher:</strong> {joinedClassroom.teacherId.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setJoinedClassroom(null);
                    setCode('');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Join Another
                </button>
                <button
                  onClick={() => navigate(`/classrooms/${joinedClassroom._id}`)}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-100"
                >
                  Go to Classroom <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Join Form */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Classroom Code
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. 7A8B9C1D"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 text-center text-lg font-mono tracking-widest uppercase font-bold focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 text-center">
                  Class codes are usually 8 letters and numbers without spaces.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting || code.trim().length === 0}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-200 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Verifying Code...
                  </>
                ) : (
                  <>
                    Join Classroom <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 space-y-1 leading-relaxed">
                  <p className="font-semibold text-slate-800">Need help finding your code?</p>
                  <p>
                    Ask your instructor or class teacher for the invitation code from their classroom management dashboard.
                  </p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
