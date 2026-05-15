import { useState } from 'react'
import { FaEye, FaEyeSlash, FaUser, FaLock, FaUserCircle, FaIdCard, FaBuilding, FaUserPlus } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { register } from '../../Api/authService'

export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    staffId: '',
    department: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  try {
    const response = await register(formData);
    console.log('Registration successful:', response);

    // Check if backend provides auto-login token
    if (response.access_token) {
      localStorage.setItem("authToken", response.access_token);
      // Add delay to ensure token is properly set before navigation
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Navigate to profile if auto-login is successful
      navigate('/dashboard/staff/profile', { 
        replace: true,
        state: { fromRegistration: true }
      });
    } else {
      // No auto-login token, redirect to login with success message
      navigate('/login', { 
        replace: true,
        state: { 
          message: 'Registration successful! Please log in with your credentials.',
          type: 'success'
        }
      });
    }

  } catch (error) {
    console.error('Registration failed:', error);
    
    // Extract backend error message properly
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response?.data) {
      const backendError = error.response.data;
      errorMessage = backendError.msg || backendError.message || backendError.error || errorMessage;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Handle specific error cases
    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      errorMessage = 'This email is already registered. Please try logging in instead.';
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Mobile-first card design */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Header */}
          <header className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-indigo-800 flex items-center justify-center gap-2">
              <FaUserCircle className="text-indigo-600" />
              Nitda Smart Card
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-2">
              Create your account to get started.
            </p>
          </header>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Staff ID Field */}
            <div>
              <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                Staff ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="staffId"
                  name="staffId"
                  type="text"
                  required
                  value={formData.staffId}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your staff ID"
                />
              </div>
            </div>

{/* Department Field */}
<div>
  <label
    htmlFor="department"
    className="block text-sm font-medium text-gray-700 mb-2"
  >
    Department
  </label>
  <div className="relative">
    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <FaBuilding className="h-5 w-5 text-gray-400" />
    </div>
    <input
      type="text"
      id="department"
      name="department"
      placeholder="Enter your department"
      required
      value={formData.department}
      onChange={handleChange}
      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 
                 focus:border-transparent transition duration-200 
                 bg-white text-gray-900"
    />
  </div>
</div>


            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 bg-white text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700">
                  I agree to the{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition duration-200">
                    Terms and Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500 transition duration-200">
                    Privacy Policy
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaUserPlus className="h-4 w-4" />
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <a href="./login" className="font-medium text-blue-600 hover:text-blue-500 transition duration-200">
                Log In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}