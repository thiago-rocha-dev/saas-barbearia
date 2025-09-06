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

async function checkProfilesDetailed() {
  console.log('🔍 Verificando profiles na tabela...');
  console.log('=' .repeat(50));
  
  try {
    // Buscar todos os profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error('❌ Erro ao buscar profiles:', error.message);
      return;
    }
    
    console.log(`📊 Total de profiles encontrados: ${profiles.length}`);
    console.log('');
    
    if (profiles.length === 0) {
      console.log('⚠️ Nenhum profile encontrado na tabela.');
      console.log('💡 Execute o script auto-setup-complete.sql no Supabase SQL Editor.');
      return;
    }
    
    // Agrupar por ID para detectar duplicatas
    const profilesById = {};
    profiles.forEach(profile => {
      if (!profilesById[profile.id]) {
        profilesById[profile.id] = [];
      }
      profilesById[profile.id].push(profile);
    });
    
    // Mostrar detalhes de cada profile
    Object.keys(profilesById).forEach((id, index) => {
      const userProfiles = profilesById[id];
      console.log(`👤 Profile ${index + 1}:`);
      console.log(`   ID: ${id}`);
      
      if (userProfiles.length > 1) {
        console.log(`   ⚠️ DUPLICATA DETECTADA! ${userProfiles.length} registros para o mesmo ID`);
        userProfiles.forEach((profile, dupIndex) => {
          console.log(`   Registro ${dupIndex + 1}:`);
          console.log(`     Role: ${profile.role}`);
          console.log(`     Nome: ${profile.full_name}`);
          console.log(`     Email: ${profile.email || 'N/A'}`);
          console.log(`     Telefone: ${profile.phone || 'N/A'}`);
          console.log(`     Ativo: ${profile.is_active}`);
          console.log(`     Criado em: ${profile.created_at}`);
        });
      } else {
        const profile = userProfiles[0];
        console.log(`   Role: ${profile.role}`);
        console.log(`   Nome: ${profile.full_name}`);
        console.log(`   Email: ${profile.email || 'N/A'}`);
        console.log(`   Telefone: ${profile.phone || 'N/A'}`);
        console.log(`   Ativo: ${profile.is_active}`);
        console.log(`   Criado em: ${profile.created_at}`);
      }
      console.log('');
    });
    
    // Verificar usuários no Auth
    console.log('🔐 Verificando usuários no Supabase Auth...');
    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('⚠️ Não foi possível verificar usuários do Auth (requer chave service_role)');
      console.log('   Isso é normal ao usar a chave anon_key');
    } else {
      console.log(`📊 Total de usuários no Auth: ${users.length}`);
      users.forEach((user, index) => {
        console.log(`🔑 Usuário ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
        console.log(`   Criado em: ${user.created_at}`);
        
        // Verificar se tem profile correspondente
        const hasProfile = profilesById[user.id];
        if (hasProfile) {
          console.log(`   ✅ Profile encontrado`);
        } else {
          console.log(`   ❌ Profile NÃO encontrado`);
        }
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
  }
}

// Executar verificação
checkProfilesDetailed().catch(console.error);