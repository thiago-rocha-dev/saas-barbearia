import { z } from 'zod';

// Schema para validação de login
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa')
});

// Schema para validação de cadastro (futuro)
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(50, 'Nome muito longo'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  confirmPassword: z
    .string()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword']
});

// Tipos TypeScript derivados dos schemas
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;

// Schemas individuais para validação de campos específicos
export const emailFieldSchema = z
  .string()
  .min(1, 'Email é obrigatório')
  .email('Formato de email inválido');

export const passwordFieldSchema = z
  .string()
  .min(6, 'Senha deve ter pelo menos 6 caracteres')
  .max(100, 'Senha muito longa');

// Função helper para validação em tempo real de campos individuais
export const validateField = (field: string, value: any) => {
  try {
    let fieldSchema;
    
    switch (field) {
      case 'email':
        fieldSchema = emailFieldSchema;
        break;
      case 'password':
        fieldSchema = passwordFieldSchema;
        break;
      default:
        return { isValid: false, error: 'Campo não reconhecido' };
    }
    
    fieldSchema.parse(value);
    return { isValid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.issues[0];
      return {
        isValid: false,
        error: fieldError?.message || 'Campo inválido'
      };
    }
    return { isValid: false, error: 'Erro de validação' };
  }
};