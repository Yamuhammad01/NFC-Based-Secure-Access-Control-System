import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import LoginForm from './pages/Auth/login'
import Register from './pages/Auth/register'
import ForgotPassword from './pages/Auth/forgotPassword'
import ResetPassword from './pages/Auth/resetPassword'
// import AdminDashboard from '../AdminDashboard'
import EmployeeTable from './pages/dashboard/admin/employees'
import Adminprofile from './pages/dashboard/admin/adminprofile'
import BusinessCard from './pages/dashboard/staff/BusinessCard'
import StaffId from './pages/dashboard/staff/staffId'
import StaffProfile from './pages/dashboard/staff/Profile'
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
        {/* <Route path="/dashboard/admin" element={<AdminDashboard />} /> */}
        <Route path="/dashboard/admin" element={<Adminprofile />} />
        <Route path="/dashboard/admin/employees" element={<EmployeeTable />} />
        <Route path="/dashboard/staff" element={<Navigate to="/dashboard/staff/profile" replace />} />
        <Route path="/dashboard/staff/profile" element={<StaffProfile />} />
        <Route path="/dashboard/staff/BusinessCard" element={<BusinessCard />} />
        <Route path="/dashboard/staff/staffId" element={<StaffId />} />
        <Route path="/dashboard/staff/settings" element={<Settings />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/staff/profile" replace />} />
      </Routes>
    </Router>
  </StrictMode>,
)
