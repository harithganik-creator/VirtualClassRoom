import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  classroomService,
  materialService,
  assignmentService,
  classService,
  announcementService,
} from '../../services';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import ClassCard from '../../components/ClassCard';
import AnnouncementCard from '../../components/AnnouncementCard';
import Avatar from '../../components/Avatar';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  BookOpen,
  Users,
  Calendar,
  FileText,
  FolderArchive,
  Megaphone,
  PlusCircle,
  Copy,
  Check,
  Download,
  Trash2,
  Video,
  Clock,
  ArrowLeft,
  Upload,
  UserX,
} from 'lucide-react';

export default function ClassroomDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classroom, setClassroom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState(false);

  // Tab datasets
  const [materials, setMaterials] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Modals state
  const [materialModal, setMaterialModal] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [announcementModal, setAnnouncementModal] = useState(false);
  const [removeStudentId, setRemoveStudentId] = useState(null);

  // Material Form
  const [matTitle, setMatTitle] = useState('');
  const [matDesc, setMatDesc] = useState('');
  const [matFile, setMatFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // Schedule Form
  const [classTitle, setClassTitle] = useState('');
  const [classStartTime, setClassStartTime] = useState('');
  const [classEndTime, setClassEndTime] = useState('');
  const [isScheduling, setIsScheduling] = useState(false);

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annMsg, setAnnMsg] = useState('');
  const [isPostingAnn, setIsPostingAnn] = useState(false);

  useEffect(() => {
    fetchClassroomDetails();
  }, [id]);

  const fetchClassroomDetails = async () => {
    try {
      setLoading(true);
      const res = await classroomService.getById(id);
      const data = res.data?.data || res.data;
      setClassroom(data);

      // Load associated resources in parallel
      const [matRes, assignRes, classRes, annRes] = await Promise.allSettled([
        materialService.getAll(id),
        assignmentService.getAll({ classroomId: id }),
        classService.getAll({ classroomId: id }),
        announcementService.getAll(id),
      ]);

      if (matRes.status === 'fulfilled') {
        setMaterials(matRes.value.data?.data || matRes.value.data || []);
      }
      if (assignRes.status === 'fulfilled') {
        setAssignments(assignRes.value.data?.data || assignRes.value.data || []);
      }
      if (classRes.status === 'fulfilled') {
        setClasses(classRes.value.data?.data || classRes.value.data || []);
      }
      if (annRes.status === 'fulfilled') {
        setAnnouncements(annRes.value.data?.data || annRes.value.data || []);
      }
    } catch {
      toast.error('Failed to load classroom details');
    } finally {
      setLoading(false);
    }
  };

  const isTeacherOrAdmin =
    user?.role === 'admin' ||
    (user?.role === 'teacher' &&
      (classroom?.teacherId?._id === user?._id || classroom?.teacherId === user?._id));

  const copyCode = () => {
    if (classroom?.classroomCode) {
      navigator.clipboard.writeText(classroom.classroomCode);
      setCopiedCode(true);
      toast.success('Classroom code copied to clipboard');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Upload Material Handler
  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!matFile) {
      toast.error('Please select a file to upload');
      return;
    }
    const formData = new FormData();
    formData.append('classroomId', id);
    formData.append('title', matTitle);
    formData.append('description', matDesc);
    formData.append('file', matFile);

    try {
      setIsUploading(true);
      const res = await materialService.upload(formData);
      const created = res.data?.data || res.data;
      setMaterials((prev) => [created, ...prev]);
      toast.success('Learning material uploaded successfully!');
      setMaterialModal(false);
      setMatTitle('');
      setMatDesc('');
      setMatFile(null);
    } catch {
      toast.error('Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  // Delete Material Handler
  const handleDeleteMaterial = async (matId) => {
    try {
      await materialService.delete(matId);
      setMaterials((prev) => prev.filter((m) => m._id !== matId));
      toast.success('Material removed');
    } catch {
      toast.error('Failed to delete material');
    }
  };

  // Schedule Class Handler
  const handleScheduleClass = async (e) => {
    e.preventDefault();
    try {
      setIsScheduling(true);
      const res = await classService.create({
        classroomId: id,
        title: classTitle,
        startTime: classStartTime,
        endTime: classEndTime,
      });
      const created = res.data?.data || res.data;
      setClasses((prev) => [created, ...prev]);
      toast.success('Live class session scheduled!');
      setScheduleModal(false);
      setClassTitle('');
      setClassStartTime('');
      setClassEndTime('');
    } catch {
      toast.error('Failed to schedule class');
    } finally {
      setIsScheduling(false);
    }
  };

  // Post Announcement Handler
  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    try {
      setIsPostingAnn(true);
      const res = await announcementService.create({
        classroomId: id,
        title: annTitle,
        message: annMsg,
      });
      const created = res.data?.data || res.data;
      setAnnouncements((prev) => [created, ...prev]);
      toast.success('Announcement published!');
      setAnnouncementModal(false);
      setAnnTitle('');
      setAnnMsg('');
    } catch {
      toast.error('Failed to post announcement');
    } finally {
      setIsPostingAnn(false);
    }
  };

  // Remove Student Handler
  const handleRemoveStudentConfirm = async () => {
    if (!removeStudentId) return;
    try {
      await classroomService.removeStudent(id, removeStudentId);
      toast.success('Student removed from classroom');
      setClassroom((prev) => ({
        ...prev,
        studentIds: prev.studentIds.filter((s) => (s._id || s) !== removeStudentId),
      }));
      setRemoveStudentId(null);
    } catch {
      toast.error('Failed to remove student');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!classroom) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-slate-800">Classroom Not Found</h2>
        <p className="text-slate-500 text-sm mt-2">
          This classroom may have been removed or you do not have permission to view it.
        </p>
        <Link
          to="/classrooms"
          className="inline-flex items-center gap-2 mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold"
        >
          <ArrowLeft size={16} /> Return to Classrooms
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Breadcrumb */}
      <div>
        <Link
          to="/classrooms"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Classrooms
        </Link>
      </div>

      {/* Classroom Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-800 to-purple-800 text-white p-6 sm:p-8 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur">
                {classroom.subject || 'General'}
              </span>
              <span className="text-xs text-indigo-200">
                Created {formatDate(classroom.createdAt)}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {classroom.title}
            </h1>
            <p className="mt-2 text-indigo-100 text-sm max-w-2xl leading-relaxed">
              {classroom.description || 'Welcome to the virtual classroom.'}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-300" />
                Instructor: <strong className="text-white">{classroom.teacherId?.name}</strong>
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-300" />
                {classroom.studentIds?.length || 0} Enrolled Students
              </span>
            </div>
          </div>

          {/* Invitation Code Card */}
          {isTeacherOrAdmin && classroom.classroomCode && (
            <div className="bg-white/10 backdrop-blur rounded-2xl p-4 border border-white/20 text-center flex-shrink-0">
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-medium">
                Classroom Code
              </p>
              <div className="mt-1 flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black tracking-widest text-white">
                  {classroom.classroomCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition text-white"
                  title="Copy Code"
                >
                  {copiedCode ? <Check size={16} className="text-emerald-300" /> : <Copy size={16} />}
                </button>
              </div>
              <p className="text-[11px] text-indigo-200 mt-1">Share with students to enroll</p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', icon: BookOpen },
          { key: 'materials', label: `Materials (${materials.length})`, icon: FolderArchive },
          { key: 'assignments', label: `Assignments (${assignments.length})`, icon: FileText },
          { key: 'schedule', label: `Live Classes (${classes.length})`, icon: Calendar },
          { key: 'announcements', label: `Announcements (${announcements.length})`, icon: Megaphone },
          ...(isTeacherOrAdmin
            ? [{ key: 'students', label: `Students (${classroom.studentIds?.length || 0})`, icon: Users }]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-900 text-lg mb-2">About this Classroom</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {classroom.description || 'No detailed syllabus description provided yet.'}
                </p>
              </div>

              {/* Next upcoming class */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Video className="w-5 h-5 text-indigo-600" /> Upcoming Live Session
                  </h3>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => setScheduleModal(true)}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      + Schedule Class
                    </button>
                  )}
                </div>

                {classes.length === 0 ? (
                  <p className="text-sm text-slate-500">No scheduled sessions for this classroom yet.</p>
                ) : (
                  <ClassCard
                    scheduledClass={classes[0]}
                    userRole={user?.role}
                    onJoin={() => navigate(`/live/${classes[0]._id}`)}
                  />
                )}
              </div>
            </div>

            {/* Right sidebar of overview: Latest Announcement */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-slate-900">Latest Notice</h3>
                  {isTeacherOrAdmin && (
                    <button
                      onClick={() => setAnnouncementModal(true)}
                      className="text-xs font-semibold text-indigo-600 hover:underline"
                    >
                      + Post
                    </button>
                  )}
                </div>

                {announcements.length === 0 ? (
                  <p className="text-sm text-slate-500">No announcements posted yet.</p>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl">
                    <p className="font-bold text-slate-800 text-sm">{announcements[0].title}</p>
                    <p className="text-slate-600 text-xs mt-1 leading-relaxed">
                      {announcements[0].message}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* MATERIALS TAB */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Course Materials & Notes</h3>
                <p className="text-xs text-slate-500">PDFs, handouts, and lecture resources</p>
              </div>
              {isTeacherOrAdmin && (
                <button
                  onClick={() => setMaterialModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  <Upload size={16} /> Upload Material
                </button>
              )}
            </div>

            {materials.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100">
                <EmptyState
                  icon={FolderArchive}
                  title="No Materials Uploaded"
                  description="Learning materials and handouts will appear here once uploaded."
                  actionLabel={isTeacherOrAdmin ? 'Upload File' : null}
                  onAction={() => setMaterialModal(true)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {materials.map((m) => (
                  <div
                    key={m._id}
                    className="p-5 bg-white rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{m.title}</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">
                          {m.fileType || 'PDF'}
                        </span>
                      </div>
                      {m.description && (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2">{m.description}</p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <a
                        href={m.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        <Download size={14} /> View / Download
                      </a>

                      {isTeacherOrAdmin && (
                        <button
                          onClick={() => handleDeleteMaterial(m._id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                          title="Delete material"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Assignments</h3>
                <p className="text-xs text-slate-500">Homework, problem sets, and quizzes</p>
              </div>
              {isTeacherOrAdmin && (
                <Link
                  to="/assignments"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  <PlusCircle size={16} /> Create Assignment
                </Link>
              )}
            </div>

            {assignments.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100">
                <EmptyState
                  icon={FileText}
                  title="No Assignments Posted"
                  description="There are currently no assignments scheduled for this classroom."
                />
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{a.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Due: {formatDate(a.dueDate)} &bull; {a.totalMarks} Points
                      </p>
                    </div>
                    <Link
                      to={`/assignments/${a._id}`}
                      className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SCHEDULE TAB */}
        {activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Scheduled Video Lectures</h3>
                <p className="text-xs text-slate-500">Live conference sessions with Jitsi Meet</p>
              </div>
              {isTeacherOrAdmin && (
                <button
                  onClick={() => setScheduleModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  <Video size={16} /> Schedule Class
                </button>
              )}
            </div>

            {classes.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100">
                <EmptyState
                  icon={Calendar}
                  title="No Live Classes Scheduled"
                  description="No live lectures currently planned for this classroom."
                  actionLabel={isTeacherOrAdmin ? 'Schedule Class' : null}
                  onAction={() => setScheduleModal(true)}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classes.map((c) => (
                  <ClassCard
                    key={c._id}
                    scheduledClass={c}
                    userRole={user?.role}
                    onJoin={() => navigate(`/live/${c._id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANNOUNCEMENTS TAB */}
        {activeTab === 'announcements' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Announcements</h3>
                <p className="text-xs text-slate-500">Notices and updates from instructors</p>
              </div>
              {isTeacherOrAdmin && (
                <button
                  onClick={() => setAnnouncementModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-sm"
                >
                  <Megaphone size={16} /> Post Announcement
                </button>
              )}
            </div>

            {announcements.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 border border-slate-100">
                <EmptyState
                  icon={Megaphone}
                  title="No Announcements"
                  description="When updates are posted, they will appear here."
                />
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((a) => (
                  <AnnouncementCard
                    key={a._id}
                    announcement={a}
                    isOwner={isTeacherOrAdmin}
                    onDelete={async () => {
                      await announcementService.delete(a._id);
                      setAnnouncements((prev) => prev.filter((item) => item._id !== a._id));
                      toast.success('Announcement deleted');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STUDENTS TAB (Teacher / Admin only) */}
        {activeTab === 'students' && isTeacherOrAdmin && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Enrolled Students ({classroom.studentIds?.length || 0})</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {classroom.studentIds?.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No students have enrolled in this classroom yet. Share code{' '}
                  <strong className="text-indigo-600 font-mono">{classroom.classroomCode}</strong>.
                </div>
              ) : (
                classroom.studentIds.map((student) => (
                  <div key={student._id || student} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar user={student} size="sm" />
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">{student.name || 'Student'}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setRemoveStudentId(student._id || student)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Remove student"
                    >
                      <UserX size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* UPLOAD MATERIAL MODAL */}
      <Modal
        isOpen={materialModal}
        onClose={() => setMaterialModal(false)}
        title="Upload Learning Material"
      >
        <form onSubmit={handleUploadMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={matTitle}
              onChange={(e) => setMatTitle(e.target.value)}
              placeholder="e.g. Chapter 4 Lecture Slides"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={matDesc}
              onChange={(e) => setMatDesc(e.target.value)}
              placeholder="Optional notes about this document..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select File (PDF, DOC, PPT) *</label>
            <input
              type="file"
              required
              onChange={(e) => setMatFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setMaterialModal(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SCHEDULE CLASS MODAL */}
      <Modal
        isOpen={scheduleModal}
        onClose={() => setScheduleModal(false)}
        title="Schedule Live Session (Jitsi Meet)"
      >
        <form onSubmit={handleScheduleClass} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Session Topic *</label>
            <input
              type="text"
              required
              value={classTitle}
              onChange={(e) => setClassTitle(e.target.value)}
              placeholder="e.g. Graph Algorithms - Live Discussion"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
            <input
              type="datetime-local"
              required
              value={classStartTime}
              onChange={(e) => setClassStartTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
            <input
              type="datetime-local"
              required
              value={classEndTime}
              onChange={(e) => setClassEndTime(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setScheduleModal(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isScheduling}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isScheduling ? 'Scheduling...' : 'Schedule Class'}
            </button>
          </div>
        </form>
      </Modal>

      {/* POST ANNOUNCEMENT MODAL */}
      <Modal
        isOpen={announcementModal}
        onClose={() => setAnnouncementModal(false)}
        title="Post Classroom Notice"
      >
        <form onSubmit={handlePostAnnouncement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={annTitle}
              onChange={(e) => setAnnTitle(e.target.value)}
              placeholder="e.g. Midterm Project Guidelines"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Message *</label>
            <textarea
              rows={4}
              required
              value={annMsg}
              onChange={(e) => setAnnMsg(e.target.value)}
              placeholder="Type announcement details for students..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAnnouncementModal(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPostingAnn}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isPostingAnn ? 'Posting...' : 'Post Notice'}
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM REMOVE STUDENT */}
      <ConfirmDialog
        isOpen={Boolean(removeStudentId)}
        onClose={() => setRemoveStudentId(null)}
        onConfirm={handleRemoveStudentConfirm}
        title="Remove Student"
        message="Are you sure you want to remove this student from this classroom? They will lose access to course materials."
        confirmText="Remove"
        confirmVariant="danger"
      />
    </div>
  );
}
