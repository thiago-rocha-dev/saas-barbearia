#!/usr/bin/env node

/**
 * BARBERPRO - VALIDAÇÃO DO SETUP
 * 
 * Este script valida se o sistema está configurado corretamente
 * e se todos os componentes estão funcionando.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Supabase (apenas chave pública)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Erro: Variáveis de ambiente básicas não configuradas!');
    console.error('Certifique-se de que VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY estão definidas no .env');
    process.exit(1);
}

// Cliente público do Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função para testar conexão com o banco
 */
async function testConnection() {
    try {
        console.log('🔄 Testando conexão com Supabase...');
        
        const { data, error } = await supabase
            .from('barbershops')
            .select('id, name')
            .limit(1);
            
        if (error) {
            console.error('❌ Erro na conexão:', error.message);
            return false;
        }
        
        console.log('✅ Conexão com Supabase OK');
        if (data && data.length > 0) {
            console.log(`   • Barbearia encontrada: ${data[0].name}`);
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na conexão:', error.message);
        return false;
    }
}

/**
 * Função para verificar tabelas
 */
async function checkTables() {
    console.log('\n🔍 Verificando estrutura do banco...');
    
    const tables = [
        { name: 'barbershops', description: 'Barbearias' },
        { name: 'services', description: 'Serviços' },
        { name: 'profiles', description: 'Perfis de usuário' },
        { name: 'barbers', description: 'Barbeiros' },
        { name: 'appointments', description: 'Agendamentos' }
    ];
    
    let allTablesOk = true;
    
    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table.name)
                .select('*')
                .limit(1);
                
            if (error) {
                console.log(`❌ Tabela ${table.name} (${table.description}): ${error.message}`);
                allTablesOk = false;
            } else {
                console.log(`✅ Tabela ${table.name} (${table.description}): OK`);
            }
            
        } catch (error) {
            console.log(`❌ Tabela ${table.name}: ${error.message}`);
            allTablesOk = false;
        }
    }
    
    return allTablesOk;
}

/**
 * Função para verificar dados de seed
 */
async function checkSeedData() {
    console.log('\n📊 Verificando dados de seed...');
    
    try {
        // Verificar barbearias
        const { data: barbershops } = await supabase
            .from('barbershops')
            .select('id, name');
            
        // Verificar serviços
        const { data: services } = await supabase
            .from('services')
            .select('id, name, price');
            
        console.log(`📋 Dados encontrados:`);
        console.log(`   • Barbearias: ${barbershops?.length || 0}`);
        console.log(`   • Serviços: ${services?.length || 0}`);
        
        if (barbershops?.length > 0) {
            console.log(`   • Barbearia principal: ${barbershops[0].name}`);
        }
        
        if (services?.length > 0) {
            console.log(`   • Exemplo de serviço: ${services[0].name} - R$ ${services[0].price}`);
        }
        
        return (barbershops?.length || 0) > 0 && (services?.length || 0) > 0;
        
    } catch (error) {
        console.error('❌ Erro ao verificar dados:', error.message);
        return false;
    }
}

/**
 * Função para verificar usuários de teste
 */
async function checkTestUsers() {
    console.log('\n👥 Verificando usuários de teste...');
    
    try {
        const { data: profiles } = await supabase
            .from('profiles')
            .select('email, role, full_name')
            .in('email', ['admin@barberpro.com', 'barbeiro@barberpro.com', 'cliente@barberpro.com']);
            
        console.log(`📋 Usuários de teste encontrados: ${profiles?.length || 0}/3`);
        
        if (profiles && profiles.length > 0) {
            profiles.forEach(profile => {
                console.log(`   • ${profile.email} - ${profile.role} - ${profile.full_name}`);
            });
        } else {
            console.log('⚠️  Nenhum usuário de teste encontrado');
            console.log('   Execute: npm run seed:users (após configurar SERVICE_ROLE_KEY)');
        }
        
        return (profiles?.length || 0) === 3;
        
    } catch (error) {
        console.error('❌ Erro ao verificar usuários:', error.message);
        return false;
    }
}

/**
 * Função para verificar configuração do ambiente
 */
function checkEnvironment() {
    console.log('🔧 Verificando configuração do ambiente...');
    
    const requiredVars = {
        'VITE_SUPABASE_URL': process.env.VITE_SUPABASE_URL,
        'VITE_SUPABASE_ANON_KEY': process.env.VITE_SUPABASE_ANON_KEY,
        'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
    };
    
    let allConfigured = true;
    
    Object.entries(requiredVars).forEach(([key, value]) => {
        if (value) {
            console.log(`✅ ${key}: Configurado`);
        } else {
            console.log(`❌ ${key}: Não configurado`);
            if (key === 'SUPABASE_SERVICE_ROLE_KEY') {
                console.log('   (Necessário apenas para scripts de seed/reset)');
            } else {
                allConfigured = false;
            }
        }
    });
    
    return allConfigured;
}

/**
 * Função principal
 */
async function main() {
    console.log('🚀 BARBERPRO - Validação do Setup\n');
    
    // Verificar ambiente
    const envOk = checkEnvironment();
    
    if (!envOk) {
        console.log('\n❌ Configuração do ambiente incompleta!');
        console.log('Verifique o arquivo .env e configure as variáveis necessárias.');
        return;
    }
    
    // Testar conexão
    const connectionOk = await testConnection();
    
    if (!connectionOk) {
        console.log('\n❌ Não foi possível conectar ao Supabase!');
        console.log('Verifique as credenciais no arquivo .env');
        return;
    }
    
    // Verificar tabelas
    const tablesOk = await checkTables();
    
    // Verificar dados de seed
    const seedDataOk = await checkSeedData();
    
    // Verificar usuários de teste
    const usersOk = await checkTestUsers();
    
    // Resumo final
    console.log('\n📊 RESUMO DA VALIDAÇÃO:');
    console.log(`   • Ambiente: ${envOk ? '✅' : '❌'}`);
    console.log(`   • Conexão: ${connectionOk ? '✅' : '❌'}`);
    console.log(`   • Tabelas: ${tablesOk ? '✅' : '❌'}`);
    console.log(`   • Dados básicos: ${seedDataOk ? '✅' : '❌'}`);
    console.log(`   • Usuários de teste: ${usersOk ? '✅' : '❌'}`);
    
    if (connectionOk && tablesOk && seedDataOk) {
        if (usersOk) {
            console.log('\n🎉 Sistema totalmente configurado e pronto para uso!');
            console.log('\n🌐 Acesse: http://localhost:5173');
            console.log('\n🔑 Credenciais de teste:');
            console.log('   • admin@barberpro.com / admin123');
            console.log('   • barbeiro@barberpro.com / barber123');
            console.log('   • cliente@barberpro.com / client123');
        } else {
            console.log('\n⚠️  Sistema configurado, mas usuários de teste não encontrados.');
            console.log('\n🔧 Para criar usuários de teste:');
            console.log('   1. Configure SUPABASE_SERVICE_ROLE_KEY no .env');
            console.log('   2. Execute: npm run seed:users');
        }
    } else {
        console.log('\n❌ Sistema não está totalmente configurado.');
        console.log('\n🔧 Próximos passos:');
        if (!tablesOk || !seedDataOk) {
            console.log('   1. Execute auto-setup-complete.sql no Supabase SQL Editor');
        }
        if (!usersOk) {
            console.log('   2. Configure SERVICE_ROLE_KEY e execute: npm run seed:users');
        }
    }
}

// Executar validação
main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
});

export { testConnection, checkTables, checkSeedData, checkTestUsers };