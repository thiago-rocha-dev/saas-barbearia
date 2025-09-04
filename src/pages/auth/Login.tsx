import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { signIn, getRedirectPath } from '../../lib/auth';
import { loginSchema, validateField, type LoginFormData } from '../../lib/validations';
import { cn } from '../../lib/utils';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  
  // Estados do formulário
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Animação de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-focus no campo email
  useEffect(() => {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.focus();
    }
  }, []);

  // Validação em tempo real
  const validateFieldRealTime = (field: keyof LoginFormData, value: string) => {
    const result = validateField(loginSchema, field, value);
    setErrors(prev => ({
      ...prev,
      [field]: result.isValid ? undefined : result.error
    }));
  };

  // Manipulação de mudanças nos inputs
  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validação em tempo real apenas se o campo já foi tocado
    if (formData[field] !== '' || value !== '') {
      validateFieldRealTime(field, value);
    }
  };

  // Toggle show/hide password
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return;

    // Validação completa
    try {
      loginSchema.parse(formData);
      setErrors({});
    } catch (error: any) {
      const fieldErrors: Partial<LoginFormData> = {};
      error.errors?.forEach((err: any) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof LoginFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn(formData);
      
      if (result.success && result.user) {
        addToast({
          title: 'Login realizado!',
          description: `Bem-vindo de volta, ${result.user.name || result.user.email}!`,
          type: 'success'
        });
        
        // Redirecionamento baseado no role
        const redirectPath = getRedirectPath(result.user.role);
        
        // Pequeno delay para mostrar o toast antes do redirecionamento
        setTimeout(() => {
          navigate(redirectPath, { replace: true });
        }, 1000);
      } else {
        addToast({
          title: 'Erro no login',
          description: result.error || 'Credenciais inválidas',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Erro no login:', error);
      addToast({
        title: 'Erro interno',
        description: 'Tente novamente em alguns instantes',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo animado com partículas */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Partículas flutuantes */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Card principal com glassmorphism */}
      <div className={cn(
        "relative w-full max-w-md transition-all duration-1000 ease-out",
        isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-8 scale-95"
      )}>
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 rounded-2xl blur-xl"></div>
        
        {/* Card principal */}
        <div className="relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-300">
              Faça login para acessar sua conta
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={cn(
                    "pl-12 bg-white/5 border-white/20 text-white placeholder-gray-400",
                    "focus:border-purple-400 focus:ring-purple-400/20",
                    "transition-all duration-300",
                    errors.email && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                  )}
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={cn(
                    "pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder-gray-400",
                    "focus:border-purple-400 focus:ring-purple-400/20",
                    "transition-all duration-300",
                    errors.password && "border-red-400 focus:border-red-400 focus:ring-red-400/20"
                  )}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 z-10"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600",
                "text-white font-semibold py-3 px-6 rounded-xl",
                "transition-all duration-300 transform hover:scale-105",
                "shadow-lg hover:shadow-purple-500/25",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="sm" />
                  <span>Entrando...</span>
                </div>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              Não tem uma conta?{' '}
              <button
                type="button"
                className="text-purple-400 hover:text-purple-300 transition-colors duration-200 font-medium"
                onClick={() => navigate('/auth/register')}
              >
                Cadastre-se
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;