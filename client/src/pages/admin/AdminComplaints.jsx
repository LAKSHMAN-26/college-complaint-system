import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import { departmentService } from '../../services/departmentService';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/helpers';
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUS,
  COMPLAINT_PRIORITY,
} from '../../utils/constants';
import {
  Search,
  RefreshCw,
  Building2,
  UserCheck,
  Edit,
  ExternalLink,
  Shield,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Wrench,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    category: 'ALL',
    priority: 'ALL',
    department: 'ALL',
    page: 1,
  });

  // Modal states
  const [assignModalData, setAssignModalData] = useState(null); // complaint object
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStaff, setSelectedStaff] = useState('');
  const [assignComment, setAssignComment] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [statusModalData, setStatusModalData] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [priorityModalData, setPriorityModalData] = useState(null);
  const [newPriority, setNewPriority] = useState('');
  const [updatingPriority, setUpdatingPriority] = useState(false);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints({
        search: filters.search,
        status: filters.status,
        category: filters.category,
        priority: filters.priority,
        department: filters.department,
        page: filters.page,
        limit: 10,
      });

      if (res.success && res.data) {
        setComplaints(res.data.complaints || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDependencies = async () => {
    try {
      const [deptRes, staffRes] = await Promise.all([
        departmentService.getDepartments(),
        complaintService.getAllStaff(),
      ]);
      if (deptRes.success) setDepartments(deptRes.data.departments || []);
      if (staffRes.success) setStaffList(staffRes.data.staff || []);
    } catch (err) {
      console.error('Failed to load departments/staff list:', err);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      search: '',
      status: 'ALL',
      category: 'ALL',
      priority: 'ALL',
      department: 'ALL',
      page: 1,
    });
  };

  // Open Assign Modal
  const openAssignModal = (complaint) => {
    setAssignModalData(complaint);
    setSelectedDept(complaint.department?._id || '');
    setSelectedStaff(complaint.assignedStaff?._id || '');
    setAssignComment('');
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDept && !selectedStaff) {
      toast.error('Please select at least a department or a staff member');
      return;
    }

    try {
      setAssigning(true);
      const res = await complaintService.assignDepartmentAndStaff(assignModalData._id, {
        departmentId: selectedDept || undefined,
        staffId: selectedStaff || undefined,
        comment: assignComment.trim() || undefined,
      });

      if (res.success) {
        toast.success('Complaint assigned successfully');
        setAssignModalData(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign complaint');
    } finally {
      setAssigning(false);
    }
  };

  // Open Status Modal
  const openStatusModal = (complaint) => {
    setStatusModalData(complaint);
    setNewStatus(complaint.status);
    setStatusComment('');
    setRejectionReason('');
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      toast.error('Please specify a rejection reason');
      return;
    }

    try {
      setUpdatingStatus(true);
      const res = await complaintService.updateStatus(statusModalData._id, {
        status: newStatus,
        comment: statusComment.trim() || undefined,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason.trim() : undefined,
      });

      if (res.success) {
        toast.success(`Status updated to ${newStatus}`);
        setStatusModalData(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Open Priority Modal
  const openPriorityModal = (complaint) => {
    setPriorityModalData(complaint);
    setNewPriority(complaint.priority);
  };

  const handlePrioritySubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdatingPriority(true);
      const res = await complaintService.updatePriority(priorityModalData._id, newPriority);
      if (res.success) {
        toast.success(`Priority updated to ${newPriority}`);
        setPriorityModalData(null);
        fetchComplaints();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update priority');
    } finally {
      setUpdatingPriority(false);
    }
  };

  // Filter staff by selected department in assign modal
  const filteredStaff = selectedDept
    ? staffList.filter((s) => s.departmentRef?._id === selectedDept || s.department === departments.find(d => d._id === selectedDept)?.name)
    : staffList;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Institutional Complaints & Triage
          </h1>
          <p className="text-xs text-slate-500">
            Route complaints to departments, assign technicians, update severity, and track lifecycle status
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/admin/departments"
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
          >
            Manage Departments
          </Link>
          <Link
            to="/admin/staff"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-md shadow-indigo-600/30"
          >
            Staff Directory
          </Link>
        </div>
      </div>

      {/* Advanced Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search ID, title, room..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status */}
          <div>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Statuses</option>
              {Object.keys(COMPLAINT_STATUS).map((st) => (
                <option key={st} value={st}>
                  {st.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Categories</option>
              {COMPLAINT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <select
              value={filters.department}
              onChange={(e) => handleFilterChange('department', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Priority & Reset */}
          <div className="flex items-center gap-2">
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ALL">All Priorities</option>
              {Object.keys(COMPLAINT_PRIORITY).map((pr) => (
                <option key={pr} value={pr}>
                  {pr}
                </option>
              ))}
            </select>

            <button
              onClick={handleReset}
              className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold"
              title="Reset Filters"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner text="Fetching institutional complaint logs..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints match these filters"
            description="Try loosening your search terms or filter constraints."
            action={
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
              >
                Reset Filters
              </button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Ticket & Title</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Routing</th>
                  <th className="py-3.5 px-4 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                    {/* ID & Title */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                          {c.complaintId}
                        </span>
                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                        >
                          {c.title}
                        </Link>
                      </div>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Category: {c.category} • {formatDate(c.createdAt)}
                      </span>
                    </td>

                    {/* Student */}
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800">{c.student?.name}</p>
                      <p className="text-[10px] text-slate-400">{c.student?.studentId} • {c.student?.department}</p>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <span className="text-slate-700 truncate max-w-[120px] block">
                        {c.location}
                      </span>
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openPriorityModal(c)}
                        title="Click to edit priority"
                        className="hover:scale-105 transition-transform"
                      >
                        <PriorityBadge priority={c.priority} />
                      </button>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => openStatusModal(c)}
                        title="Click to update status"
                        className="hover:scale-105 transition-transform"
                      >
                        <StatusBadge status={c.status} />
                      </button>
                    </td>

                    {/* Department & Staff */}
                    <td className="py-3.5 px-4">
                      <div className="text-[11px]">
                        <span className="font-bold text-slate-800 block">
                          {c.department?.name || <span className="italic text-slate-400">No Dept</span>}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {c.assignedStaff ? `Staff: ${c.assignedStaff.name}` : 'Unassigned Tech'}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openAssignModal(c)}
                          className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Assign Department & Staff"
                        >
                          <Building2 className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Assign</span>
                        </button>

                        <button
                          onClick={() => openStatusModal(c)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                          title="Change Status"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="hidden xl:inline">Status</span>
                        </button>

                        <Link
                          to={`/admin/complaints/${c._id}`}
                          className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                          title="View Full Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-800">{pagination.page}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.totalPages}</span> ({pagination.totalItems} complaints)
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => handleFilterChange('page', pagination.page - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-white bg-white"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => handleFilterChange('page', pagination.page + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-white bg-white"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">Route & Assign Ticket</h3>
              <p className="text-xs text-slate-500 text-center mt-0.5">
                Ticket: <span className="font-mono font-bold text-indigo-600">{assignModalData.complaintId}</span>
              </p>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Department
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedStaff('');
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  Select Staff Technician (Optional)
                </label>
                <select
                  value={selectedStaff}
                  onChange={(e) => setSelectedStaff(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Assign to Any Available Tech --</option>
                  {filteredStaff.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.department || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Assignment Note / Instruction
                </label>
                <textarea
                  rows={2}
                  value={assignComment}
                  onChange={(e) => setAssignComment(e.target.value)}
                  placeholder="e.g. Please check this switch on priority before lab exam tomorrow..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssignModalData(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigning}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  {assigning ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-2 shadow-inner">
                <Edit className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 text-center">Update Lifecycle Status</h3>
              <p className="text-xs text-slate-500 text-center mt-0.5">
                Ticket: <span className="font-mono font-bold text-indigo-600">{statusModalData.complaintId}</span>
              </p>
            </div>

            <form onSubmit={handleStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                    placeholder="Provide a clear justification to the student for why this complaint is rejected..."
                    className="w-full text-xs p-3 rounded-xl border border-rose-200 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none bg-rose-50/30"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Status Change Remark (Optional)
                </label>
                <textarea
                  rows={2}
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add note to timeline..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusModalData(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStatus}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Priority Update Modal */}
      {priorityModalData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 text-center">Change Priority Severity</h3>

            <form onSubmit={handlePrioritySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority
                </label>
                <select
                  value={newPriority}
                  onChange={(e) => setNewPriority(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.keys(COMPLAINT_PRIORITY).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPriorityModalData(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingPriority}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all"
                >
                  Save Priority
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComplaints;
