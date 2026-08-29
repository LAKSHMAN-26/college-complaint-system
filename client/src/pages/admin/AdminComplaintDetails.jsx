import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import StatusTimeline from '../../components/StatusTimeline';
import CommentSection from '../../components/CommentSection';
import LoadingSpinner from '../../components/LoadingSpinner';
import FileUpload from '../../components/FileUpload';
import { formatDate } from '../../utils/helpers';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building2,
  User,
  CheckCircle2,
  Edit2,
  ExternalLink,
  Shield,
  FileText,
  Sparkles,
  Phone,
  Mail,
  Flame,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminComplaintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [statusTimeline, setStatusTimeline] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assignment states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignComment, setAssignComment] = useState('');
  const [assigning, setAssigning] = useState(false);

  // Status states
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Resolve states
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [resolving, setResolving] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes, staffRes] = await Promise.all([
        complaintService.getComplaintById(id),
        departmentService.getDepartments(),
        complaintService.getAllStaff(),
      ]);

      if (compRes.success && compRes.data) {
        setComplaint(compRes.data.complaint);
        setStatusTimeline(compRes.data.statusTimeline || []);
      }
      if (deptRes.success) setDepartments(deptRes.data.departments || []);
      if (staffRes.success) setStaffList(staffRes.data.staff || []);
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

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    try {
      setAssigning(true);
      const res = await complaintService.assignDepartmentAndStaff(id, {
        departmentId: selectedDept || undefined,
        staffId: selectedStaff || undefined,
        comment: assignComment.trim() || undefined,
      });

      if (res.success) {
        toast.success('Assignment updated successfully');
        setShowAssignModal(false);
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setAssigning(false);
    }
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingStatus(true);
      const res = await complaintService.updateStatus(id, {
        status: newStatus,
        comment: statusComment.trim() || undefined,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason.trim() : undefined,
      });

      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setShowStatusModal(false);
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      toast.error('Please specify resolution details');
      return;
    }

    try {
      setResolving(true);
      const data = new FormData();
      data.append('resolutionText', resolutionText.trim());
      evidenceFiles.forEach((f) => data.append('evidence', f));

      const res = await complaintService.resolveComplaint(id, data);
      if (res.success) {
        toast.success('Complaint marked as resolved');
        setShowResolveModal(false);
        fetchDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve');
    } finally {
      setResolving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Fetching complaint dossier..." size="large" />;
  }

  if (!complaint) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-600 font-bold text-sm">Complaint record not found.</p>
        <Link to="/admin/complaints" className="mt-3 inline-block text-xs text-indigo-600 font-bold hover:underline">
          Return to All Complaints
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/complaints')}
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

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedDept(complaint.department?._id || '');
              setSelectedStaff(complaint.assignedStaff?._id || '');
              setAssignComment('');
              setShowAssignModal(true);
            }}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Route / Assign</span>
          </button>

          <button
            onClick={() => {
              setNewStatus(complaint.status);
              setStatusComment('');
              setRejectionReason('');
              setShowStatusModal(true);
            }}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Status</span>
          </button>

          {complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED' && (
            <button
              onClick={() => {
                setResolutionText('');
                setEvidenceFiles([]);
                setShowResolveModal(true);
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/30"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Details & Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-3">
              Complaint Record & Submitter Info
            </h2>

            {/* Submitter Info Bar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center">
                  {complaint.student?.name ? complaint.student.name.substring(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm">{complaint.student?.name}</p>
                  <p className="text-xs text-slate-500">
                    ID: {complaint.student?.studentId} • Dept: {complaint.student?.department}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600">
                {complaint.student?.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.student.email}</span>
                  </div>
                )}
                {complaint.student?.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{complaint.student.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
                {complaint.description}
              </p>
            </div>

            {/* Metadata Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Category</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{complaint.category}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Location</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{complaint.location}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Created On</span>
                <span className="text-xs font-semibold text-slate-800 mt-0.5 block">{formatDate(complaint.createdAt)}</span>
              </div>
            </div>

            {/* Current Routing Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-indigo-600 block">Department</span>
                  <span className="text-xs font-bold text-slate-900">
                    {complaint.department?.name || 'Unassigned'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-600 block">Assigned Staff</span>
                  <span className="text-xs font-bold text-slate-900">
                    {complaint.assignedStaff?.name || 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Student Attachments ({complaint.attachments.length})
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

          {/* Official Resolution Card */}
          {complaint.resolution && complaint.resolution.text && (
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-6 border border-emerald-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Recorded Resolution</span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line bg-white/80 p-3.5 rounded-2xl border border-emerald-100">
                {complaint.resolution.text}
              </p>
              <div className="flex items-center justify-between text-[11px] text-emerald-800 font-medium pt-1">
                <span>By: {complaint.resolution.resolvedBy?.name || 'Staff'}</span>
                <span>{formatDate(complaint.resolution.resolvedAt)}</span>
              </div>
            </div>
          )}

          {/* Comment Section */}
          <CommentSection complaintId={complaint._id} />
        </div>

        {/* Right Col: Timeline */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h2 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-3">
              Status Tracking Timeline
            </h2>
            <StatusTimeline history={statusTimeline} currentStatus={complaint.status} />
          </div>
        </div>
      </div>

      {/* Routing Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 text-center">Route & Assign Complaint</h3>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedStaff('');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Staff Member
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="">-- Assign to Any Staff --</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assignment Note
                </label>
                <textarea
                  rows={2}
                  value={assignComment}
                  onChange={(e) => setAssignComment(e.target.value)}
                  placeholder="Notes for the technician..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                >
                  {assigning ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 text-center">Update Lifecycle Status</h3>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {Object.keys(COMPLAINT_STATUS).map((st) => (
                    <option key={st} value={st}>
                      {st.replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>

              {newStatus === 'REJECTED' && (
                <div>
                  <label className="block text-xs font-bold text-rose-700 uppercase tracking-wider mb-1.5">
                    Rejection Reason <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide reason for rejecting this ticket..."
                    className="w-full text-xs p-3 rounded-xl border border-rose-200 resize-none bg-rose-50/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Timeline Remark
                </label>
                <textarea
                  rows={2}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Note for audit log..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <h3 className="text-lg font-bold text-slate-900 text-center">Mark Complaint as Resolved</h3>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Actions & Proof <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Detail the work carried out..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Upload Repair Proof Photos
                </label>
                <FileUpload files={evidenceFiles} setFiles={setEvidenceFiles} maxFiles={3} maxSizeMB={5} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 rounded-xl border text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  {resolving ? 'Submitting...' : 'Mark Resolved'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaintDetails;
