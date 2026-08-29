import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  Building2,
  Users,
  CheckSquare,
  BarChart3,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  if (!user) return null;

  const studentLinks = [
    {
      to: '/student/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/student/complaints/new',
      label: 'Submit Complaint',
      icon: PlusCircle,
      highlight: true,
    },
    {
      to: '/student/complaints',
      label: 'My Complaints',
      icon: FileText,
    },
  ];

  const staffLinks = [
    {
      to: '/staff/dashboard',
      label: 'Staff Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/staff/complaints',
      label: 'Assigned Complaints',
      icon: CheckSquare,
    },
  ];

  const adminLinks = [
    {
      to: '/admin/dashboard',
      label: 'Analytics & KPIs',
      icon: BarChart3,
    },
    {
      to: '/admin/complaints',
      label: 'All Complaints',
      icon: FileText,
    },
    {
      to: '/admin/departments',
      label: 'Departments',
      icon: Building2,
    },
    {
      to: '/admin/staff',
      label: 'Staff Directory',
      icon: Users,
    },
  ];

  let links = [];
  if (user.role === 'ADMIN') links = adminLinks;
  else if (user.role === 'STAFF') links = staffLinks;
  else links = studentLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out lg:translate-x-0 flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* User Brief Card */}
          <div className="p-3.5 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100/80 rounded-2xl">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              {user.role} Portal
            </p>
            <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">
              {user.department || user.studentId || user.email}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Menu Navigation
            </p>
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                        : item.highlight
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/60'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 text-slate-500 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium text-slate-600">CampusResolve v1.0</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Full-Stack MERN Architecture
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
