import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StatusTimeline from '../../components/StatusTimeline';
import CommentSection from '../../components/CommentSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  RotateCcw,
  Star,
  ExternalLink,
  ShieldAlert,
  FileText,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  // Close & rating modal states
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [closing, setClosing] = useState(false);

  // Reopen modal states
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopening, setReopening] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.data) {
        setComplaint(res.data.complaint);
        setStatusTimeline(res.data.statusTimeline || []);
      }
    } catch (err) {
      toast.error('Failed to load complaint details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDetails();
  }, [id]);

  const handleCloseComplaint = async (e) => {
    e.preventDefault();
    try {
      setClosing(true);
      const res = await complaintService.closeComplaint(id, {
        rating,
        feedbackComment,
      });
      if (res.success) {
        toast.success('Complaint closed. Thank you for your feedback!');
        setShowCloseModal(false);
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close complaint');
    } finally {
      setClosing(false);
    }
  };

  const handleReopenComplaint = async (e) => {
    e.preventDefault();
    if (!reopenReason.trim()) {
      toast.error('Please specify why this complaint is being reopened');
      return;
    }
    try {
      setReopening(true);
      const res = await complaintService.reopenComplaint(id, reopenReason);
      if (res.success) {
        toast.success('Complaint reopened and routed to admin team');
        setShowReopenModal(false);
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reopen complaint');
    } finally {
      setReopening(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching complaint details and history..." size="large" />;
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-bold text-sm">Complaint not found.</p>
        <Link
          to="/student/complaints"
          className="mt-3 inline-block text-xs text-indigo-600 font-bold hover:underline"
        >
          Return to My Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/student/complaints')}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                {complaint.complaintId}
              </span>
              <PriorityBadge priority={complaint.priority} />
              <StatusBadge status={complaint.status} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {complaint.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons for Student */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {complaint.status !== 'CLOSED' && complaint.status !== 'REJECTED' && (
            <button
              onClick={() => setShowCloseModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm & Close Ticket</span>
            </button>
          )}

          {(complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') && (
            <button
              onClick={() => setShowReopenModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reopen Issue</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left Details & Right Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Complaint Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Grievance Details
            </h2>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            {/* Metadata grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Category</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                  {complaint.category}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                  {complaint.location}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Date Filed</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block truncate">
                  {formatDate(complaint.createdAt)}
                </span>
              </div>
            </div>

            {/* Department and Staff Routing */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">
                    Assigned Department
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {complaint.department?.name || 'Awaiting Routing'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">
                    Assigned Technician
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {complaint.assignedStaff?.name || 'Pending Staff Assignment'}
                  </span>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Uploaded Evidence ({complaint.attachments.length})
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.attachments.map((att, i) => (
                    <a
                      key={i}
                      href={att.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 flex items-center justify-center hover:shadow-md transition-all"
                    >
                      {att.mimetype?.startsWith('image/') || att.url.match(/\.(jpg|jpeg|png|webp|gif)/i) ? (
                        <img
                          src={att.url}
                          alt="Attachment"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-600 p-2">
                          <FileText className="w-6 h-6 text-red-500" />
                          <span className="text-[10px] font-semibold truncate max-w-[100px]">
                            {att.filename || 'PDF Document'}
                          </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-1">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Official Resolution Card (if resolved/closed) */}
          {complaint.resolution && complaint.resolution.text && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Official Resolution Summary</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-2xl border border-emerald-100">
                {complaint.resolution.text}
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium pt-1">
                <span>Resolved by: {complaint.resolution.resolvedBy?.name || 'Campus Staff'}</span>
                <span>{formatDate(complaint.resolution.resolvedAt)}</span>
              </div>
            </div>
          )}

          {/* Feedback Rating Card (if submitted) */}
          {complaint.feedback && complaint.feedback.rating && (
            <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Student Feedback & Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= complaint.feedback.rating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-slate-700 italic bg-white/70 p-3 rounded-xl border border-amber-100">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}

          {/* Comment & Discussion Thread */}
          <CommentSection complaintId={complaint._id} />
        </div>

        {/* Right Column: Status Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
              Status Tracking Timeline
            </h2>
            <StatusTimeline history={statusTimeline} currentStatus={complaint.status} />
          </div>
        </div>
      </div>

      {/* Close & Rating Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Close Complaint</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Confirm that this issue has been resolved to your satisfaction
              </p>
            </div>

            <form onSubmit={handleCloseComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Rate Resolution Quality
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1.5 focus:outline-none transition-transform hover:scale-125"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-slate-200 hover:text-amber-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Feedback Remarks (Optional)
                </label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share feedback on repair quality, speed, or technician professionalism..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={closing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                >
                  {closing ? 'Submitting...' : 'Confirm Closure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <RotateCcw className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reopen Complaint</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Explain what remains unresolved so technicians can re-investigate
              </p>
            </div>

            <form onSubmit={handleReopenComplaint} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reason for Reopening <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={reopenReason}
                  onChange={(e) => setReopenReason(e.target.value)}
                  placeholder="e.g. The Wi-Fi stopped working again after 2 hours..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReopenModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reopening}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all"
                >
                  {reopening ? 'Reopening...' : 'Submit Reopen Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentComplaintDetails;
