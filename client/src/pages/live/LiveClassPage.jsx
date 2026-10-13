import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { useAuth } from '../../context/AuthContext';
import { classService } from '../../services';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import {
  Video,
  ArrowLeft,
  Users,
  Copy,
  Check,
  Maximize2,
  AlertCircle,
  PhoneOff,
} from 'lucide-react';

export default function LiveClassPage() {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [classData, setClassData] = useState(null);
  const [meetingRoomId, setMeetingRoomId] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [jitsiError, setJitsiError] = useState(false);

  useEffect(() => {
    initClassSession();
  }, [classId]);

  const initClassSession = async () => {
    try {
      setLoading(true);
      const res = await classService.join(classId);
      const data = res.data;
      setMeetingRoomId(data.meetingRoomId || `learnconnect-${classId}`);
      setClassData(data.class || null);
    } catch (err) {
      toast.error('Failed to connect to class session');
      setJitsiError(true);
    } finally {
      setLoading(false);
    }
  };

  const copyMeetingId = () => {
    if (meetingRoomId) {
      navigator.clipboard.writeText(meetingRoomId);
      setCopied(true);
      toast.success('Room ID copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <Spinner size="lg" />
        <p className="text-sm font-medium text-slate-600 animate-pulse">
          Connecting to secure video classroom...
        </p>
      </div>
    );
  }

  if (jitsiError || !meetingRoomId) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Connection Failed</h2>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Unable to establish connection with the live classroom room. The class may have concluded or has invalid permissions.
        </p>
        <button
          onClick={() => navigate('/schedule')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition"
        >
          <ArrowLeft size={16} /> Return to Schedule
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Session Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                {classData?.title || 'Live Classroom Lecture'}
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Instructor: {classData?.teacherId?.name || 'Classroom Host'} &bull; Room:{' '}
              <span className="font-mono text-indigo-600 font-semibold">{meetingRoomId}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={copyMeetingId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy Room ID'}
          </button>

          <button
            onClick={() => navigate('/schedule')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition"
          >
            <PhoneOff size={14} /> Leave Session
          </button>
        </div>
      </div>

      {/* Embedded Jitsi Meeting Frame */}
      <div className="flex-1 bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800 relative">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={meetingRoomId}
          configOverwrite={{
            startWithAudioMuted: true,
            disableModeratorIndicator: true,
            startScreenSharing: false,
            enableEmailInStats: false,
            prejoinPageEnabled: false,
          }}
          interfaceConfigOverwrite={{
            DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
            SHOW_JITSI_WATERMARK: false,
          }}
          userInfo={{
            displayName: user?.name || 'Participant',
            email: user?.email || '',
          }}
          onReadyToClose={() => {
            toast.success('You have left the live meeting');
            navigate('/schedule');
          }}
          getIFrameRef={(iframeRef) => {
            iframeRef.style.height = '100%';
            iframeRef.style.width = '100%';
            iframeRef.style.border = 'none';
          }}
          loadingComponent={
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <Spinner size="lg" />
              <p className="text-sm">Initializing Jitsi WebRTC video stream...</p>
            </div>
          }
        />
      </div>
    </div>
  );
}
