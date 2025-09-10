# 🏥 BARBERPRO - Guia de Setup Automático do Banco de Dados

## 🎯 Visão Geral

Este projeto possui um sistema completo de **health check e automação** que garante que o banco de dados esteja sempre íntegro e pronto para uso em qualquer ambiente (desenvolvimento, QA, produção, CI/CD).

## 🚀 Setup Rápido (Uma Linha)

```bash
# Setup completo automático
npm run setup:complete
```

Este comando:
1. ✅ Verifica se todas as tabelas existem
2. ✅ Executa migrações automáticas se necessário
3. ✅ Cria barbearia e serviços padrão
4. ✅ Cria usuários de teste
5. ✅ Valida integridade final

## 📋 Scripts Disponíveis

### Health Check e Diagnóstico
```bash
# Verificar saúde do banco
npm run db:health

# Verificar e corrigir problemas automaticamente
npm run db:health:fix
```

### Migrações Automáticas
```bash
# Executar migrações (auto-setup-complete.sql)
npm run db:migrate

# Forçar execução mesmo com erros
npm run db:migrate:force
```

### Validação Pré-Seed
```bash
# Validação completa antes do seed
npm run db:autoup
```

### Setup e Reset
```bash
# Setup completo do projeto
npm run setup:complete

# Reset completo (cuidado!)
npm run reset:complete

# Apenas seed de usuários
npm run seed:users
```

## 🔧 Arquitetura do Sistema

### 1. Health Check (`scripts/health-check.js`)
- ✅ Verifica existência de tabelas essenciais
- ✅ Valida dados críticos (barbearia, serviços)
- ✅ Correção automática de problemas
- ✅ Modo pré-seed para validação completa

### 2. Auto-Migrate (`scripts/auto-migrate.js`)
- ✅ Executa `auto-setup-complete.sql` automaticamente
- ✅ Processa comandos SQL linha por linha
- ✅ Tratamento inteligente de erros
- ✅ Modo force para ambientes problemáticos

### 3. Seed com Validação (`scripts/seed-users.js`)
- ✅ Validação pré-seed integrada
- ✅ Criação idempotente de usuários
- ✅ Verificação de integridade pós-seed
- ✅ Fallbacks automáticos

## 🏭 Uso em CI/CD

### GitHub Actions
```yaml
name: Setup Database
steps:
  - name: Install dependencies
    run: npm install
    
  - name: Setup database
    run: npm run setup:complete
    env:
      VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
      SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

### Docker
```dockerfile
# No Dockerfile ou docker-compose
RUN npm run setup:complete
```

### Ambientes Locais
```bash
# Primeiro setup
git clone <repo>
cd saas-barbearia-agendamento
npm install
npm run setup:complete
npm run dev
```

## 🛡️ Garantias de Integridade

### ✅ Tabelas Essenciais Verificadas
- `barbershops` - Barbearias
- `services` - Serviços disponíveis
- `profiles` - Perfis de usuários
- `barbers` - Registros de barbeiros
- `appointments` - Agendamentos
- `working_hours` - Horários de trabalho

### ✅ Dados Críticos Garantidos
- Barbearia padrão sempre existe
- Pelo menos 3 serviços padrão
- Usuários de teste funcionais
- Políticas RLS ativas
- Triggers funcionando

### ✅ Fallbacks Automáticos
- Se tabela não existe → executa migração
- Se barbearia não existe → cria padrão
- Se serviços não existem → cria padrão
- Se usuário já existe → pula criação
- Se erro de FK → tenta recriar dependências

## 🚨 Troubleshooting

### Problema: "Tabela não encontrada"
```bash
# Solução automática
npm run db:health:fix

# Ou migração forçada
npm run db:migrate:force
```

### Problema: "Foreign key constraint"
```bash
# Validação pré-seed resolve
npm run db:autoup
```

### Problema: "Usuário já existe"
```bash
# Seed é idempotente, apenas continue
npm run seed:users
```

### Problema: "Função exec_sql não existe"
```bash
# Execute no SQL Editor do Supabase:
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS void AS $$
BEGIN
    EXECUTE sql_query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 📊 Monitoramento

### Logs de Sucesso
```
🎉 BANCO DE DADOS SAUDÁVEL!
✅ Todas as tabelas e dados essenciais estão presentes
✅ Validação pré-seed concluída com sucesso
✅ Todos os usuários e perfis estão sincronizados!
```

### Logs de Problema
```
⚠️  ENCONTRADOS X PROBLEMAS:
   1. Tabela 'barbershops' não encontrada
   2. Barbearia padrão não encontrada
💡 Para corrigir automaticamente, execute:
   node scripts/health-check.js --fix
```

## 🔄 Fluxo Completo de Reset

```bash
# 1. Reset completo (CUIDADO!)
npm run reset:complete

# 2. Ou passo a passo:
npm run reset:database -- --confirm
npm run db:migrate
npm run seed:users
npm run dev
```

## 🎯 Checklist de Validação

- [ ] `npm run db:health` retorna sucesso
- [ ] `npm run setup:complete` executa sem erros
- [ ] Login com `admin@barberpro.com / admin123` funciona
- [ ] Wizard de agendamento carrega serviços
- [ ] Calendário exibe sem erros
- [ ] Perfis de barbeiro têm serviços vinculados

## 📞 Suporte

Se algum script falhar:
1. Verifique as variáveis de ambiente (`.env`)
2. Execute `npm run db:health` para diagnóstico
3. Use `npm run db:health:fix` para correção automática
4. Em último caso, execute o `auto-setup-complete.sql` manualmente no Supabase

---

**✅ Sistema 100% automatizado e à prova de falhas!**