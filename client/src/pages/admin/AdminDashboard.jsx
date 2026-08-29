import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../../services/complaintService';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import PriorityBadge from '../../components/PriorityBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatDate } from '../../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  FileText,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  ArrowRight,
  TrendingUp,
  Timer,
  Sparkles,
} from 'lucide-react';

const COLORS = ['#6366f1', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4', '#84cc16'];
const PRIORITY_COLORS = {
  LOW: '#94a3b8',
  MEDIUM: '#3b82f6',
  HIGH: '#f59e0b',
  CRITICAL: '#ef4444',
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading || !stats) {
    return <LoadingSpinner text="Computing campus grievance statistics and charts..." size="large" />;
  }

  const {
    statusCounts,
    categoryDistribution,
    priorityDistribution,
    departmentDistribution,
    avgResolutionHours,
    monthlyTrends,
    recentComplaints,
  } = stats;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-indigo-900/40">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CampusResolve Administration & Governance Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Grievance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Real-time telemetry on college complaint volumes, department resolution rates, and facility health.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <Link
            to="/admin/complaints"
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
          >
            Manage All Tickets
          </Link>
          <Link
            to="/admin/departments"
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all"
          >
            Departments
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatsCard
          title="Total Complaints"
          value={statusCounts.total || 0}
          icon={FileText}
          color="indigo"
          subtitle="All-time registered"
        />
        <StatsCard
          title="Submitted"
          value={statusCounts.submitted || 0}
          icon={Clock}
          color="amber"
          subtitle="Awaiting triage"
        />
        <StatsCard
          title="Assigned"
          value={statusCounts.assigned || 0}
          icon={Building2}
          color="blue"
          subtitle="Routed to dept"
        />
        <StatsCard
          title="In Progress"
          value={statusCounts.inProgress || 0}
          icon={Wrench}
          color="purple"
          subtitle="Technicians on-site"
        />
        <StatsCard
          title="Resolved / Closed"
          value={(statusCounts.resolved || 0) + (statusCounts.closed || 0)}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully fixed"
        />
        <StatsCard
          title="Avg Resolution"
          value={`${avgResolutionHours}h`}
          icon={Timer}
          color="slate"
          subtitle="Mean time to repair"
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Submission vs Resolution Trend Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Monthly Activity Trend
              </h2>
              <p className="text-xs text-slate-500">Submitted vs Resolved tickets over 6 months</p>
            </div>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSubmitted)"
                  name="Filed Complaints"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorResolved)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Complaints by Category Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Complaints by Category
              </h2>
              <p className="text-xs text-slate-500">Distribution across campus facility sectors</p>
            </div>
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical">
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis
                  dataKey="name"
                  type="category"
                  width={110}
                  tick={{ fontSize: 10, fill: '#475569' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Priority Distribution & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Priority Donut Chart */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Priority Breakdown</h2>
            <p className="text-xs text-slate-500">Grievance urgency classifications</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {priorityDistribution.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={PRIORITY_COLORS[entry.name] || '#6366f1'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {priorityDistribution.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: PRIORITY_COLORS[p.name] || '#6366f1' }}
                />
                <span className="text-slate-600 font-medium">{p.name}:</span>
                <span className="font-bold text-slate-900">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Distribution List */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Department Routing Load</h2>
              <p className="text-xs text-slate-500">Assigned workload across functional wings</p>
            </div>
            <Building2 className="w-5 h-5 text-indigo-600" />
          </div>

          <div className="space-y-3 pt-2">
            {departmentDistribution.map((d) => {
              const pct =
                statusCounts.total > 0
                  ? Math.round((d.count / statusCounts.total) * 100)
                  : 0;
              return (
                <div key={d.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{d.name}</span>
                    <span className="text-slate-500">
                      {d.count} tickets ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Institutional Complaints Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Latest Campus Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Recent incoming tickets across all campus buildings
            </p>
          </div>

          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Manage All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentComplaints.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">
                        {c.complaintId}
                      </span>
                      <Link
                        to={`/admin/complaints/${c._id}`}
                        className="font-bold text-slate-900 hover:text-indigo-600 truncate max-w-xs block"
                      >
                        {c.title}
                      </Link>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800">{c.student?.name}</span>
                    <span className="text-[10px] text-slate-400 block">{c.student?.department}</span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                      {c.category}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="text-slate-600">
                      {c.department?.name || <span className="italic text-slate-400">Unassigned</span>}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <PriorityBadge priority={c.priority} />
                  </td>

                  <td className="py-3 px-4">
                    <StatusBadge status={c.status} />
                  </td>

                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/admin/complaints/${c._id}`}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors inline-block"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
