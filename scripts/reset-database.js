#!/usr/bin/env node

/**
 * BARBERPRO - SCRIPT DE RESET COMPLETO
 * 
 * Este script limpa TODOS os dados do banco e usuários do Auth,
 * permitindo recomeçar do zero. Use com cuidado!
 * 
 * Funcionalidades:
 * - Remove todos os usuários do Supabase Auth
 * - Limpa todas as tabelas do banco
 * - Reseta o sistema para estado inicial
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Configuração do Supabase com chave de serviço (administrativa)
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: Variáveis de ambiente não configuradas!');
    console.error('Certifique-se de que VITE_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY estão definidas no .env');
    process.exit(1);
}

// Cliente administrativo do Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Emails dos usuários de teste para remover
const testUserEmails = [
    'admin@barberpro.com',
    'barbeiro@barberpro.com',
    'cliente@barberpro.com'
];

/**
 * Função para confirmar a ação de reset
 */
function confirmReset() {
    const args = process.argv.slice(2);
    
    if (!args.includes('--confirm')) {
        console.log('🚨 ATENÇÃO: Este script irá DELETAR TODOS os dados!');
        console.log('\n📋 O que será removido:');
        console.log('   • Todos os usuários de teste do Auth');
        console.log('   • Todos os agendamentos');
        console.log('   • Todos os perfis de usuário');
        console.log('   • Todos os barbeiros');
        console.log('   • Dados de barbearias e serviços');
        console.log('\n⚠️  Esta ação é IRREVERSÍVEL!');
        console.log('\n🔄 Para confirmar, execute:');
        console.log('   npm run reset:database -- --confirm');
        console.log('   ou');
        console.log('   node scripts/reset-database.js --confirm');
        return false;
    }
    
    return true;
}

/**
 * Função para remover usuários do Auth
 */
async function removeAuthUsers() {
    console.log('🗑️  Removendo usuários do Auth...');
    
    try {
        // Listar todos os usuários
        const { data: users, error: listError } = await supabase.auth.admin.listUsers();
        
        if (listError) {
            console.error('❌ Erro ao listar usuários:', listError.message);
            return false;
        }
        
        // Filtrar usuários de teste
        const testUsers = users.users.filter(user => 
            testUserEmails.includes(user.email)
        );
        
        console.log(`📋 Encontrados ${testUsers.length} usuários de teste para remover`);
        
        // Remover cada usuário
        for (const user of testUsers) {
            console.log(`🔄 Removendo: ${user.email}`);
            
            const { error } = await supabase.auth.admin.deleteUser(user.id);
            
            if (error) {
                console.error(`❌ Erro ao remover ${user.email}:`, error.message);
            } else {
                console.log(`✅ Removido: ${user.email}`);
            }
            
            // Pequena pausa
            await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao remover usuários:', error.message);
        return false;
    }
}

/**
 * Função para limpar tabelas do banco
 */
async function clearDatabase() {
    console.log('\n🗑️  Limpando tabelas do banco...');
    
    const tables = [
        'appointments',
        'barbers', 
        'services',
        'profiles',
        'barbershops'
    ];
    
    try {
        for (const table of tables) {
            console.log(`🔄 Limpando tabela: ${table}`);
            
            const { error } = await supabase
                .from(table)
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletar tudo
                
            if (error) {
                console.error(`❌ Erro ao limpar ${table}:`, error.message);
            } else {
                console.log(`✅ Tabela ${table} limpa`);
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro ao limpar banco:', error.message);
        return false;
    }
}

/**
 * Função para verificar se o reset foi bem-sucedido
 */
async function verifyReset() {
    console.log('\n🔍 Verificando reset...');
    
    try {
        // Verificar usuários Auth
        const { data: users } = await supabase.auth.admin.listUsers();
        const remainingTestUsers = users.users.filter(user => 
            testUserEmails.includes(user.email)
        );
        
        // Verificar tabelas
        const { data: profiles } = await supabase.from('profiles').select('id');
        const { data: appointments } = await supabase.from('appointments').select('id');
        
        console.log('📊 Status após reset:');
        console.log(`   • Usuários de teste restantes: ${remainingTestUsers.length}`);
        console.log(`   • Perfis no banco: ${profiles?.length || 0}`);
        console.log(`   • Agendamentos no banco: ${appointments?.length || 0}`);
        
        const success = remainingTestUsers.length === 0 && 
                       (profiles?.length || 0) === 0 && 
                       (appointments?.length || 0) === 0;
        
        if (success) {
            console.log('\n✅ Reset completo realizado com sucesso!');
            console.log('\n🚀 Próximos passos:');
            console.log('   1. Execute: npm run setup:database');
            console.log('   2. Execute: npm run seed:users');
            console.log('   3. Sistema estará pronto para uso');
        } else {
            console.log('\n⚠️  Reset parcial. Alguns dados podem ter permanecido.');
        }
        
        return success;
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
        return false;
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('🔄 BARBERPRO - Reset Completo do Sistema\n');
    
    // Confirmar ação
    if (!confirmReset()) {
        return;
    }
    
    console.log('\n🚨 Iniciando reset completo...');
    
    // Remover usuários do Auth
    const authSuccess = await removeAuthUsers();
    
    // Limpar banco de dados
    const dbSuccess = await clearDatabase();
    
    // Aguardar processamento
    console.log('\n⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Verificar resultado
    const verifySuccess = await verifyReset();
    
    if (authSuccess && dbSuccess && verifySuccess) {
        console.log('\n🎉 Sistema resetado com sucesso!');
        console.log('Agora você pode executar o setup completo novamente.');
    } else {
        console.log('\n⚠️  Reset incompleto. Verifique os logs acima.');
        process.exit(1);
    }
}

// Executar script
main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
});

export { removeAuthUsers, clearDatabase, verifyReset };