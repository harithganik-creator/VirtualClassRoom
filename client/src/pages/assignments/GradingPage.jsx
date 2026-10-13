import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { assignmentService } from '../../services';
import Spinner from '../../components/Spinner';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { formatDate, formatDateTime } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  FileText,
  ArrowLeft,
  Download,
  Star,
  CheckCircle,
  Clock,
  Save,
} from 'lucide-react';

export default function GradingPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active grading forms: { [submissionId]: { marks, feedback, saving } }
  const [gradingState, setGradingState] = useState({});

  useEffect(() => {
    fetchSubmissions();
  }, [id]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await assignmentService.getById(id);
      const data = res.data;
      setAssignment(data.assignment || null);
      const list = data.submissions || [];
      setSubmissions(list);

      // Initialize state for grading form inputs
      const initialMap = {};
      list.forEach((sub) => {
        initialMap[sub._id] = {
          marks: sub.marks !== undefined ? sub.marks : '',
          feedback: sub.feedback || '',
          saving: false,
        };
      });
      setGradingState(initialMap);
    } catch {
      toast.error('Failed to load assignment submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (subId, field, value) => {
    setGradingState((prev) => ({
      ...prev,
      [subId]: {
        ...prev[subId],
        [field]: value,
      },
    }));
  };

  const handleSaveGrade = async (subId) => {
    const current = gradingState[subId];
    if (current.marks === '' || isNaN(current.marks)) {
      toast.error('Please enter valid marks');
      return;
    }
    const marksNum = Number(current.marks);
    if (marksNum > assignment.totalMarks || marksNum < 0) {
      toast.error(`Marks must be between 0 and ${assignment.totalMarks}`);
      return;
    }

    try {
      setGradingState((prev) => ({
        ...prev,
        [subId]: { ...prev[subId], saving: true },
      }));

      const res = await assignmentService.grade(id, {
        submissionId: subId,
        marks: marksNum,
        feedback: current.feedback,
      });

      // Update local submission list
      const updated = res.data.submission;
      setSubmissions((prev) =>
        prev.map((s) => (s._id === subId ? { ...s, ...updated } : s))
      );
      toast.success('Grade recorded & student notified!');
    } catch {
      toast.error('Failed to save grade');
    } finally {
      setGradingState((prev) => ({
        ...prev,
        [subId]: { ...prev[subId], saving: false },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to={`/assignments/${id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Assignment Details
        </Link>
      </div>

      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
            {assignment?.classroomId?.title || 'Classroom'}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            Grading: {assignment?.title}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Max Score: {assignment?.totalMarks} marks &bull; Due: {formatDate(assignment?.dueDate)}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 px-4 py-3 rounded-xl border border-slate-100 text-center">
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Total Received</p>
            <p className="text-lg font-bold text-slate-800">{submissions.length}</p>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase">Graded</p>
            <p className="text-lg font-bold text-emerald-600">
              {submissions.filter((s) => s.status === 'graded').length}
            </p>
          </div>
        </div>
      </div>

      {/* Submissions List */}
      {submissions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 border border-slate-100">
          <EmptyState
            icon={FileText}
            title="No Submissions Yet"
            description="Students enrolled in this classroom have not submitted any assignments yet."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub) => {
            const state = gradingState[sub._id] || { marks: '', feedback: '', saving: false };
            const isGraded = sub.status === 'graded';

            return (
              <div
                key={sub._id}
                className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-6"
              >
                {/* Left: Student info & Submission file */}
                <div className="space-y-3 flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Avatar user={sub.studentId} size="md" />
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">
                        {sub.studentId?.name || 'Student'}
                      </h3>
                      <p className="text-xs text-slate-500">{sub.studentId?.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> Submitted: {formatDateTime(sub.submittedAt)}
                    </span>
                    {sub.isLate && (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-medium">
                        Late
                      </span>
                    )}
                    {isGraded && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle size={12} /> Graded
                      </span>
                    )}
                  </div>

                  <div>
                    <a
                      href={sub.submissionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold hover:bg-indigo-100 transition"
                    >
                      <Download size={14} /> Download Student's File
                    </a>
                  </div>
                </div>

                {/* Right: Grade & Feedback Form */}
                <div className="w-full md:w-80 bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">
                      Marks (Out of {assignment.totalMarks})
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={assignment.totalMarks}
                      value={state.marks}
                      onChange={(e) => handleGradeChange(sub._id, 'marks', e.target.value)}
                      placeholder="0"
                      className="w-20 px-2.5 py-1 text-right font-bold text-sm bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Feedback
                    </label>
                    <textarea
                      rows={2}
                      value={state.feedback}
                      onChange={(e) => handleGradeChange(sub._id, 'feedback', e.target.value)}
                      placeholder="Constructive feedback for the student..."
                      className="w-full p-2 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <button
                    onClick={() => handleSaveGrade(sub._id)}
                    disabled={state.saving}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    <Save size={14} />
                    {state.saving ? 'Saving...' : isGraded ? 'Update Grade' : 'Submit Grade'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
