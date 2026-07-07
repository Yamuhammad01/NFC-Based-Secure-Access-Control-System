import api from "./apiClient";

// Login function (works for staff + admin)
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    const { access_token } = response.data;

    if (access_token) {
      localStorage.setItem("authToken", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    }

    return response.data;
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};

// Register function
export const register = async (userData) => {
  try {
    // Ensure the data structure matches backend expectations
    const registrationData = {
      email: userData.email,
      password: userData.password,
      staffId: userData.staffId, 
      department: userData.department,
      firstName: userData.firstName || userData.name?.split(" ")[0],
      lastName: userData.lastName || userData.name?.split(" ").slice(1).join(" "),
      name: userData.name,
    };

    const response = await api.post("/auth/register", registrationData);
    const { access_token } = response.data;

    if (access_token) {
      localStorage.setItem("authToken", access_token);
      api.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
    }

    return response.data;
  } catch (error) {
    console.error("Registration failed:", error.response?.data || error.message);
    throw error;
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await api.get("/get/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch profile:", error.response?.data || error.message);
    throw error;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put("/update/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Failed to update profile:", error.response?.data || error.message);
    throw error;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem("authToken");
  delete api.defaults.headers.common["Authorization"];
};

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!localStorage.getItem("authToken");
};

// Get stored token
export const getToken = () => {
  return localStorage.getItem("authToken");
};

// Change password (for first-time login or general change)
export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await api.post("/auth/change-password", { currentPassword, newPassword });
    return response.data;
  } catch (error) {
    console.error("Failed to change password:", error.response?.data || error.message);
    throw error;
  }
};

// Add profile photo
export const addProfilePhoto = async (photoFile) => {
  try {
    const formData = new FormData();
    formData.append('Image', photoFile);
    
    const response = await api.post("/add/profilePhoto", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload profile photo:", error.response?.data || error.message);
    throw error;
  }
};

// Admin API functions
export const adminInvite = async (staffData) => {
  try {
    const response = await api.post("/api/Admin/invite", staffData); // Send the full staffData object
    return response.data;
  } catch (error) {
    console.error("Admin invite failed:", error.response?.data || error.message);
    throw error;
  }
};

export const getAdminDashboard = async () => {
  try {
    const response = await api.get("/api/Admin/dashboard");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin dashboard:", error.response?.data || error.message);
    throw error;
  }
};

export const getStaffById = async (id) => {
  try {
    const response = await api.get(`/api/Admin/getstaffby/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch staff member ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getAllStaff = async () => {
  try {
    const response = await api.get("/api/Admin/get/all-staff");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all staff:", error.response?.data || error.message);
    throw error;
  }
};

export const updateStaff = async (id, staffData) => {
  try {
    const response = await api.put(`/api/Admin/update/staff/${id}`, staffData);
    return response.data;
  } catch (error) {
    console.error(`Failed to update staff member ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteStaff = async (id) => {
  try {
    const response = await api.delete(`/api/Admin/delete/staff/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete staff member ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const getTotalStaffs = async () => {
  try {
    const response = await api.get("/api/Admin/total-staffs");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch total staffs:", error.response?.data || error.message);
    throw error;
  }
};

export const getTotalDepartments = async () => {
  try {
    const response = await api.get("/api/Admin/total-departments");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch total departments:", error.response?.data || error.message);
    throw error;
  }
};

// Get user role (admin or staff)
export const getUserRole = async () => {
  try {
    const response = await api.get("/api/Admin/check-role");
    if (response.status === 200) {
      localStorage.setItem("userRole", "admin");
      return "admin";
    }
  } catch (error) {
    // If admin check fails, assume staff role
    console.warn("Admin role check failed, assuming staff role:", error.message);
  }
  localStorage.setItem("userRole", "staff");
  return "staff";
};

// Get access/audit logs
export const getAccessLogs = async () => {
  try {
    const response = await api.get("/access/logs");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch access logs:", error.response?.data || error.message);
    throw error;
  }
};

// Cardholder & Card Lifecycle Management APIs (now under /api/cards)
export const getAllUsers = async () => {
  try {
    // Fetch all NFC card records from the new /api/cards endpoint
    const response = await api.get("/api/cards");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch card records:", error.response?.data || error.message);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    // Create a new NFC card record via /api/cards
    const response = await api.post("/api/cards", userData);
    return response.data;
  } catch (error) {
    console.error("Failed to register card:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await api.put(`/api/cards/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error("Failed to update card:", error.response?.data || error.message);
    throw error;
  }
};

export const reportLostCard = async (id) => {
  try {
    const response = await api.put(`/api/cards/${id}/lost`);
    return response.data;
  } catch (error) {
    console.error("Failed to report lost card:", error.response?.data || error.message);
    throw error;
  }
};

export const reportStolenCard = async (id) => {
  try {
    const response = await api.put(`/api/cards/${id}/stolen`);
    return response.data;
  } catch (error) {
    console.error("Failed to suspend stolen card:", error.response?.data || error.message);
    throw error;
  }
};

export const replaceCard = async (id, newUid) => {
  try {
    const response = await api.put(`/api/cards/${id}/replace`, { uid: newUid });
    return response.data;
  } catch (error) {
    console.error("Failed to replace card:", error.response?.data || error.message);
    throw error;
  }
};

export const deactivateUser = async (id) => {
  try {
    const response = await api.delete(`/api/cards/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to deactivate card:", error.response?.data || error.message);
    throw error;
  }
};

// Dashboard API functions
export const getDashboardStats = async () => {
  try {
    const response = await api.get("/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error.response?.data || error.message);
    throw error;
  }
};

export const getRecentActivity = async (limit = 5) => {
  try {
    const response = await api.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch recent activity:", error.response?.data || error.message);
    throw error;
  }
};

// Fetch access history logs for a specific cardholder UID
export const getUserAccessLogs = async (uid) => {
  try {
    const response = await api.get(`/access/logs/user/${uid}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user access logs:", error.response?.data || error.message);
    throw error;
  }
};