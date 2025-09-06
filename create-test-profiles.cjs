require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { randomUUID } = require('crypto');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Profiles de teste para criar
const testProfiles = [
  {
    id: randomUUID(),
    email: 'admin@barberpro.com',
    full_name: 'Administrador BarberPro',
    role: 'admin',
    is_active: true
  },
  {
    id: randomUUID(),
    email: 'barbeiro@barberpro.com', 
    full_name: 'João Silva (Barbeiro)',
    role: 'barber',
    is_active: true
  },
  {
    id: randomUUID(),
    email: 'cliente@barberpro.com',
    full_name: 'Maria Santos (Cliente)',
    role: 'customer',
    is_active: true
  }
];

async function createTestProfiles() {
  try {
    console.log('🔧 Criando profiles de teste...');
    
    // Primeiro, verificar se já existem barbearias
    const { data: barbershops } = await supabase
      .from('barbershops')
      .select('id')
      .limit(1);
    
    const barbershopId = barbershops?.[0]?.id || null;
    
    if (!barbershopId) {
      console.log('⚠️ Nenhuma barbearia encontrada. Criando uma barbearia de teste...');
      
      const { data: newBarbershop, error: barbershopError } = await supabase
        .from('barbershops')
        .insert({
          name: 'BarberPro - Unidade Teste',
          address: 'Rua Teste, 123',
          phone: '(11) 99999-9999',
          email: 'contato@barberpro.com',
          is_active: true
        })
        .select('id')
        .single();
      
      if (barbershopError) {
        console.error('❌ Erro ao criar barbearia:', barbershopError);
        return;
      }
      
      console.log('✅ Barbearia criada:', newBarbershop.id);
    }
    
    // Criar profiles
    for (const profile of testProfiles) {
      console.log(`\n📝 Criando profile: ${profile.email}`);
      
      const profileData = {
        ...profile,
        barbershop_id: profile.role === 'barber' ? (barbershopId || null) : null
      };
      
      const { data, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Erro ao criar profile ${profile.email}:`, error);
      } else {
        console.log(`✅ Profile criado: ${data.email} (${data.role})`);
        
        // Se for barbeiro, criar registro na tabela barbers
        if (profile.role === 'barber') {
          const { error: barberError } = await supabase
            .from('barbers')
            .insert({
              profile_id: data.id,
              barbershop_id: barbershopId,
              specialties: ['Corte Masculino', 'Barba', 'Bigode'],
              bio: 'Barbeiro experiente com mais de 5 anos de experiência.',
              rating: 4.8,
              total_reviews: 127
            });
          
          if (barberError) {
            console.error('❌ Erro ao criar registro de barbeiro:', barberError);
          } else {
            console.log('✅ Registro de barbeiro criado');
          }
        }
      }
    }
    
    console.log('\n🎉 Profiles de teste criados com sucesso!');
    console.log('\n📋 Credenciais para teste:');
    testProfiles.forEach(profile => {
      console.log(`- ${profile.role.toUpperCase()}: ${profile.email} / senha123`);
    });
    
    console.log('\n⚠️ IMPORTANTE: Estes profiles foram criados apenas na tabela profiles.');
    console.log('Para fazer login, você precisará criar os usuários correspondentes no Supabase Auth.');
    console.log('Ou use o painel do Supabase para criar usuários com estes emails.');
    
  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

createTestProfiles();