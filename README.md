# BarberPro - Sistema de Agendamento para Barbearias

Sistema completo de agendamento para barbearias com autenticação baseada em roles, gerenciamento de clientes, barbeiros e administradores.

## 🔐 Sistema de Autenticação Premium

### Arquitetura Centralizada

O sistema utiliza uma arquitetura de autenticação completamente refatorada que elimina duplicações e garante segurança máxima:

- **Hook Único**: `useAuth` como única fonte de verdade
- **Busca Atômica**: Profile sempre buscado diretamente do banco de dados
- **Zero Fallbacks**: Nenhum fallback silencioso para roles
- **Redirecionamento Seguro**: Baseado exclusivamente no role real do usuário

### Fluxo de Autenticação

1. **Login**: Usuário fornece email/senha
2. **Autenticação Supabase**: Validação via Supabase Auth
3. **Busca de Profile**: Busca atômica na tabela `profiles` usando UUID
4. **Validação de Role**: Verificação rigorosa do role do usuário
5. **Redirecionamento**: Direcionamento automático baseado no role:
   - `admin` → `/admin`
   - `barber` → `/barber`
   - `customer` → `/customer`

### Roles e Permissões

#### Admin
- Acesso total ao sistema
- Gerenciamento de usuários
- Relatórios e analytics
- Configurações do sistema

#### Barber (Barbeiro)
- Gerenciamento de agenda própria
- Visualização de clientes
- Controle de serviços
- Relatórios pessoais

#### Customer (Cliente)
- Agendamento de serviços
- Histórico pessoal
- Gerenciamento de perfil
- Avaliações

### Segurança

- **Timeout de Segurança**: 15 segundos para operações críticas
- **Validação Rigorosa**: Verificação de role em cada operação
- **Erro Explícito**: Profiles mal configurados geram erro visível
- **Session Recovery**: Recuperação automática de sessão
- **Logout Seguro**: Limpeza completa de estado

## 🛠️ Tecnologias

- **Frontend**: React + TypeScript + Vite
- **Autenticação**: Supabase Auth
- **Banco de Dados**: Supabase (PostgreSQL)
- **Roteamento**: React Router DOM
- **Estilização**: Tailwind CSS
- **Estado**: Context API

## 📁 Estrutura do Projeto

```
src/
├── hooks/
│   └── useAuth.ts          # Hook centralizado de autenticação
├── components/
│   └── ProtectedRoute.tsx   # Componente de rota protegida
├── pages/
│   ├── auth/
│   │   └── Login.tsx        # Página de login
│   ├── admin/               # Páginas do admin
│   ├── barber/              # Páginas do barbeiro
│   └── customer/            # Páginas do cliente
├── types/
│   └── dashboard.ts         # Tipos TypeScript
└── lib/
    └── supabase.ts          # Configuração Supabase
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
