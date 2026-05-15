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
      department: userData.department
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

