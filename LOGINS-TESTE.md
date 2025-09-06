# 🔐 Configuração de Usuários de Teste - BarberPro

## 📋 Passo a Passo para Configuração

### 1. 🗄️ Configurar Banco de Dados
1. **Execute primeiro:** `fix-database.sql` no SQL Editor do Supabase
   - Cria todas as tabelas necessárias
   - Configura políticas RLS
   - Insere dados básicos (barbearia e serviços)

### 2. 👥 Criar Usuários no Supabase Auth
No painel do Supabase, vá em **Authentication > Users** e crie:

#### 👨‍💼 Administrador
- **Email:** admin@barberpro.com
- **Senha:** admin123
- **Confirmar email:** ✅ Sim

#### ✂️ Barbeiro
- **Email:** barbeiro@barberpro.com
- **Senha:** barber123
- **Confirmar email:** ✅ Sim

#### 👤 Cliente
- **Email:** cliente@barberpro.com
- **Senha:** client123
- **Confirmar email:** ✅ Sim

### 3. 🔧 Configurar Perfis
1. **Copie os IDs** dos usuários criados no Supabase Auth
2. **Edite o arquivo** `quick-setup-users.sql`
3. **Substitua os UUIDs** pelos IDs reais dos usuários
4. **Execute o script** no SQL Editor do Supabase

### 4. ✅ Verificar Configuração
1. **Acesse:** http://localhost:5173
2. **Faça login** com as credenciais criadas
3. **Teste cada perfil** para verificar funcionamento

## 🎯 Funcionalidades por Perfil

### 👨‍💼 Administrador
- Dashboard completo com métricas
- Gerenciamento de agendamentos
- Controle de usuários
- Relatórios e estatísticas

### ✂️ Barbeiro
- Agenda pessoal
- Gerenciamento de clientes
- Controle de serviços
- Histórico de atendimentos

### 👤 Cliente
- Agendamento de serviços
- Histórico pessoal
- Perfil e preferências
- Avaliações

## ⚠️ Problemas Conhecidos e Soluções

### Erro "Erro ao carregar agendamentos"
- **Causa:** Tabelas não criadas ou políticas RLS incorretas
- **Solução:** Execute `fix-database.sql` novamente

### Usuário não consegue fazer login
- **Causa:** Perfil não criado ou IDs incorretos
- **Solução:** Verifique os IDs no `quick-setup-users.sql`

### Interface com muitos erros
- **Causa:** Dados inconsistentes no banco
- **Solução:** Execute os scripts na ordem correta

## 🔧 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Verificar logs em tempo real
# Abra o console do navegador (F12)
```

## 📁 Arquivos Importantes

- `fix-database.sql` - Setup completo do banco
- `quick-setup-users.sql` - Criação de perfis de usuário
- `.env` - Configurações do Supabase
- `src/lib/supabase.ts` - Configuração do cliente

---

## 🧪 Como Testar os Dashboards

### 1. Teste do Dashboard Admin
```
1. Faça login com: admin@barberpro.com / admin123
2. Verifique se aparece:
   - Estatísticas gerais
   - Lista de usuários
   - Gerenciamento de barbeiros
   - Relatórios financeiros
```

### 2. Teste do Dashboard Barbeiro
```
1. Faça login com: barbeiro@barberpro.com / barber123
2. Verifique se aparece:
   - Agenda do dia
   - Próximos agendamentos
   - Perfil do barbeiro
   - Serviços oferecidos
```

### 3. Teste do Dashboard Cliente
```
1. Faça login com: cliente@barberpro.com / client123
2. Verifique se aparece:
   - Próximos agendamentos
   - Histórico de serviços
   - Opção de novo agendamento
   - Perfil pessoal
```

---

## 🔧 Gerenciamento dos Usuários de Teste

### Como Alterar Senhas

1. **Via Supabase Dashboard:**
   ```sql
   -- Alterar senha do admin
   UPDATE auth.users 
   SET encrypted_password = crypt('nova_senha', gen_salt('bf'))
   WHERE email = 'admin@barberpro.com';
   ```

2. **Via Interface do Supabase:**
   - Vá para `Authentication > Users`
   - Encontre o usuário desejado
   - Clique em `...` > `Reset Password`

### Como Alterar Roles

```sql
-- Alterar role de um usuário
UPDATE profiles 
SET role = 'admin' -- ou 'barber' ou 'customer'
WHERE email = 'usuario@barberpro.com';
```

### Como Deletar Usuários de Teste

```sql
-- Deletar todos os dados de teste
DELETE FROM appointments WHERE customer_email LIKE '%barberpro.com';
DELETE FROM barbers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email LIKE '%barberpro.com'
);
DELETE FROM profiles WHERE email LIKE '%barberpro.com';
DELETE FROM auth.users WHERE email LIKE '%barberpro.com';
```

---

## 🔄 Reset Completo dos Dados de Teste

### Script de Reset
```sql
-- 1. Limpar dados existentes
DELETE FROM appointments WHERE customer_email LIKE '%barberpro.com';
DELETE FROM barbers WHERE profile_id IN (
  SELECT id FROM profiles WHERE email LIKE '%barberpro.com'
);
DELETE FROM profiles WHERE email LIKE '%barberpro.com';
DELETE FROM auth.users WHERE email LIKE '%barberpro.com';

-- 2. Reexecutar o seed-test-data.sql
```

### Automatização para Desenvolvimento

Para garantir que os logins estejam sempre disponíveis:

1. **Adicione ao seu workflow de desenvolvimento:**
   ```bash
   # No seu script de setup local
   npm run db:reset
   npm run db:seed
   ```

2. **Configure no package.json:**
   ```json
   {
     "scripts": {
       "db:seed": "supabase db reset && psql -f seed-test-data.sql",
       "db:reset-test": "psql -f reset-test-users.sql"
     }
   }
   ```

---

## 🐛 Troubleshooting

### Problema: "Usuário não consegue fazer login"
**Solução:**
1. Verifique se o usuário existe na tabela `auth.users`
2. Confirme se `email_confirmed_at` não é NULL
3. Verifique se existe um perfil correspondente na tabela `profiles`

### Problema: "Dashboard não carrega corretamente"
**Solução:**
1. Verifique se o `role` está correto na tabela `profiles`
2. Confirme se `is_active = true`
3. Para barbeiros, verifique se existe registro na tabela `barbers`

### Problema: "Dados não aparecem no dashboard"
**Solução:**
1. Verifique se os agendamentos de exemplo foram criados
2. Confirme se `barbershop_id` está correto
3. Execute o script de seed novamente

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Execute o script de verificação no final do `seed-test-data.sql`
3. Consulte a documentação do Supabase para autenticação

---

**⚠️ Importante:** Estes usuários são apenas para desenvolvimento e teste. **NÃO** use em produção!