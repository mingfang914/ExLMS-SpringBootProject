import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute component - Restricts access based on authentication and roles.
 * 
 * @param {Array} allowedRoles - List of roles permitted to access this route (e.g. ['ADMIN', 'INSTRUCTOR']).
 * @param {string} redirectPath - Route to redirect if not authorized.
 * @param {string} fallbackPath - Route to redirect if not authenticated.
 * @param {boolean} wrappedPage - If true, children will be rendered directly (for manual layouts).
 */
const ProtectedRoute = ({ 
  allowedRoles = [], 
  redirectPath = "/", 
  fallbackPath = "/login",
  children,
  wrappedPage = false
}) => {
  const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

  // If still loading session
  if (loading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Check if authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // If session is restored but role doesn't match
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    console.warn(`Access denied for role: ${user.role}. Allowed: ${allowedRoles.join(', ')}`);
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and role matches (if any)
  return children ? children : <Outlet />;
};

export default ProtectedRoute;
