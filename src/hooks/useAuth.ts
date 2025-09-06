import React, { useState, useEffect, createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole, RolePermissions } from '../types/dashboard';
import { useToast } from './useToast';

// ============================================================================
// CONTEXTO DE AUTENTICAÇÃO REFATORADO - VERSÃO PREMIUM
// ============================================================================
// Este é o ÚNICO ponto de verdade para autenticação no sistema.
// Elimina duplicações, fallbacks silenciosos e garante busca atômica de profile.
// ============================================================================

// Interface do contexto de autenticação
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  hasPermission: (resource: string, action: string) => boolean;
  canAccess: (path: string) => boolean;
  getRedirectPath: () => string;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================================
// CONFIGURAÇÃO DE PERMISSÕES E ROTAS
// ============================================================================

// Configuração de permissões baseada em roles
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

// Configuração de acesso às rotas
const ROUTE_ACCESS: Record<string, UserRole[]> = {
  '/admin': ['admin'],
  '/barber': ['barber'],
  '/customer': ['customer'],
  '/profile': ['admin', 'barber', 'customer'],
  '/appointments': ['admin', 'barber', 'customer'],
};

// ============================================================================
// PROVIDER DE AUTENTICAÇÃO REFATORADO
// ============================================================================

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  // ============================================================================
  // INICIALIZAÇÃO E LISTENERS DE AUTENTICAÇÃO
  // ============================================================================

  useEffect(() => {
    let mounted = true;
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ Auth timeout reached - forcing loading to false');
        setLoading(false);
        setError('Timeout na autenticação. Tente recarregar a página.');
      }
    }, 15000); // 15 segundos

    // Inicialização da autenticação
    const initAuth = async () => {
      try {
        await checkUserSession();
      } catch (error) {
        console.error('❌ Init auth error:', error);
        if (mounted) {
          setError('Erro na inicialização da autenticação');
          setLoading(false);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    };
    
    initAuth();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log('🔄 Auth state change:', event);
      
      try {
        if (event === 'SIGNED_IN' && session) {
          await checkUserSession();
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setError(null);
          setLoading(false);
        } else if (event === 'TOKEN_REFRESHED') {
          await checkUserSession();
        }
      } catch (error) {
        console.error('❌ Auth state change error:', error);
        setError('Erro na mudança de estado de autenticação');
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // ============================================================================
  // BUSCA ATÔMICA DE SESSÃO E PROFILE
  // ============================================================================

  const checkUserSession = async (): Promise<void> => {
    try {
      console.log('🔍 Starting atomic user session check...');
      setError(null);
      
      // Timeout para evitar promises pendentes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Session check timeout')), 10000);
      });
      
      const sessionPromise = supabase.auth.getSession();
      
      const { data: { session }, error: sessionError } = await Promise.race([
        sessionPromise,
        timeoutPromise
      ]) as any;
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        setUser(null);
        setError('Erro ao verificar sessão');
        return;
      }
      
      if (!session?.user) {
        console.log('ℹ️ No active session found');
        setUser(null);
        return;
      }
      
      console.log('✅ Session found for:', session.user.email);
      
      // BUSCA ATÔMICA DO PROFILE - SEMPRE DO BANCO DE DADOS
      const userProfile = await getUserProfileAtomic(session.user.id);
      
      // VALIDAÇÃO RIGOROSA: Profile deve existir e ter role válida
      if (!userProfile) {
        console.error('❌ Profile not found for user:', session.user.id);
        setError('Perfil de usuário não encontrado. Contate o administrador.');
        setUser(null);
        return;
      }
      
      if (!userProfile.role || !['admin', 'barber', 'customer'].includes(userProfile.role)) {
        console.error('❌ Invalid or missing role for user:', session.user.id, 'Role:', userProfile.role);
        setError('Perfil de usuário incompleto. Contate o administrador para configurar seu papel no sistema.');
        setUser(null);
        return;
      }
      
      // Construir objeto User com dados validados
      const validatedUser: User = {
        id: session.user.id,
        email: session.user.email || '',
        name: userProfile.full_name || session.user.user_metadata?.name || 'Usuário',
        role: userProfile.role as UserRole,
        avatar: session.user.user_metadata?.avatar_url,
        phone: userProfile.phone || session.user.user_metadata?.phone,
        createdAt: new Date(session.user.created_at),
        isActive: userProfile.is_active ?? true,
      };
      
      console.log('✅ User validated and set:', {
        id: validatedUser.id,
        email: validatedUser.email,
        role: validatedUser.role,
        isActive: validatedUser.isActive
      });
      
      setUser(validatedUser);
      
    } catch (error) {
      console.error('❌ Error in checkUserSession:', error);
      setUser(null);
      setError('Erro ao verificar autenticação');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // BUSCA ATÔMICA DE PROFILE DO BANCO DE DADOS
  // ============================================================================

  const getUserProfileAtomic = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile atomically for:', userId);
      
      // Timeout para evitar promises pendentes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout')), 8000);
      });
      
      const profilePromise = supabase
        .from('profiles')
        .select('role, full_name, phone, is_active')
        .eq('id', userId)
        .single();
      
      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return null;
      }

      console.log('✅ Profile fetched:', data);
      return data;
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      return null;
    }
  };

  // ============================================================================
  // FUNÇÃO DE LOGIN CENTRALIZADA
  // ============================================================================

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('🔐 Starting centralized signIn process for:', email);
      setLoading(true);
      setError(null);
      
      // Timeout para evitar promises pendentes
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SignIn timeout')), 15000);
      });
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      const { data, error } = await Promise.race([
        signInPromise,
        timeoutPromise
      ]) as any;
      
      if (error) {
        console.error('❌ SignIn error:', error);
        const errorMessage = getAuthErrorMessage(error.message);
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Erro no login',
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      if (!data.user) {
        const errorMessage = 'Erro interno no login';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Erro no login',
          description: errorMessage,
        });
        return { success: false, error: errorMessage };
      }

      console.log('✅ SignIn successful for:', data.user.email);
      
      // Aguardar a verificação do profile antes de mostrar sucesso
      try {
        const userProfile = await getUserProfileAtomic(data.user.id);
        
        if (!userProfile) {
          const errorMessage = 'Perfil de usuário não encontrado. Contate o administrador.';
          setError(errorMessage);
          addToast({
            type: 'error',
            title: 'Perfil não encontrado',
            description: errorMessage,
          });
          // Fazer logout para limpar a sessão
          await supabase.auth.signOut();
          return { success: false, error: errorMessage };
        }
        
        if (!userProfile.role || !['admin', 'barber', 'customer'].includes(userProfile.role)) {
          const errorMessage = 'Perfil de usuário incompleto. Contate o administrador para configurar seu papel no sistema.';
          setError(errorMessage);
          addToast({
            type: 'error',
            title: 'Perfil incompleto',
            description: errorMessage,
          });
          // Fazer logout para limpar a sessão
          await supabase.auth.signOut();
          return { success: false, error: errorMessage };
        }
        
        // Só mostrar toast de sucesso se o profile for válido
        addToast({
          type: 'success',
          title: 'Login realizado!',
          description: 'Redirecionando para o dashboard...',
        });
        
        return { success: true };
        
      } catch (profileError) {
        console.error('❌ Profile validation error:', profileError);
        const errorMessage = 'Erro ao validar perfil do usuário';
        setError(errorMessage);
        addToast({
          type: 'error',
          title: 'Erro de validação',
          description: errorMessage,
        });
        // Fazer logout para limpar a sessão
        await supabase.auth.signOut();
        return { success: false, error: errorMessage };
      }
      
    } catch (error) {
      console.error('❌ SignIn catch error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      setError(errorMessage);
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

  // ============================================================================
  // FUNÇÃO DE LOGOUT CENTRALIZADA
  // ============================================================================

  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Starting signOut process...');
      setLoading(true);
      
      // Limpar estado imediatamente
      setUser(null);
      setError(null);
      
      // Logout do Supabase
      const { error } = await supabase.auth.signOut();
      
      // Limpar dados em cache
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (storageError) {
        console.warn('⚠️ Error clearing storage:', storageError);
      }
      
      if (error) {
        console.error('❌ Supabase signOut error:', error);
        addToast({
          type: 'error',
          title: 'Erro ao sair',
          description: error.message,
        });
      } else {
        console.log('✅ SignOut successful');
        addToast({
          type: 'success',
          title: 'Logout realizado',
          description: 'Até logo!',
        });
      }
      
      // Redirecionamento forçado
      window.location.href = '/auth/login';
      
    } catch (error) {
      console.error('❌ Error in signOut:', error);
      // Mesmo com erro, limpar estado e redirecionar
      setUser(null);
      setError(null);
      window.location.href = '/auth/login';
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // FUNÇÕES DE VALIDAÇÃO E REDIRECIONAMENTO
  // ============================================================================

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
    if (!allowedRoles) return true; // Rota pública
    
    return allowedRoles.includes(user.role);
  };

  // ============================================================================
  // REDIRECIONAMENTO ÚNICO E SEGURO BASEADO EM ROLE REAL
  // ============================================================================

  const getRedirectPath = (): string => {
    if (!user) {
      console.log('🔄 No user - redirecting to login');
      return '/auth/login';
    }
    
    // VALIDAÇÃO RIGOROSA: Role deve ser válida
    if (!user.role || !['admin', 'barber', 'customer'].includes(user.role)) {
      console.error('❌ Invalid role for redirect:', user.role);
      return '/auth/login';
    }
    
    const redirectPath = {
      admin: '/admin',
      barber: '/barber',
      customer: '/customer'
    }[user.role];
    
    console.log('🔄 Redirecting user with role', user.role, 'to:', redirectPath);
    return redirectPath;
  };

  // Função para atualizar dados do usuário
  const refreshUser = async (): Promise<void> => {
    await checkUserSession();
  };

  // ============================================================================
  // VALOR DO CONTEXTO
  // ============================================================================

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    hasRole,
    hasPermission,
    canAccess,
    getRedirectPath,
    refreshUser,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
};

// ============================================================================
// HOOK DE AUTENTICAÇÃO
// ============================================================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ============================================================================
// FUNÇÃO AUXILIAR PARA TRADUÇÃO DE ERROS
// ============================================================================

const getAuthErrorMessage = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
    'User not found': 'Usuário não encontrado',
    'Invalid email': 'Email inválido',
    'Weak password': 'Senha muito fraca',
    'Email already registered': 'Email já cadastrado',
    'Network error': 'Erro de conexão. Verifique sua internet.',
    'signIn timeout': 'Timeout no login. Verifique sua conexão.',
    'Session check timeout': 'Timeout na verificação de sessão.',
    'Profile fetch timeout': 'Timeout ao buscar perfil do usuário.'
  };

  // Busca por mensagens que contenham as chaves
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Mensagem padrão para erros não mapeados
  return 'Erro na autenticação. Tente novamente.';
};

// Export types
export type { AuthContextType };