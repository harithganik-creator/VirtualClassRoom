import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { materialService, classroomService } from '../../services';
import Spinner from '../../components/Spinner';
import Modal from '../../components/Modal';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';
import {
  FolderArchive,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  FileText,
  File,
} from 'lucide-react';

export default function MaterialsPage() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassroomId, setSelectedClassroomId] = useState('all');

  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadClassroom, setUploadClassroom] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchMaterialsAndClassrooms();
  }, []);

  const fetchMaterialsAndClassrooms = async () => {
    try {
      setLoading(true);
      const [matRes, classRes] = await Promise.allSettled([
        materialService.getAll(),
        classroomService.getAll(),
      ]);

      if (matRes.status === 'fulfilled') {
        setMaterials(matRes.value.data?.data || matRes.value.data || []);
      }
      if (classRes.status === 'fulfilled') {
        const cList = classRes.value.data?.data || classRes.value.data || [];
        setClassrooms(cList);
        if (cList.length > 0) setUploadClassroom(cList[0]._id);
      }
    } catch {
      toast.error('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadClassroom) {
      toast.error('Please select a classroom');
      return;
    }
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('classroomId', uploadClassroom);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('file', file);

    try {
      setIsUploading(true);
      const res = await materialService.upload(formData);
      const created = res.data?.data || res.data;
      setMaterials((prev) => [created, ...prev]);
      toast.success('Study material uploaded successfully!');
      setUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setFile(null);
    } catch {
      toast.error('Failed to upload material');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (matId) => {
    try {
      await materialService.delete(matId);
      setMaterials((prev) => prev.filter((m) => m._id !== matId));
      toast.success('Material deleted');
    } catch {
      toast.error('Failed to delete material');
    }
  };

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass =
      selectedClassroomId === 'all' ||
      m.classroomId?._id === selectedClassroomId ||
      m.classroomId === selectedClassroomId;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Learning Materials & Notes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Access lecture slides, syllabus PDFs, handouts, and reading documents.
          </p>
        </div>

        {user?.role === 'teacher' && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition"
          >
            <Upload className="w-4 h-4" /> Upload Material
          </button>
        )}
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search material titles..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedClassroomId}
            onChange={(e) => setSelectedClassroomId(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 bg-white"
          >
            <option value="all">All Classrooms</option>
            {classrooms.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-8">
          <EmptyState
            icon={FolderArchive}
            title="No Materials Found"
            description={
              searchTerm || selectedClassroomId !== 'all'
                ? 'No documents match your filter criteria.'
                : 'No course materials have been shared yet.'
            }
            actionLabel={user?.role === 'teacher' ? 'Upload First File' : null}
            onAction={() => setUploadModalOpen(true)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-600">
                    {item.fileType || 'PDF'}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 mt-3 text-base line-clamp-1">
                  {item.title}
                </h3>
                {item.classroomId?.title && (
                  <p className="text-xs text-indigo-600 font-medium mt-0.5">
                    {item.classroomId.title}
                  </p>
                )}
                {item.description && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>{formatDate(item.createdAt)}</span>
                <div className="flex items-center gap-2">
                  <a
                    href={item.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    <Download size={14} /> Download
                  </a>
                  {(user?.role === 'teacher' || user?.role === 'admin') && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition"
                      title="Delete file"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Material Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Classroom Document"
      >
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Classroom *
            </label>
            <select
              required
              value={uploadClassroom}
              onChange={(e) => setUploadClassroom(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500 bg-white"
            >
              {classrooms.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 3 Lecture Slides"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional instructions for students..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select File (PDF, DOCX, ZIP) *
            </label>
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-sm text-slate-600 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50"
            >
              {isUploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
