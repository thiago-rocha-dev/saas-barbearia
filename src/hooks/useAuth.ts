import React, { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole, Permission, RolePermissions } from '../types/dashboard';
import { useToast } from './useToast';

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccess: (path: string) => boolean;
  getRedirectPath: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based permissions configuration
const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { resource: 'dashboard', action: 'read', roles: ['admin'] },
    { resource: 'users', action: 'create', roles: ['admin'] },
    { resource: 'users', action: 'read', roles: ['admin'] },
    { resource: 'users', action: 'update', roles: ['admin'] },
    { resource: 'users', action: 'delete', roles: ['admin'] },
    { resource: 'appointments', action: 'create', roles: ['admin'] },
    { resource: 'appointments', action: 'read', roles: ['admin'] },
    { resource: 'appointments', action: 'update', roles: ['admin'] },
    { resource: 'appointments', action: 'delete', roles: ['admin'] },
    { resource: 'reports', action: 'read', roles: ['admin'] },
    { resource: 'settings', action: 'update', roles: ['admin'] },
  ],
  barber: [
    { resource: 'dashboard', action: 'read', roles: ['barber'] },
    { resource: 'appointments', action: 'read', roles: ['barber'] },
    { resource: 'appointments', action: 'update', roles: ['barber'] },
    { resource: 'clients', action: 'read', roles: ['barber'] },
    { resource: 'profile', action: 'update', roles: ['barber'] },
    { resource: 'schedule', action: 'read', roles: ['barber'] },
    { resource: 'schedule', action: 'update', roles: ['barber'] },
  ],
  customer: [
    { resource: 'dashboard', action: 'read', roles: ['customer'] },
    { resource: 'appointments', action: 'create', roles: ['customer'] },
    { resource: 'appointments', action: 'read', roles: ['customer'] },
    { resource: 'appointments', action: 'update', roles: ['customer'] },
    { resource: 'profile', action: 'read', roles: ['customer'] },
    { resource: 'profile', action: 'update', roles: ['customer'] },
    { resource: 'barbers', action: 'read', roles: ['customer'] },
  ],
};

// Route access configuration
const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/barber': ['barber'],
  '/customer': ['customer'],
  '/profile': ['admin', 'barber', 'customer'],
  '/appointments': ['admin', 'barber', 'customer'],
};

// Auth Provider Component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  useEffect(() => {
    // Check initial session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await checkUser();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // TODO: Replace with real API call to get user profile with role
        // For now, using mock data based on email
        const mockUser: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'Usuário',
          role: getMockUserRole(session.user.email || ''),
          avatar: session.user.user_metadata?.avatar_url,
          phone: session.user.user_metadata?.phone,
          createdAt: new Date(session.user.created_at),
          isActive: true,
        };
        
        setUser(mockUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to determine user role based on email
  // TODO: Replace with real API call
  const getMockUserRole = (email: string): UserRole => {
    if (email.includes('admin')) return 'admin';
    if (email.includes('barber') || email.includes('barbeiro')) return 'barber';
    return 'customer';
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        addToast({
          type: 'error',
          title: 'Erro no login',
          description: error.message,
        });
        return { success: false, error: error.message };
      }

      if (data.user) {
        addToast({
          type: 'success',
          title: 'Login realizado!',
          description: 'Redirecionando para o dashboard...',
        });
        return { success: true };
      }

      return { success: false, error: 'Erro desconhecido' };
    } catch (error) {
      const errorMessage: string = error instanceof Error ? error.message : 'Erro desconhecido';
      addToast({
        type: 'error',
        title: 'Erro no login',
        description: errorMessage,
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        addToast({
          type: 'error',
          title: 'Erro ao sair',
          description: error.message,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Logout realizado',
          description: 'Até logo!',
        });
        setUser(null);
      }
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.some(
      permission => 
        permission.resource === resource && 
        permission.action === action &&
        permission.roles.includes(user.role)
    );
  };

  const canAccess = (path: string): boolean => {
    if (!user) return false;
    
    const allowedRoles = ROUTE_ACCESS[path];
    if (!allowedRoles) return true; // Public route
    
    return allowedRoles.includes(user.role);
  };

  const getRedirectPath = (): string => {
    if (!user) return '/auth/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'barber':
        return '/barber';
      case 'customer':
        return '/customer';
      default:
        return '/auth/login';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    signIn,
    signOut,
    hasRole,
    hasPermission,
    canAccess,
    getRedirectPath,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

// useAuth Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export types
export type { AuthContextType };