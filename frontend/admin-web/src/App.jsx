import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './pages/Auth/login';
import Register from './pages/Auth/register';
import ForgotPassword from './pages/Auth/forgotPassword';
import ResetPassword from './pages/Auth/resetPassword';
import ForcePasswordChange from './pages/Auth/forcePasswordChange';
import DashboardOverview from './pages/dashboard/admin/DashboardOverview';
import BusinessCard from './pages/dashboard/staff/BusinessCard';
import StaffId from './pages/dashboard/staff/staffId';
import StaffProfile from './pages/dashboard/staff/Profile';
import StudentProfile from './pages/dashboard/student/Profile';
import Settings from './pages/dashboard/staff/settings';
import UsersPage from './pages/dashboard/admin/Users';
import EmployeeTable from './pages/dashboard/admin/employees';
import CardManagement from './pages/dashboard/admin/cards';

// Generic staff/student pages
import StaffPermissions from './pages/dashboard/staff/permissions';
import StaffLogs from './pages/dashboard/staff/logs';
import StaffTimeline from './pages/dashboard/staff/timeline';
import CardReplacement from './pages/dashboard/staff/replacement';
import SecurityNotifications from './pages/dashboard/staff/notifications';
import TempAccessRequest from './pages/dashboard/staff/tempAccess';

// Component to handle root redirects based on URL hash
function RootRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash with access_token (password reset link)
    if (location.hash) {
      const hash = location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const type = params.get('type');
      
      if (accessToken && type === 'recovery') {
        // Redirect to reset password page with the hash
        navigate('/resetPassword' + location.hash);
        return;
      }
    }
    
    // Default redirect to login
    navigate('/login');
  }, [navigate, location]);

  return null; // This component doesn't render anything
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/force-password-change" element={<ForcePasswordChange />} />
        {/* Admin routes */}
        <Route path="/dashboard/admin" element={<DashboardOverview />} />
        <Route path="/dashboard/admin/users" element={<UsersPage />} />
        <Route path="/dashboard/admin/employees" element={<EmployeeTable />} />
        <Route path="/dashboard/admin/cards" element={<CardManagement />} />
        <Route path="/dashboard/admin/audit-logs" element={<AuditLogs />} />

        {/* ── Generic dashboard routes (role-agnostic) ── */}
        <Route path="/dashboard/profile"       element={<StaffProfile />} />
        <Route path="/dashboard/staffId"        element={<StaffId />} />
        <Route path="/dashboard/settings"       element={<Settings />} />
        <Route path="/dashboard/permissions"    element={<StaffPermissions />} />
        <Route path="/dashboard/logs"           element={<StaffLogs />} />
        <Route path="/dashboard/timeline"       element={<StaffTimeline />} />
        <Route path="/dashboard/replacement"    element={<CardReplacement />} />
        <Route path="/dashboard/notifications"  element={<SecurityNotifications />} />
        <Route path="/dashboard/temp-access"    element={<TempAccessRequest />} />

        {/* ── Backward-compatibility: old /dashboard/staff/* paths redirect to new ones ── */}
        <Route path="/dashboard/staff"                  element={<Navigate to="/dashboard/profile"      replace />} />
        <Route path="/dashboard/staff/profile"          element={<Navigate to="/dashboard/profile"      replace />} />
        <Route path="/dashboard/staff/staffId"          element={<Navigate to="/dashboard/staffId"      replace />} />
        <Route path="/dashboard/staff/settings"         element={<Navigate to="/dashboard/settings"     replace />} />
        <Route path="/dashboard/staff/permissions"      element={<Navigate to="/dashboard/permissions"  replace />} />
        <Route path="/dashboard/staff/logs"             element={<Navigate to="/dashboard/logs"         replace />} />
        <Route path="/dashboard/staff/timeline"         element={<Navigate to="/dashboard/timeline"     replace />} />
        <Route path="/dashboard/staff/replacement"      element={<Navigate to="/dashboard/replacement"  replace />} />
        <Route path="/dashboard/staff/notifications"    element={<Navigate to="/dashboard/notifications" replace />} />
        <Route path="/dashboard/staff/temp-access"      element={<Navigate to="/dashboard/temp-access"  replace />} />
        <Route path="/dashboard/staff/BusinessCard"     element={<Navigate to="/dashboard/profile"      replace />} />

        {/* ── Backward-compatibility: old /dashboard/student/* paths redirect to new ones ── */}
        <Route path="/dashboard/student"                element={<Navigate to="/dashboard/profile"      replace />} />
        <Route path="/dashboard/student/profile"        element={<Navigate to="/dashboard/profile"      replace />} />
        <Route path="/dashboard/student/permissions"    element={<Navigate to="/dashboard/permissions"  replace />} />
        <Route path="/dashboard/student/logs"           element={<Navigate to="/dashboard/logs"         replace />} />
        <Route path="/dashboard/student/timeline"       element={<Navigate to="/dashboard/timeline"     replace />} />
        <Route path="/dashboard/student/notifications"  element={<Navigate to="/dashboard/notifications" replace />} />
        <Route path="/dashboard/student/temp-access"    element={<Navigate to="/dashboard/temp-access"  replace />} />
        <Route path="/dashboard/student/settings"       element={<Navigate to="/dashboard/settings"     replace />} />

        {/* ── /dashboard base → profile for non-admin users ── */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/profile" replace />} />
      </Routes>
    </Router>
  );
}

export default App;