import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  LogOut,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  ExternalLink,
  Shield,
  Briefcase,
  GraduationCap,
} from 'lucide-react';
import { formatTimeAgo, getInitials } from '../utils/helpers';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar, isSidebarOpen }) => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const getRoleIcon = () => {
    if (user?.role === 'ADMIN') return <Shield className="w-3.5 h-3.5 text-indigo-400" />;
    if (user?.role === 'STAFF') return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
    return <GraduationCap className="w-3.5 h-3.5 text-blue-400" />;
  };

  const getRoleBadgeStyle = () => {
    if (user?.role === 'ADMIN') return 'bg-indigo-900/60 text-indigo-200 border-indigo-700/60';
    if (user?.role === 'STAFF') return 'bg-emerald-900/60 text-emerald-200 border-emerald-700/60';
    return 'bg-blue-900/60 text-blue-200 border-blue-700/60';
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Sidebar Toggle */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
                aria-label="Toggle Navigation"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
                  <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
                  CampusResolve
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 -mt-1">
                  College Grievance Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Notifications & User Profile */}
          {user ? (
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Role badge */}
              <div
                className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle()}`}
              >
                {getRoleIcon()}
                <span>{user.role}</span>
              </div>

              {/* Notification Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none transition-colors"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse ring-2 ring-slate-900">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-800 py-3 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-slate-900">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 text-xs bg-indigo-50 text-indigo-600 font-semibold rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-xs">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n._id}
                            onClick={() => {
                              if (!n.isRead) markAsRead(n._id);
                              if (n.link) {
                                setShowNotifications(false);
                                navigate(n.link);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start gap-3 ${
                              !n.isRead ? 'bg-indigo-50/40' : ''
                            }`}
                          >
                            <div
                              className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${
                                !n.isRead ? 'bg-indigo-600' : 'bg-transparent'
                              }`}
                            />
                            <div className="flex-1">
                              <p className={`text-xs text-slate-700 leading-relaxed ${!n.isRead ? 'font-semibold' : ''}`}>
                                {n.message}
                              </p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {formatTimeAgo(n.createdAt)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <span className="block text-xs font-semibold text-white truncate max-w-[120px]">
                      {user.name}
                    </span>
                    <span className="block text-[10px] text-slate-400 truncate max-w-[120px]">
                      {user.department || user.studentId || user.email}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 text-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-md">
                        Role: {user.role}
                      </span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 font-semibold flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-md transition-all shadow-indigo-600/30"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
