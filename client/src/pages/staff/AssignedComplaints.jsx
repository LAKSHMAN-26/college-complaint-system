import React, { useState, useEffect } from 'react';
import { complaintService } from '../../services/complaintService';
import ComplaintCard from '../../components/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { COMPLAINT_CATEGORIES, COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';
import { Search, RefreshCw, Inbox, CheckSquare } from 'lucide-react';

const AssignedComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, totalItems: 0 });

  const [filters, setFilters] = useState({
    search: '',
    status: 'ALL',
    category: 'ALL',
    priority: 'ALL',
    page: 1,
  });

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getAllComplaints({
        search: filters.search,
        status: filters.status,
        category: filters.category,
        priority: filters.priority,
        page: filters.page,
        limit: 9,
      });

      if (res.success && res.data) {
        setComplaints(res.data.complaints || []);
        setPagination(res.data.pagination || { page: 1, totalPages: 1, totalItems: 0 });
      }
    } catch (err) {
      console.error('Failed to load assigned tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
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
      page: 1,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Assigned Work Queue
        </h1>
        <p className="text-xs text-slate-500">
          All complaints routed to your department or assigned directly to your profile
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by ID, title, student..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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

      {/* Grid */}
      {loading ? (
        <LoadingSpinner text="Searching assigned complaints..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No assigned complaints found"
          description="Try broadening your filter criteria or check back when new tickets arrive."
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                basePath="/student/complaints"
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <p className="text-xs text-slate-500">
                Page <span className="font-bold text-slate-800">{pagination.page}</span> of{' '}
                <span className="font-bold text-slate-800">{pagination.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => handleFilterChange('page', pagination.page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handleFilterChange('page', pagination.page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AssignedComplaints;
