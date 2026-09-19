import { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash, FaUser, FaLock, FaUserCircle, FaArrowLeft, FaShieldAlt, FaUserTie, FaUserGraduate, FaInfoCircle } from 'react-icons/fa'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { login, getUserRole } from '../../Api/authService'

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')
  const [activeDemoRole, setActiveDemoRole] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Pre-configured demo accounts
  const demoAccounts = {
    admin: {
      email: 'admin@university.edu.ng',
      password: 'AdminPassword123!',
      role: 'admin',
      label: 'Admin',
      icon: FaShieldAlt,
      badge: 'Master'
    },
    staff: {
      email: 'staff@university.edu.ng',
      password: 'StaffPassword123!',
      role: 'staff',
      label: 'Staff',
      icon: FaUserTie,
      badge: 'Faculty'
    },
    student: {
      email: 'student@university.edu.ng',
      password: 'StudentPassword123!',
      role: 'student',
      label: 'Student',
      icon: FaUserGraduate,
      badge: 'Campus'
    }
  }

  // Handle autofill from location.state or URL query params
  useEffect(() => {
    // 1. Check location state (from Landing page 1-click launch)
    if (location.state?.email && location.state?.password) {
      setFormData({
        email: location.state.email,
        password: location.state.password
      })
      if (location.state.role) {
        setActiveDemoRole(location.state.role.toLowerCase())
      }
      if (location.state.message) {
        if (location.state.type === 'success') {
          setSuccessMessage(location.state.message)
        } else {
          setInfoMessage(location.state.message)
        }
      }
      // Clean up history state so a refresh won't stick
      window.history.replaceState({}, document.title)
      return
    }

    // 2. Check URL search query parameters (e.g., /login?demo=admin)
    const searchParams = new URLSearchParams(location.search)
    const demoParam = searchParams.get('demo')?.toLowerCase()
    if (demoParam && demoAccounts[demoParam]) {
      setFormData({
        email: demoAccounts[demoParam].email,
        password: demoAccounts[demoParam].password
      })
      setActiveDemoRole(demoParam)
      setInfoMessage(`Autofilled with ${demoAccounts[demoParam].label} demo credentials.`)
      return
    }

    // 3. Check for registration success message
    if (location.state?.message && location.state?.type === 'success') {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title)
    }
  }, [location.state, location.search])

  const handleApplyDemo = (key) => {
    const acc = demoAccounts[key]
    if (!acc) return
    setFormData({
      email: acc.email,
      password: acc.password
    })
    setActiveDemoRole(key)
    setError('')
    setInfoMessage(`Autofilled with ${acc.label} demo credentials. Ready to Sign In.`)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Login with credentials
      const response = await login(formData.email, formData.password)
      console.log('Login successful:', response)

      // Save token
      const token = response?.access_token
      if (!token) throw new Error("No token received from login")

      localStorage.setItem("authToken", token)

      // Get role from response
      const userRole = response?.user?.role?.toLowerCase() || "staff"
      console.log("User role from response:", userRole)

      // Check if user must change their temporary password
      if (response.mustChangePassword === true && userRole !== "admin") {
        localStorage.setItem("userRole", userRole)
        navigate("/force-password-change")
        return
      }

      // Step 4: Save role and navigate
      localStorage.setItem("userRole", userRole)

      if (userRole === "admin") {
        navigate("/dashboard/admin")
      } else {
        // Staff and students go to the same generic dashboard profile
        navigate("/dashboard/profile")
      }

    } catch (error) {
      console.error('Login failed:', error)
      setError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50/50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-slate-200/80 relative">
          
          {/* Back to landing page link */}
          <div className="mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
            >
              <FaArrowLeft className="text-[10px]" />
              Return to Home Page
            </Link>
          </div>

          <header className="text-center mb-5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white mx-auto shadow-md shadow-indigo-600/20 mb-3">
              <FaShieldAlt className="text-xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              NFC Access Control
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">
              Select a demo role or enter your account credentials
            </p>
          </header>

          {/* ── 1-CLICK DEMO AUTOFILL BAR ── */}
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 mb-5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              <span>1-Click Demo Fill:</span>
              <span className="text-[10px] text-indigo-600 font-normal">Auto-populates inputs</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.entries(demoAccounts).map(([key, acc]) => {
                const Icon = acc.icon
                const isActive = activeDemoRole === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleApplyDemo(key)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border ${
                      isActive
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs font-bold'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                    }`}
                  >
                    <Icon className="text-xs" />
                    <span>{acc.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 mb-5 flex items-start gap-2">
              <span className="text-red-600 text-xs mt-0.5">•</span>
              <p className="text-red-600 text-xs font-medium">{error}</p>
            </div>
          )}

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 mb-5">
              <p className="text-emerald-700 text-xs font-medium">{successMessage}</p>
            </div>
          )}

          {infoMessage && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-5 flex items-center gap-2">
              <FaInfoCircle className="text-indigo-600 text-xs shrink-0" />
              <p className="text-indigo-800 text-xs font-medium">{infoMessage}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder-slate-400 text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-9 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-slate-900 placeholder-slate-400 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  ) : (
                    <FaEye className="h-4 w-4 text-slate-400 hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me & forgot password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600">
                  Remember me
                </label>
              </div>
              <div className="text-xs">
                <Link to="/forgotPassword" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 text-center pt-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Need to test physical NFC taps?{' '}
              <a
                href="https://nfc-based-secure-access-control-sys-five.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Open Scanner Client
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}