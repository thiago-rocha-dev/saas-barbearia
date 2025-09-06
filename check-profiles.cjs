require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? 'OK' : 'MISSING');
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? 'OK' : 'MISSING');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
  try {
    console.log('🔍 Verificando profiles existentes...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('❌ Erro ao buscar profiles:', error);
      return;
    }
    
    console.log(`\n📊 Total de profiles encontrados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('\n📋 Lista de profiles:');
      data.forEach((profile, index) => {
        console.log(`${index + 1}. ID: ${profile.id}`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Nome: ${profile.full_name || 'Não informado'}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Ativo: ${profile.is_active ? 'Sim' : 'Não'}`);
        console.log(`   Criado: ${new Date(profile.created_at).toLocaleString('pt-BR')}`);
        console.log('---');
      });
    } else {
      console.log('\n⚠️ Nenhum profile encontrado na tabela profiles!');
      console.log('\n💡 Isso explica o erro "Perfil não encontrado".');
      console.log('\n🔧 Soluções possíveis:');
      console.log('1. Executar o script de seed para criar usuários de teste');
      console.log('2. Criar profiles manualmente no Supabase');
      console.log('3. Verificar se o trigger de criação automática está funcionando');
    }
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

checkProfiles();