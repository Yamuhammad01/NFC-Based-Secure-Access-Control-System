import api from "./apiClient";

// Submit a new temporary access request
export const submitTempAccessRequest = async (requestData) => {
  try {
    const response = await api.post("/temp-access/request", requestData);
    return response.data;
  } catch (error) {
    console.error("Failed to submit temporary access request:", error.response?.data || error.message);
    throw error;
  }
};

// Get all requests for the logged-in user
export const getMyTempAccessRequests = async () => {
  try {
    const response = await api.get("/temp-access/requests");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch temporary access requests:", error.response?.data || error.message);
    throw error;
  }
};

// Get a single request by ID
export const getTempAccessRequestById = async (id) => {
  try {
    const response = await api.get(`/temp-access/requests/${id}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch request details:", error.response?.data || error.message);
    throw error;
  }
};

// Cancel a pending request
export const cancelTempAccessRequest = async (id) => {
  try {
    const response = await api.delete(`/temp-access/requests/${id}/cancel`);
    return response.data;
  } catch (error) {
    console.error("Failed to cancel request:", error.response?.data || error.message);
    throw error;
  }
};

// Approve a request (admin only)
export const approveTempAccessRequest = async (id, reviewNotes = "") => {
  try {
    const response = await api.put(`/temp-access/requests/${id}/approve`, { reviewNotes });
    return response.data;
  } catch (error) {
    console.error("Failed to approve request:", error.response?.data || error.message);
    throw error;
  }
};

// Reject a request (admin only)
export const rejectTempAccessRequest = async (id, reviewNotes = "") => {
  try {
    const response = await api.put(`/temp-access/requests/${id}/reject`, { reviewNotes });
    return response.data;
  } catch (error) {
    console.error("Failed to reject request:", error.response?.data || error.message);
    throw error;
  }
};

// Get all requests (admin only)
export const getAllTempAccessRequests = async () => {
  try {
    const response = await api.get("/temp-access/requests/all");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch all requests:", error.response?.data || error.message);
    throw error;
  }
};