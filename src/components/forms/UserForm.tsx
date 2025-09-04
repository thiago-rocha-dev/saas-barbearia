import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Lock, UserCheck } from 'lucide-react';
import { useUsers } from '../../hooks/useUsers';
import type { User as UserType, CreateUserRequest, UpdateUserRequest, UserRole } from '../../types/users';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: UserType | null;
  mode: 'create' | 'edit';
  defaultRole?: UserRole;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  user,
  mode,
  defaultRole = 'customer'
}) => {
  const { createNewUser, updateExistingUser, validateEmail, loading } = useUsers();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: defaultRole as UserRole,
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Preencher formulário quando editando
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role,
        password: '',
        confirmPassword: ''
      });
    } else if (mode === 'create') {
      setFormData({
        name: '',
        email: '',
        phone: '',
        role: defaultRole,
        password: '',
        confirmPassword: ''
      });
    }
  }, [mode, user, defaultRole]);

  // Limpar erros quando fechar modal
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {};

    // Validar nome
    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    } else if (mode === 'create' || (mode === 'edit' && formData.email !== user?.email)) {
      // Verificar se email já existe
      const emailValid = await validateEmail(formData.email);
      if (!emailValid) {
        newErrors.email = 'Este email já está em uso';
      }
    }

    // Validar telefone (opcional, mas se preenchido deve ser válido)
    if (formData.phone && !/^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/.test(formData.phone)) {
      newErrors.phone = 'Telefone inválido';
    }

    // Validar senha (obrigatória apenas na criação)
    if (mode === 'create') {
      if (!formData.password) {
        newErrors.password = 'Senha é obrigatória';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
      }

      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Senhas não coincidem';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const isValid = await validateForm();
      if (!isValid) {
        setIsSubmitting(false);
        return;
      }

      let success = false;

      if (mode === 'create') {
        const createData: CreateUserRequest = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          role: formData.role,
          password: formData.password
        };
        
        success = await createNewUser(createData);
      } else if (mode === 'edit' && user) {
        const updateData: UpdateUserRequest = {
          name: formData.name.trim(),
          phone: formData.phone.trim() || undefined
        };
        
        success = await updateExistingUser(user.id, updateData);
      }

      if (success) {
        onClose();
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            {mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome */}
          <div>
            <Input
              label="Nome Completo"
              type="text"
              value={formData.name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('name', e.target.value)}
              placeholder="Digite o nome completo"
              icon={<User />}
              error={errors.name}
              required
            />
          </div>

          {/* Email */}
          <div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
              placeholder="Digite o email"
              icon={<Mail />}
              error={errors.email}
              required
              disabled={mode === 'edit'} // Não permitir alterar email na edição
            />
          </div>

          {/* Telefone */}
          <div>
            <Input
              label="Telefone"
              type="tel"
              value={formData.phone}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('phone', e.target.value)}
              placeholder="(11) 99999-9999"
              icon={<Phone />}
              error={errors.phone}
            />
          </div>

          {/* Role */}
          {mode === 'create' && (
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Tipo de Usuário
              </label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange('role', e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              >
                <option value="customer" className="bg-gray-800 text-white">
                  Cliente
                </option>
                <option value="barber" className="bg-gray-800 text-white">
                  Barbeiro
                </option>
              </select>
              {errors.role && (
                <p className="text-red-400 text-sm mt-1">{errors.role}</p>
              )}
            </div>
          )}

          {/* Senha (apenas na criação) */}
          {mode === 'create' && (
            <>
              <div>
                <Input
                  label="Senha"
                  type="password"
                  value={formData.password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                  placeholder="Digite a senha"
                  icon={<Lock />}
                  error={errors.password}
                  required
                />
              </div>

              <div>
                <Input
                  label="Confirmar Senha"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirme a senha"
                  icon={<Lock />}
                  error={errors.confirmPassword}
                  required
                />
              </div>
            </>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={isSubmitting || loading}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  {mode === 'create' ? 'Criando...' : 'Salvando...'}
                </div>
              ) : (
                mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;