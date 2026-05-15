import { createContext, useState, useEffect, useContext } from 'react';
import { getUserRole, getToken as getStoredToken } from '../Api/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(localStorage.getItem('authToken'));
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Run once on mount to initialize auth from localStorage (if any)
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      setAuthToken(token);

      try {
        const role = await getUserRole();
        setUserRole(role);
        setIsAuthenticated(true);
        setAuthError(null);
      } catch (err) {
        // If role check fails (network/401 etc), clear tokens and mark unauthenticated
        console.error("Failed to initialize auth:", err.message || err);
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        setAuthToken(null);
        setUserRole(null);
        setIsAuthenticated(false);
        setAuthError(err.message || "Failed to initialize authentication");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
    // empty dependency -> run once on mount
  }, []);

  // LOGIN: centralize role fetch here so other components don't call getUserRole themselves
  const login = async (token) => {
    if (!token) throw new Error("No token provided to auth.login");

    localStorage.setItem('authToken', token);
    setAuthToken(token);

    try {
      const role = await getUserRole();
      setUserRole(role);
      setIsAuthenticated(true);
      setAuthError(null);
      return role;
    } catch (err) {
      // On failure, clear token and rethrow for UI to handle (so it doesn't silently assume staff)
      console.error("Failed to fetch role during login:", err.message || err);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      setAuthToken(null);
      setUserRole(null);
      setIsAuthenticated(false);
      setAuthError(err.message || "Failed to fetch user role");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    setAuthToken(null);
    setUserRole(null);
    setIsAuthenticated(false);
  };

  const value = {
    authToken,
    userRole,
    isAuthenticated,
    loading,
    authError,
    login, // async
    logout,
    setUserRole,
    setAuthToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
