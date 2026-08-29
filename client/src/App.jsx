import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DemoLoginBar from './components/DemoLoginBar';
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import CreateComplaint from './pages/student/CreateComplaint';
import MyComplaints from './pages/student/MyComplaints';
import StudentComplaintDetails from './pages/student/StudentComplaintDetails';

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard';
import AssignedComplaints from './pages/staff/AssignedComplaints';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminComplaintDetails from './pages/admin/AdminComplaintDetails';
import DepartmentManagement from './pages/admin/DepartmentManagement';
import StaffManagement from './pages/admin/StaffManagement';

const RootRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === 'STAFF') {
    return <Navigate to="/staff/dashboard" replace />;
  } else {
    return <Navigate to="/student/dashboard" replace />;
  }
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Demo Switcher at top for evaluation */}
      <DemoLoginBar />

      {/* Main App Navbar */}
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex">
        {/* Sidebar if user is logged in */}
        {user && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-200 ${
            user ? 'lg:pl-64' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0f172a',
                color: '#fff',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '500',
              },
            }}
          />

          <AppLayout>
            <Routes>
              {/* Home redirect */}
              <Route path="/" element={<RootRedirect />} />

              {/* Public Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Student Routes */}
              <Route
                path="/student/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <StudentDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints/new"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <CreateComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT']}>
                    <MyComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'STAFF', 'ADMIN']}>
                    <StudentComplaintDetails />
                  </ProtectedRoute>
                }
              />

              {/* Staff Routes */}
              <Route
                path="/staff/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['STAFF']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/complaints"
                element={
                  <ProtectedRoute allowedRoles={['STAFF']}>
                    <AssignedComplaints />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminComplaints />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/complaints/:id"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminComplaintDetails />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/departments"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <DepartmentManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/staff"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <StaffManagement />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
