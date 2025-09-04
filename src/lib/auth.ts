import { supabase } from './supabase';
import type { LoginFormData } from './validations';

// Tipos para autenticação
export type UserRole = 'admin' | 'barber' | 'customer';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

// Função principal de login
export const signIn = async (credentials: LoginFormData): Promise<AuthResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });

    if (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error.message)
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Erro interno. Tente novamente.'
      };
    }

    // Buscar dados do perfil do usuário
    const userProfile = await getUserProfile(data.user.id);
    
    return {
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email!,
        role: userProfile?.role || 'customer',
        name: userProfile?.name
      }
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      error: 'Erro interno. Tente novamente.'
    };
  }
};

// Função para buscar perfil do usuário
const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, name')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao buscar perfil:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    return null;
  }
};

// Função para logout
export const signOut = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return {
        success: false,
        error: 'Erro ao fazer logout'
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    return {
      success: false,
      error: 'Erro interno'
    };
  }
};

// Função para obter usuário atual
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return null;

    const userProfile = await getUserProfile(user.id);
    
    return {
      id: user.id,
      email: user.email!,
      role: userProfile?.role || 'customer',
      name: userProfile?.name
    };
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    return null;
  }
};

// Função para redirecionamento baseado no role
export const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/admin/dashboard';
    case 'barber':
      return '/barber/dashboard';
    case 'customer':
      return '/customer/dashboard';
    default:
      return '/customer/dashboard';
  }
};

// Função para traduzir mensagens de erro do Supabase
const getAuthErrorMessage = (errorMessage: string): string => {
  const errorMap: Record<string, string> = {
    'Invalid login credentials': 'Email ou senha incorretos',
    'Email not confirmed': 'Email não confirmado. Verifique sua caixa de entrada.',
    'Too many requests': 'Muitas tentativas. Tente novamente em alguns minutos.',
    'User not found': 'Usuário não encontrado',
    'Invalid email': 'Email inválido',
    'Weak password': 'Senha muito fraca',
    'Email already registered': 'Email já cadastrado',
    'Network error': 'Erro de conexão. Verifique sua internet.'
  };

  // Busca por mensagens que contenham as chaves
  for (const [key, value] of Object.entries(errorMap)) {
    if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Mensagem padrão para erros não mapeados
  return 'Erro ao fazer login. Tente novamente.';
};