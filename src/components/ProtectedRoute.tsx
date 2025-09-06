import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import type { UserRole } from '../types/dashboard';
import { LoadingSpinner } from './ui/LoadingSpinner';

// ============================================================================
// COMPONENTE DE ROTA PROTEGIDA REFATORADO
// ============================================================================
// Usa o novo sistema de autenticação centralizado e elimina lógica duplicada.
// ============================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredRoles,
}) => {
  const { user, loading, error, getRedirectPath } = useAuth();
  const location = useLocation();

  // ============================================================================
  // LOADING STATE
  // ============================================================================
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE - PROFILE MAL CONFIGURADO
  // ============================================================================
  
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="mb-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Negado</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/auth/login'}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Voltar ao Login
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // REDIRECIONAMENTO PARA LOGIN SE NÃO AUTENTICADO
  // ============================================================================
  
  if (!user) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // ============================================================================
  // VALIDAÇÃO DE ROLE E REDIRECIONAMENTO SEGURO
  // ============================================================================
  
  const allowedRoles = requiredRoles || (requiredRole ? [requiredRole] : []);
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Usar função centralizada de redirecionamento
    const redirectPath = getRedirectPath();
    console.log('🔄 User role', user.role, 'not allowed, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  // ============================================================================
  // RENDERIZAÇÃO DOS CHILDREN SE TUDO OK
  // ============================================================================
  
  return <>{children}</>;
};

// Higher-order component for role-specific protection
export const withRoleProtection = (
  Component: React.ComponentType,
  allowedRoles: UserRole[]
) => {
  return (props: any) => (
    <ProtectedRoute requiredRoles={allowedRoles}>
      <Component {...props} />
    </ProtectedRoute>
  );
};

// ============================================================================
// COMPONENTES DE ROTA ESPECÍFICOS POR ROLE
// ============================================================================

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="admin">{children}</ProtectedRoute>
);

export const BarberRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="barber">{children}</ProtectedRoute>
);

export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute requiredRole="customer">{children}</ProtectedRoute>
);

// ============================================================================
// ROTA PÚBLICA (REDIRECIONA USUÁRIOS AUTENTICADOS PARA SEU DASHBOARD)
// ============================================================================

export const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, getRedirectPath } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }
  
  if (user) {
    const redirectPath = getRedirectPath();
    console.log('🔄 User authenticated on public route, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;