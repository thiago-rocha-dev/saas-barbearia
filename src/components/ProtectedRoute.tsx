import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { useToast } from '../hooks/useToast';
import type { UserRole } from '../types/dashboard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
  redirectTo,
}) => {
  const { user, loading, canAccess, getRedirectPath } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();

  useEffect(() => {
    // Show access denied toast if user tries to access unauthorized route
    if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      addToast({
        type: 'error',
        title: 'Acesso Negado',
        description: 'Você não tem permissão para acessar esta página.',
      });
    }
  }, [user, loading, allowedRoles, addToast]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return (
      <Navigate 
        to="/auth/login" 
        state={{ from: location.pathname }} 
        replace 
      />
    );
  }

  // Check role-based access
  if (user && allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to user's appropriate dashboard
    const userDashboard = getRedirectPath();
    return <Navigate to={userDashboard} replace />;
  }

  // Check path-based access using canAccess method
  if (user && !canAccess(location.pathname)) {
    const userDashboard = getRedirectPath();
    return <Navigate to={userDashboard} replace />;
  }

  // Custom redirect logic
  if (redirectTo) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if all checks pass
  return <>{children}</>;
};

// Higher-order component for role-specific protection
export const withRoleProtection = (
  Component: React.ComponentType,
  allowedRoles: UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute allowedRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// Specific role guards for convenience
export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>
    {children}
  </ProtectedRoute>
);

export const BarberRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['barber']}>
    {children}
  </ProtectedRoute>
);

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['customer']}>
    {children}
  </ProtectedRoute>
);

// Multi-role access guards
export const StaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'barber']}>
    {children}
  </ProtectedRoute>
);

export const AuthenticatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'barber', 'customer']}>
    {children}
  </ProtectedRoute>
);

// Public route that redirects authenticated users to their dashboard
export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, getRedirectPath } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Redirect authenticated users to their appropriate dashboard
  if (user) {
    const userDashboard = getRedirectPath();
    return <Navigate to={userDashboard} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;