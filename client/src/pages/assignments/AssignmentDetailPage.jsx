import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { assignmentService } from '../../services';
import Spinner from '../../components/Spinner';
import { formatDate, formatDateTime, isOverdue } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  FileText,
  Clock,
  Star,
  CheckCircle,
  AlertCircle,
  Download,
  Upload,
  ArrowLeft,
  Users,
  Check,
  Award,
} from 'lucide-react';

export default function AssignmentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [submissionsList, setSubmissionsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Student upload submission state
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getById(id);
      const data = res.data;
      setAssignment(data.assignment || null);
      setSubmission(data.submission || null);
      setSubmissionsList(data.submissions || []);
    } catch {
      toast.error('Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitWork = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file to submit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsSubmitting(true);
      const res = await assignmentService.submit(id, formData);
      setSubmission(res.data.submission);
      toast.success('Assignment submitted successfully!');
      setFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Assignment Not Found</h2>
        <Link
          to="/assignments"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Return to Assignments
        </Link>
      </div>
    );
  }

  const isTeacher =
    user?.role === 'teacher' ||
    user?.role === 'admin' ||
    assignment.teacherId?._id === user?._id;

  const pastDue = isOverdue(assignment.dueDate);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/assignments"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignments
        </Link>
      </div>

      {/* Assignment Header Card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                {assignment.classroomId?.title || 'Classroom'}
              </span>
              <span className="text-xs text-slate-400">
                Posted by {assignment.teacherId?.name}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{assignment.title}</h1>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 flex-shrink-0">
            <span className="text-sm font-bold text-slate-800">
              {assignment.totalMarks} Total Points
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                pastDue ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-700'
              }`}
            >
              Due {formatDate(assignment.dueDate)}
            </span>
          </div>
        </div>

        {/* Instructions Body */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
            Instructions
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {assignment.description || 'No additional instructions provided for this assignment.'}
          </p>
        </div>

        {/* Attachment if present */}
        {assignment.attachmentUrl && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs font-semibold text-slate-800">Reference Material Attached</p>
                <p className="text-[11px] text-slate-500">Download to view problem sheet</p>
              </div>
            </div>
            <a
              href={assignment.attachmentUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 shadow-sm"
            >
              <Download size={14} /> Download File
            </a>
          </div>
        )}
      </div>

      {/* Teacher Action Banner */}
      {isTeacher && (
        <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-indigo-950 text-base">Teacher Grading Center</h3>
            <p className="text-xs text-indigo-700 mt-1">
              {submissionsList.length} student submission(s) received for this assignment.
            </p>
          </div>
          <Link
            to={`/assignments/${id}/grade`}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm transition"
          >
            Review & Grade Submissions
          </Link>
        </div>
      )}

      {/* Student Submission Card */}
      {!isTeacher && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Your Submission</h2>

          {submission ? (
            /* Already submitted */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-emerald-900">Work Submitted</h3>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      Submitted on {formatDateTime(submission.submittedAt)}
                    </p>
                  </div>
                </div>
                <a
                  href={submission.submissionUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
                >
                  <Download size={14} /> View File
                </a>
              </div>

              {/* Feedback and Grade if graded */}
              {submission.status === 'graded' ? (
                <div className="p-5 rounded-xl bg-indigo-50 border border-indigo-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
                    <h4 className="font-bold text-indigo-950 text-sm">Graded Evaluation</h4>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-indigo-700">
                      {submission.marks}
                    </span>
                    <span className="text-sm text-indigo-500 font-medium">
                      / {assignment.totalMarks} Points
                    </span>
                  </div>
                  {submission.feedback && (
                    <div className="mt-3 pt-3 border-t border-indigo-200/60">
                      <p className="text-xs font-semibold text-indigo-900">Instructor Feedback:</p>
                      <p className="text-xs text-indigo-800 mt-1 italic">
                        "{submission.feedback}"
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-500">
                  ⏳ Your submission is awaiting grading from your instructor.
                </div>
              )}
            </div>
          ) : (
            /* Upload submission form */
            <form onSubmit={handleSubmitWork} className="space-y-4">
              <p className="text-xs text-slate-500">
                Upload your solution file (PDF, DOCX, ZIP or image format) to submit your assignment for grading.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attach Solution File *
                </label>
                <input
                  type="file"
                  required
                  onChange={(e) => setFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                />
              </div>

              {pastDue && (
                <p className="text-xs text-rose-500 font-medium">
                  ⚠️ Note: The deadline for this assignment has passed. Your submission will be marked as Late.
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !file}
                className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-100 disabled:opacity-50 transition"
              >
                {isSubmitting ? 'Uploading Submission...' : 'Turn In Assignment'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
