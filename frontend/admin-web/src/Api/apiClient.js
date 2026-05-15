// import axios from "axios";

// const api = axios.create({
//   baseURL: "https://smart-id-solution.onrender.com",
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   withCredentials: false, // Explicitly set to false for CORS
// });

// // Request interceptor for adding auth token
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("authToken");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// // Response interceptor for better error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     // Handle CORS and network errors
//     if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
//       console.error('Network/CORS Error:', error);
//       error.message = 'Unable to connect to server. Please check your internet connection or try again later.';
//     }
    
//     // Extract meaningful error messages from backend
//     if (error.response?.data) {
//       const backendError = error.response.data;
//       if (backendError.msg) {
//         error.message = backendError.msg;
//       } else if (backendError.message) {
//         error.message = backendError.message;
//       } else if (backendError.error) {
//         error.message = backendError.error;
//       }
//     }
    
//     return Promise.reject(error);
//   }
// );

// export default api;



import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Explicitly set to false for CORS
});

// Add token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Central error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === "ERR_NETWORK") {
      error.message =
        "Unable to connect to server. Please check your internet connection or try again later.";
    } else if (error.response?.data) {
      const backendError = error.response.data;
      error.message =
        backendError.msg || backendError.message || backendError.error || error.message;
    }
    return Promise.reject(error);
  }
);

export default api;
