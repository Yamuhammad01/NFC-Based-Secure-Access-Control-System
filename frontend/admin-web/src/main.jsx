import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from './pages/Auth/login'
import Register from './pages/Auth/register'
import ForgotPassword from './pages/Auth/forgotPassword'
import ResetPassword from './pages/Auth/resetPassword'
import ForcePasswordChange from './pages/Auth/forcePasswordChange'
// import AdminDashboard from '../AdminDashboard'
import EmployeeTable from './pages/dashboard/admin/employees'
import UsersPage from './pages/dashboard/admin/Users'
import DashboardOverview from './pages/dashboard/admin/DashboardOverview';
import AuditLogs from './pages/dashboard/admin/auditLogs'
import CardManagement from './pages/dashboard/admin/cards'
//import BusinessCard from './pages/dashboard/staff/BusinessCard'
import StaffId from './pages/dashboard/staff/staffId'
import StaffProfile from './pages/dashboard/staff/Profile'
import StaffPermissions from './pages/dashboard/staff/permissions'
import StaffLogs from './pages/dashboard/staff/logs'
import StaffTimeline from './pages/dashboard/staff/timeline'
import CardReplacement from './pages/dashboard/staff/replacement'
import SecurityNotifications from './pages/dashboard/staff/notifications'
import TempAccessRequest from './pages/dashboard/staff/tempAccess'
import Settings from './pages/dashboard/staff/settings'
import './index.css'

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

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/force-password-change" element={<ForcePasswordChange />} />
        <Route path="/dashboard/admin" element={<DashboardOverview />} />
        <Route path="/dashboard/admin/users" element={<UsersPage />} />
        <Route path="/dashboard/admin/employees" element={<EmployeeTable />} />
        <Route path="/dashboard/admin/cards" element={<CardManagement />} />
        <Route path="/dashboard/admin/audit-logs" element={<AuditLogs />} />
        <Route path="/dashboard/staff" element={<Navigate to="/dashboard/staff/profile" replace />} />
        <Route path="/dashboard/staff/profile" element={<StaffProfile />} />
        <Route path="/dashboard/staff/staffId" element={<StaffId />} />
        <Route path="/dashboard/staff/settings" element={<Settings />} />
        <Route path="/dashboard/staff/permissions" element={<StaffPermissions />} />
        <Route path="/dashboard/staff/logs" element={<StaffLogs />} />
        <Route path="/dashboard/staff/timeline" element={<StaffTimeline />} />
        <Route path="/dashboard/staff/replacement" element={<CardReplacement />} />
        <Route path="/dashboard/staff/notifications" element={<SecurityNotifications />} />
        <Route path="/dashboard/staff/temp-access" element={<TempAccessRequest />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/staff/profile" replace />} />
      </Routes>
    </Router>
  </StrictMode>,
)
