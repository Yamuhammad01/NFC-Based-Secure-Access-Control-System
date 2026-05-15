import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../../component/DashboardLayout'
import { FaUser, FaPhone, FaBuilding, FaEdit, FaSave, FaTimes, FaCogs, FaBriefcase, FaIdBadge, FaCamera, FaImage } from 'react-icons/fa'
import { getProfile, updateProfile, addProfilePhoto } from '../../../Api/authService'
import Notification, { useNotification } from '../../../component/Notification'

export default function Settings() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    jobTitle: '',
    position: ''
  })
  const [userProfile, setUserProfile] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  
  // Notification system
  const {
    notification,
    showSuccess,
    showError,
    clearNotification
  } = useNotification()

  // Fetch user profile on component mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const profileData = await getProfile()
      setUserProfile(profileData)
      setFormData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        department: profileData.department || '',
        jobTitle: profileData.jobTitle || '',
        position: profileData.position || ''
      })
      setError(null)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        department: formData.department,
        jobTitle: formData.jobTitle,
        position: formData.position
      }
      
      await updateProfile(updateData)
      
      // Refresh profile data
      await fetchUserProfile()
      
      // Dispatch event to notify other components of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'))
      
      showSuccess('Profile updated successfully!')
      setIsEditing(false)
      setError(null)
    } catch (err) {
      console.error('Failed to update profile:', err)
      showError('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
      if (!validTypes.includes(file.type)) {
        showError('Please select a valid image file (JPEG, PNG, or GIF)')
        return
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        showError('File size must be less than 5MB')
        return
      }
      
      setSelectedPhoto(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setError(null)
    }
  }

  const handlePhotoUpload = async () => {
    if (!selectedPhoto) return
    
    try {
      setUploadingPhoto(true)
      await addProfilePhoto(selectedPhoto)
      
      // Refresh profile data to get updated photo
      await fetchUserProfile()
      
      // Dispatch event to notify other components of profile update
      window.dispatchEvent(new CustomEvent('profileUpdated'))
      
      // Reset photo selection
      setSelectedPhoto(null)
      setPhotoPreview(null)
      
      showSuccess('Profile photo updated successfully!')
      setError(null)
    } catch (err) {
      console.error('Failed to upload photo:', err)
      showError('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const cancelPhotoUpload = () => {
    setSelectedPhoto(null)
    setPhotoPreview(null)
    setError(null)
  }


  const handleCancel = () => {
    setIsEditing(false)
    // Reset form to original values
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        department: userProfile.department || '',
        jobTitle: userProfile.jobTitle || '',
        position: userProfile.position || ''
      })
    }
    setError(null)
  }

  if (loading && !userProfile) {
    return (
      <DashboardLayout role="staff" profilePic="/src/assets/pic.png">
        <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout role="staff" profilePic="/src/assets/pic.png">
      {/* Notification Component */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          isVisible={notification.isVisible}
          onClose={clearNotification}
        />
      )}
      {/* Header */}
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FaCogs className="text-teal-600" />
          Settings
        </h1>
        <p className="text-sm text-gray-500">Manage your profile and account settings</p>
      </div>

      <div className="min-h-[calc(100vh-100px)] p-2 sm:p-4 md:p-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-3 sm:p-4 md:p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Profile Info Display */}
          {userProfile && (
            <div className="mb-6 sm:mb-8 p-3 sm:p-4 md:p-6 bg-teal-50 border border-teal-200 rounded-lg">
              <h3 className="text-lg font-semibold text-teal-800 mb-4">Profile Information</h3>
              
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center lg:items-start">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg mb-4">
                    {userProfile.profilePhoto ? (
                      <img 
                        src={userProfile.profilePhoto} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-teal-100">
                        <FaUser className="text-4xl text-teal-600" />
                      </div>
                    )}
                  </div>
                  
                  {/* QR Code Section */}
                  {userProfile.qrCode && (
                    <div className="text-center">
                      <p className="text-sm font-medium text-teal-800 mb-2">QR Code</p>
                      <div className="w-24 h-24 bg-white p-2 rounded border">
                        <img 
                          src={userProfile.qrCode} 
                          alt="QR Code" 
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 md:gap-4 text-xs sm:text-sm text-teal-800">
                    <div><span className="font-medium">First Name:</span> {userProfile.firstName || 'Not set'}</div>
                    <div><span className="font-medium">Last Name:</span> {userProfile.lastName || 'Not set'}</div>
                    <div><span className="font-medium">Email:</span> {userProfile.email || 'Not available'}</div>
                    <div><span className="font-medium">Smart ID:</span> {userProfile.smartId || userProfile.staffId || 'Not available'}</div>
                    <div><span className="font-medium">Department:</span> {userProfile.department || 'Not set'}</div>
                    <div><span className="font-medium">Job Title:</span> {userProfile.jobTitle || 'Not set'}</div>
                    <div className="md:col-span-2"><span className="font-medium">Position:</span> {userProfile.position || 'Not set'}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Photo Upload Section */}
          <div className="mb-6 sm:mb-8 p-3 sm:p-4 md:p-6 bg-white border border-gray-200 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaCamera className="text-teal-600" />
              Profile Photo
            </h3>
            
            {!selectedPhoto ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="photo-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-200">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <FaImage className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> profile photo
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 5MB)</p>
                    </div>
                    <input 
                      id="photo-upload" 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={handlePhotoChange}
                      disabled={uploadingPhoto}
                    />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200">
                    <img 
                      src={photoPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{selectedPhoto.name}</p>
                    <p className="text-xs text-gray-500">{(selectedPhoto.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handlePhotoUpload}
                    disabled={uploadingPhoto}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                      uploadingPhoto
                        ? 'bg-gray-400 cursor-not-allowed text-white'
                        : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <FaSave className="w-4 h-4" />
                    )}
                    {uploadingPhoto ? 'Uploading...' : 'Upload Photo'}
                  </button>
                  
                  <button
                    onClick={cancelPhotoUpload}
                    disabled={uploadingPhoto}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition duration-200"
                  >
                    <FaTimes className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Edit Profile Button */}
          {!isEditing && (
            <div className="flex justify-center mb-6 sm:mb-8">
              <button
                onClick={() => setIsEditing(true)}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg transition duration-200 shadow-md ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                <FaEdit className="w-4 h-4" />
                Edit Profile
              </button>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* First Name */}
              <div>
                <label htmlFor="firstName" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  First Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    disabled={!isEditing || loading}
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-gray-900 placeholder-gray-500 ${
                      !isEditing || loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white shadow-sm'
                    }`}
                    placeholder="Enter your first name"
                  />
                </div>
              </div>

              {/* Last Name */}
              <div>
                <label htmlFor="lastName" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Last Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    disabled={!isEditing || loading}
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-gray-900 placeholder-gray-500 ${
                      !isEditing || loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white shadow-sm'
                    }`}
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label htmlFor="department" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Department
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBuilding className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="department"
                    name="department"
                    type="text"
                    required
                    disabled={!isEditing || loading}
                    value={formData.department}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-gray-900 placeholder-gray-500 ${
                      !isEditing || loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white shadow-sm'
                    }`}
                    placeholder="Enter your department"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label htmlFor="jobTitle" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Job Title
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBriefcase className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    type="text"
                    required
                    disabled={!isEditing || loading}
                    value={formData.jobTitle}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-gray-900 placeholder-gray-500 ${
                      !isEditing || loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white shadow-sm'
                    }`}
                    placeholder="Enter your job title"
                  />
                </div>
              </div>

              {/* Position */}
              <div className="md:col-span-2">
                <label htmlFor="position" className="block text-xs uppercase tracking-wider text-gray-500 mb-2">
                  Position
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdBadge className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    required
                    disabled={!isEditing || loading}
                    value={formData.position}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-200 text-gray-900 placeholder-gray-500 ${
                      !isEditing || loading ? 'bg-gray-50 cursor-not-allowed' : 'bg-white shadow-sm'
                    }`}
                    placeholder="Enter your position"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition duration-200 ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                  }`}
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <FaSave className="h-4 w-4" />
                  )}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className={`flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-lg shadow-sm text-sm font-medium transition duration-200 ${
                    loading
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500'
                  }`}
                >
                  <FaTimes className="h-4 w-4" />
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}