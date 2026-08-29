import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { complaintService } from '../../services/complaintService';
import StatsCard from '../../components/StatsCard';
import ComplaintCard from '../../components/ComplaintCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import {
  PlusCircle,
  Clock,
  Wrench,
  CheckCircle2,
  Inbox,
  ArrowRight,
  Sparkles,
  FileText,
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints({ limit: 6 });
      if (res.success && res.data) {
        setComplaints(res.data.complaints || []);
        setStats(res.data.stats || {});
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>CampusResolve Student Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Report maintenance issues, track resolution timelines in real-time, and rate completed repairs.
          </p>
        </div>

        <Link
          to="/student/complaints/new"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-400/20 transition-all hover:scale-105 flex-shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Submit Complaint</span>
        </Link>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatsCard
          title="Total Filed"
          value={stats.total || 0}
          icon={FileText}
          color="indigo"
          subtitle="All-time complaints"
        />
        <StatsCard
          title="Submitted"
          value={stats.submitted || 0}
          icon={Clock}
          color="amber"
          subtitle="Pending review"
        />
        <StatsCard
          title="In Progress"
          value={stats.inProgress || 0}
          icon={Wrench}
          color="purple"
          subtitle="Under repair"
        />
        <StatsCard
          title="Resolved"
          value={stats.resolved || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Awaiting your sign-off"
        />
        <StatsCard
          title="Closed"
          value={stats.closed || 0}
          icon={CheckCircle2}
          color="slate"
          subtitle="Successfully fixed"
        />
      </div>

      {/* Recent Complaints Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Recent Complaints
            </h2>
            <p className="text-xs text-slate-500">
              Your latest submitted requests and their real-time statuses
            </p>
          </div>

          <Link
            to="/student/complaints"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Fetching your complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No complaints filed yet"
            description="Whenever you face any issue with Wi-Fi, classrooms, hostel, or electricity, submit a ticket here."
            action={
              <Link
                to="/student/complaints/new"
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
              >
                <PlusCircle className="w-4 h-4" />
                Submit First Complaint
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                basePath="/student/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
