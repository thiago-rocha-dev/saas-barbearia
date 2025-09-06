const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Configuração do Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Credenciais de teste
const testCredentials = [
  {
    email: 'admin@barberpro.com',
    password: 'admin123',
    expectedRole: 'admin',
    description: 'Admin'
  },
  {
    email: 'barbeiro@barberpro.com',
    password: 'barbeiro123',
    expectedRole: 'barber',
    description: 'Barbeiro'
  },
  {
    email: 'cliente@barberpro.com',
    password: 'cliente123',
    expectedRole: 'customer',
    description: 'Cliente'
  }
];

async function testLoginFlow() {
  console.log('🧪 Iniciando testes de fluxo de login...');
  console.log('=' .repeat(50));
  
  let passedTests = 0;
  let totalTests = testCredentials.length;
  
  for (const credential of testCredentials) {
    console.log(`\n🔍 Testando login: ${credential.description}`);
    console.log(`📧 Email: ${credential.email}`);
    
    try {
      // Teste 1: Login com credenciais
      console.log('  ⏳ Fazendo login...');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: credential.email,
        password: credential.password
      });
      
      if (authError) {
        console.log(`  ❌ Erro no login: ${authError.message}`);
        continue;
      }
      
      if (!authData.user) {
        console.log('  ❌ Usuário não retornado após login');
        continue;
      }
      
      console.log('  ✅ Login realizado com sucesso');
      
      // Teste 2: Verificar profile
      console.log('  ⏳ Verificando profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, full_name, phone, is_active')
        .eq('id', authData.user.id)
        .single();
      
      if (profileError) {
        console.log(`  ❌ Erro ao buscar profile: ${profileError.message}`);
        await supabase.auth.signOut();
        continue;
      }
      
      if (!profile) {
        console.log('  ❌ Profile não encontrado');
        await supabase.auth.signOut();
        continue;
      }
      
      console.log(`  ✅ Profile encontrado: ${profile.full_name}`);
      console.log(`  📋 Role: ${profile.role}`);
      console.log(`  📱 Telefone: ${profile.phone || 'Não informado'}`);
      console.log(`  🟢 Ativo: ${profile.is_active ? 'Sim' : 'Não'}`);
      
      // Teste 3: Verificar role esperada
      if (profile.role === credential.expectedRole) {
        console.log(`  ✅ Role correta: ${profile.role}`);
        passedTests++;
      } else {
        console.log(`  ❌ Role incorreta. Esperado: ${credential.expectedRole}, Encontrado: ${profile.role}`);
      }
      
      // Logout
      await supabase.auth.signOut();
      console.log('  🚪 Logout realizado');
      
    } catch (error) {
      console.log(`  ❌ Erro inesperado: ${error.message}`);
    }
  }
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 RESULTADO DOS TESTES:');
  console.log(`✅ Testes aprovados: ${passedTests}/${totalTests}`);
  console.log(`❌ Testes falharam: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('🎉 Todos os testes passaram! Sistema de login funcionando corretamente.');
  } else {
    console.log('⚠️ Alguns testes falharam. Verifique os logs acima.');
  }
  
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('1. Acesse http://localhost:5173/auth/login');
  console.log('2. Teste manualmente com as credenciais acima');
  console.log('3. Verifique se o redirecionamento funciona corretamente');
  console.log('4. Confirme se os toasts de sucesso/erro aparecem adequadamente');
}

// Executar testes
testLoginFlow().catch(console.error);