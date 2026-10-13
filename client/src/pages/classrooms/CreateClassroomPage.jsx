import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { classroomService } from '../../services';
import toast from 'react-hot-toast';
import { BookOpen, ArrowLeft, Loader2, Sparkles } from 'lucide-react';

const SUBJECT_OPTIONS = [
  'Mathematics',
  'Science',
  'English',
  'History',
  'Geography',
  'Physics',
  'Chemistry',
  'Biology',
  'Computer Science',
  'Art',
  'Music',
  'Economics',
  'Other',
];

export default function CreateClassroomPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      subject: 'Computer Science',
      description: '',
    },
  });

  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      const res = await classroomService.create(data);
      toast.success('Classroom created successfully!');
      const created = res.data?.data || res.data;
      navigate(`/classrooms/${created._id || ''}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create classroom';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/classrooms"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classrooms
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Banner header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
          <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center mb-3">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create a New Classroom</h1>
          <p className="mt-1 text-sm text-indigo-100">
            Set up an interactive space for lecture notes, live classes, and student assignments.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Classroom Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Advanced Data Structures & Algorithms"
              {...register('title', {
                required: 'Classroom title is required',
                minLength: { value: 3, message: 'Title must be at least 3 characters' },
              })}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition ${
                errors.title
                  ? 'border-rose-400 bg-rose-50/20'
                  : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
              }`}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-500">{errors.title.message}</p>
            )}
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Subject Area <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('subject', { required: 'Please select a subject' })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            >
              {SUBJECT_OPTIONS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Course Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe what students will learn, syllabus goals, prerequisites..."
              {...register('description')}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition"
            />
          </div>

          {/* Notice about Classroom Code */}
          <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-indigo-800 leading-relaxed">
              <strong>Unique Access Code:</strong> LearnConnect will automatically generate a unique 8-character invitation code for this classroom. You can share this code with students so they can join easily.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/classrooms')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md shadow-indigo-200 disabled:opacity-50 transition"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating...
                </>
              ) : (
                'Create Classroom'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
