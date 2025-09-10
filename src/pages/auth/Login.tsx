import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { user, loading, error, signIn, getRedirectPath } = useAuth();

  // ============================================================================
  // REDIRECIONAMENTO AUTOMÁTICO PARA USUÁRIOS AUTENTICADOS
  // ============================================================================
  
  useEffect(() => {
    if (user && !loading) {
      const redirectPath = getRedirectPath();
      console.log('🔄 User authenticated, redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, loading, navigate, getRedirectPath]);
  
  // Não renderizar se usuário já está autenticado
  if (user && !loading) {
    return null;
  }

  // ============================================================================
  // VALIDAÇÃO DE CAMPOS
  // ============================================================================

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError('* Campo obrigatório');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('* Email inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password: string) => {
    if (!password) {
      setPasswordError('* Campo obrigatório');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('* Mínimo 6 caracteres');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // ============================================================================
  // FUNÇÃO DE LOGIN CENTRALIZADA
  // ============================================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de campos obrigatórios
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    try {
      const result = await signIn(email, password);
      
      if (result.success) {
        // O redirecionamento será feito automaticamente pelo useEffect
        // quando o user for atualizado no contexto
        console.log('✅ Login successful, waiting for redirect...');
      }
      // Erros são tratados automaticamente pelo contexto de auth
    } catch (error) {
      console.error('❌ Unexpected login error:', error);
    }
  };

  // ============================================================================
  // LOGO SVG TEMPORÁRIO (pode ser substituído por asset externo)
  // ============================================================================
  const BarberLogo = () => (
    <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden flex items-center justify-center py-8 px-4">
      {/* Fundo com partículas/estrelas sutis */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full opacity-30 animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-white rounded-full opacity-25 animate-pulse delay-500"></div>
        <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-white rounded-full opacity-20 animate-pulse delay-700"></div>
        <div className="absolute bottom-1/3 right-1/2 w-2 h-2 bg-white rounded-full opacity-15 animate-pulse delay-300"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo circular acima do card */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl border-4 border-white/20">
            <BarberLogo />
          </div>
        </div>

        {/* Card principal com glassmorphism */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-2xl p-8 w-full">
          {/* Header do card */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-3">
              Bem-vindo de volta
            </h1>
            <p className="text-white/80 text-lg">
              Faça login para acessar sua conta
            </p>
            
            {/* Mensagem de erro global */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 backdrop-blur border border-red-400/30 rounded-xl">
                <p className="text-red-200 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Email */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
                <input
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  onBlur={() => validateEmail(email)}
                  className={`w-full pl-14 pr-4 py-4 bg-white/10 backdrop-blur border rounded-2xl text-white placeholder-white/60 text-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                    emailError 
                      ? 'border-red-400/50 focus:ring-red-400/50' 
                      : 'border-white/30 focus:border-white/50 focus:ring-white/30'
                  }`}
                  required
                />
              </div>
              {emailError && (
                <p className="text-red-300 text-sm ml-2 font-medium">{emailError}</p>
              )}
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-white/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  onBlur={() => validatePassword(password)}
                  className={`w-full pl-14 pr-14 py-4 bg-white/10 backdrop-blur border rounded-2xl text-white placeholder-white/60 text-lg focus:outline-none focus:ring-2 transition-all duration-300 ${
                    passwordError 
                      ? 'border-red-400/50 focus:ring-red-400/50' 
                      : 'border-white/30 focus:border-white/50 focus:ring-white/30'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? (
                    <EyeOff className="w-6 h-6" />
                  ) : (
                    <Eye className="w-6 h-6" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-300 text-sm ml-2 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-xl"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </div>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>

        {/* Link de cadastro abaixo do card */}
        <div className="mt-8 text-center">
          <p className="text-white/70 text-base">
            Não tem uma conta?{' '}
            <Link
              to="/auth/register"
              className="font-semibold text-white hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-4"
            >
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;