import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import FileUpload from '../../components/FileUpload';
import { formatDate } from '../../utils/helpers';
import {
  Wrench,
  CheckCircle2,
  Clock,
  Inbox,
  ArrowRight,
  Sparkles,
  MapPin,
  Send,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Resolve modal state
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [resolving, setResolving] = useState(false);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints({ limit: 8 });
      if (res.success && res.data) {
        setComplaints(res.data.complaints || []);
      }
    } catch (err) {
      console.error('Failed to load assigned tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleStartProgress = async (complaintId) => {
    try {
      const res = await complaintService.updateStatus(complaintId, {
        status: 'IN_PROGRESS',
        comment: `Work started by ${user.name}`,
      });
      if (res.success) {
        toast.success('Ticket status updated to IN_PROGRESS');
        fetchAssigned();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionText.trim()) {
      toast.error('Please describe how the issue was resolved');
      return;
    }

    try {
      setResolving(true);
      const data = new FormData();
      data.append('resolutionText', resolutionText.trim());
      evidenceFiles.forEach((file) => {
        data.append('evidence', file);
      });

      const res = await complaintService.resolveComplaint(activeComplaint._id, data);
      if (res.success) {
        toast.success('Complaint resolved successfully!');
        setActiveComplaint(null);
        setResolutionText('');
        setEvidenceFiles([]);
        fetchAssigned();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve ticket');
    } finally {
      setResolving(false);
    }
  };

  const assignedCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;

  return (
    <div className="space-y-6">
      {/* Staff Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-md border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Staff Technician Console • {user?.department || 'Field Support'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Technician Dashboard: {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Manage your assigned complaints, update ongoing repair progress, and upload resolution proof for student review.
          </p>
        </div>

        <Link
          to="/staff/complaints"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 flex-shrink-0"
        >
          <Wrench className="w-4 h-4" />
          <span>View All Assigned ({assignedCount})</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard
          title="Assigned Tickets"
          value={assignedCount}
          icon={Clock}
          color="indigo"
          subtitle="Assigned to you or department"
        />
        <StatsCard
          title="In Progress"
          value={inProgressCount}
          icon={Wrench}
          color="purple"
          subtitle="Currently undergoing repair"
        />
        <StatsCard
          title="Resolved by You"
          value={resolvedCount}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Completed tickets"
        />
      </div>

      {/* Active Work Queue */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Active Assigned Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Complaints requiring investigation, updates, or resolution
            </p>
          </div>

          <Link
            to="/staff/complaints"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            All Tickets <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading assigned complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No tickets assigned right now"
            description="You have no pending complaints in your queue. Great job keeping the campus running!"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Ticket ID & Title</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                          {c.complaintId}
                        </span>
                        <Link
                          to={`/student/complaints/${c._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {c.title}
                        </Link>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Category: {c.category} • Filed: {formatDate(c.createdAt)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{c.student?.name}</p>
                      <p className="text-[10px] text-slate-400">{c.student?.phone || c.student?.studentId}</p>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-[140px]">{c.location}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <PriorityBadge priority={c.priority} />
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={c.status} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {c.status === 'ASSIGNED' && (
                          <button
                            onClick={() => handleStartProgress(c._id)}
                            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Start Work
                          </button>
                        )}

                        {c.status === 'IN_PROGRESS' && (
                          <button
                            onClick={() => setActiveComplaint(c)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            Mark Resolved
                          </button>
                        )}

                        <Link
                          to={`/student/complaints/${c._id}`}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          Details
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Resolution Submission Modal */}
      {activeComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Resolve Complaint</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ticket: <span className="font-mono font-bold text-indigo-600">{activeComplaint.complaintId}</span> - {activeComplaint.title}
              </p>
            </div>

            <form onSubmit={handleResolveSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Remarks & Actions Taken <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Detail the repair completed, parts replaced, or tests performed..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Resolution Proof / Photos (Optional)
                </label>
                <FileUpload files={evidenceFiles} setFiles={setEvidenceFiles} maxFiles={3} maxSizeMB={5} />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveComplaint(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resolving}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
                >
                  {resolving ? 'Submitting...' : 'Submit Resolution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDashboard;
