# 🚀 BarberPro - Setup Automático Completo

## 🎯 Objetivo

Este guia configura **automaticamente** todos os usuários de teste do BarberPro sem **NENHUMA** edição manual. Todo o processo é executado via scripts e comandos npm.

## ⚡ Setup Rápido (4 Passos)

### 1. 🔧 Configurar Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais do Supabase
# (URL, ANON_KEY e SERVICE_ROLE_KEY)
```

### 2. 🗄️ Configurar Banco de Dados

```bash
# No Supabase Dashboard > SQL Editor, execute:
# auto-setup-complete.sql

# OU use o comando helper:
npm run setup:database
```

### 3. 👥 Criar Usuários Automaticamente

```bash
# Criar todos os usuários de teste
npm run seed:users

# OU setup completo (banco + usuários)
npm run setup:complete
```

### 4. ✅ Validar Configuração (opcional)

```bash
# Verifica se tudo está funcionando
npm run validate:setup
```

**Pronto! Sistema 100% funcional! 🎉**

---

## 🔑 Credenciais de Teste

| Perfil | Email | Senha | Acesso |
|--------|-------|-------|--------|
| **Admin** | admin@barberpro.com | admin123 | Dashboard completo |
| **Barbeiro** | barbeiro@barberpro.com | barber123 | Agenda pessoal |
| **Cliente** | cliente@barberpro.com | client123 | Agendamentos |

```bash
# Ver credenciais rapidamente
npm run test:logins
```

---

## 🛠️ Comandos Disponíveis

### Setup e Configuração
```bash
npm run setup:complete     # Setup completo (recomendado)
npm run setup:database     # Apenas instruções do banco
npm run seed:users          # Criar usuários de teste
npm run validate:setup     # Validar configuração do sistema
```

### Reset e Limpeza
```bash
npm run reset:database     # Reset com confirmação
npm run reset:complete     # Reset + setup automático
```

### Desenvolvimento
```bash
npm run dev                # Iniciar servidor
npm run build              # Build de produção
npm run test:logins        # Ver credenciais
```

---

## 🔄 Reset Completo

Para recomeçar do zero:

```bash
# Reset completo (remove TUDO)
npm run reset:complete

# OU passo a passo:
npm run reset:database -- --confirm
npm run setup:complete
```

---

## 🏗️ Arquitetura da Automação

### 📁 Arquivos Principais

- **`auto-setup-complete.sql`** - Setup completo do banco + triggers
- **`scripts/seed-users.js`** - Criação automática de usuários
- **`scripts/reset-database.js`** - Reset completo do sistema
- **`.env.example`** - Template de configuração

### 🔧 Como Funciona

1. **Trigger SQL** cria perfis automaticamente quando usuário é inserido no Auth
2. **Script Node.js** usa API administrativa do Supabase para criar usuários
3. **Roles automáticas** baseadas no email (admin@, barbeiro@, cliente@)
4. **Dados de exemplo** criados automaticamente (agendamentos, etc.)

### 🛡️ Segurança

- ✅ RLS (Row Level Security) habilitado
- ✅ Políticas de acesso configuradas
- ✅ Service Role Key protegida no .env
- ✅ Triggers seguros com validação

---

## 🚨 Troubleshooting

### Erro: "Variáveis de ambiente não configuradas"
```bash
# Verificar se .env existe e está preenchido
cat .env

# Copiar do exemplo se necessário
cp .env.example .env
```

### Erro: "Usuário já existe"
```bash
# Normal! Script pula usuários existentes
# Para recriar, use reset:
npm run reset:database -- --confirm
```

### Erro: "Erro ao carregar agendamentos"
```bash
# Executar setup do banco novamente
# No Supabase SQL Editor: auto-setup-complete.sql
npm run seed:users
```

### Interface com erros
```bash
# Reset completo
npm run reset:complete

# Verificar console do navegador (F12)
```

---

## ✅ Validação

### Teste Completo
1. **Reset:** `npm run reset:complete`
2. **Acesso:** http://localhost:5173
3. **Login:** Teste cada perfil (admin, barbeiro, cliente)
4. **Funcionalidades:** Verifique dashboards específicos
5. **Dados:** Confirme agendamentos e estatísticas

### Checklist de Validação
- [ ] Admin dashboard carrega sem erros
- [ ] Barbeiro vê agenda pessoal
- [ ] Cliente pode fazer agendamentos
- [ ] Estatísticas mostram dados reais
- [ ] Não há erros no console

---

## 🔄 Build Limpo

Para testar em ambiente limpo:

```bash
# 1. Clone do repositório
git clone <repo>
cd saas-barbearia-agendamento

# 2. Instalar dependências
npm install

# 3. Configurar ambiente
cp .env.example .env
# Editar .env com credenciais

# 4. Setup automático
npm run setup:complete

# 5. Iniciar desenvolvimento
npm run dev

# 6. Testar logins
npm run test:logins
```

**Resultado:** Sistema 100% funcional sem edições manuais! 🚀

---

## 📞 Suporte

Se algo não funcionar:

1. **Verifique .env** - Credenciais corretas?
2. **Execute reset** - `npm run reset:complete`
3. **Verifique logs** - Console do navegador (F12)
4. **Teste passo a passo** - Siga o checklist de validação

---

*Sistema BarberPro - Automação Completa v1.0* 🎯