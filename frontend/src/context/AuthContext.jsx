import { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { authUser, isCheckingAuth, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    // Add a small delay to ensure backend is fully ready
    const timer = setTimeout(() => {
      checkAuth();
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [checkAuth]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isCheckingAuth && !authUser) {
      navigate('/login');
    }
  }, [authUser, isCheckingAuth, navigate]);

  return (
    <AuthContext.Provider
      value={{
        user: authUser,
        isAuthenticated: !!authUser,
        loading: isCheckingAuth,
      }}
    >
      {!isCheckingAuth && children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
