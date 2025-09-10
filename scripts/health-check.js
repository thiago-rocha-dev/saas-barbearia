/**
 * BARBERPRO - Health Check & Pre-Seed Validation Script
 * 
 * Verifica se todas as tabelas e dados essenciais existem no banco.
 * Se algo estiver faltando, pode corrigir automaticamente.
 * Integrado com auto-migrate para setup completo.
 * 
 * Uso: node scripts/health-check.js [--fix] [--pre-seed]
 * --fix: Corrige automaticamente problemas encontrados
 * --pre-seed: Executa validação completa antes do seed
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runAutoSetupComplete } from './auto-migrate.js';
import dotenv from 'dotenv';
dotenv.config();

// Para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Constantes
const DEFAULT_BARBERSHOP_ID = '550e8400-e29b-41d4-a716-446655440000';
const REQUIRED_TABLES = [
    'barbershops',
    'profiles', 
    'barbers',
    'services',
    'appointments',
    'working_hours'
];

/**
 * Verifica se uma tabela existe no banco
 */
async function checkTableExists(tableName) {
    try {
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);
            
        return !error;
    } catch (error) {
        return false;
    }
}

/**
 * Verifica se a barbearia padrão existe
 */
async function checkDefaultBarbershop() {
    try {
        const { data, error } = await supabase
            .from('barbershops')
            .select('id')
            .eq('id', DEFAULT_BARBERSHOP_ID)
            .single();
            
        return !error && data;
    } catch (error) {
        return false;
    }
}

/**
 * Verifica se existem serviços padrão
 */
async function checkDefaultServices() {
    try {
        const { data, error } = await supabase
            .from('services')
            .select('id')
            .eq('barbershop_id', DEFAULT_BARBERSHOP_ID);
            
        return !error && data && data.length >= 3;
    } catch (error) {
        return false;
    }
}

/**
 * Executa o arquivo auto-setup-complete.sql
 */
async function runAutoSetup() {
    try {
        console.log('🔧 Executando auto-setup-complete.sql...');
        
        const sqlPath = path.join(__dirname, '..', 'auto-setup-complete.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error('Arquivo auto-setup-complete.sql não encontrado');
        }
        
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Dividir o SQL em comandos individuais (separados por ;)
        const commands = sqlContent
            .split(';')
            .map(cmd => cmd.trim())
            .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
            
        console.log(`   📝 Executando ${commands.length} comandos SQL...`);
        
        for (const command of commands) {
            if (command.trim()) {
                try {
                    await supabase.rpc('exec_sql', { sql_query: command });
                } catch (error) {
                    // Ignorar erros de "já existe" ou similares
                    if (!error.message.includes('already exists') && 
                        !error.message.includes('duplicate key')) {
                        console.warn(`   ⚠️  Aviso no comando SQL: ${error.message}`);
                    }
                }
            }
        }
        
        console.log('   ✅ Auto-setup executado com sucesso');
        return true;
        
    } catch (error) {
        console.error('   ❌ Erro ao executar auto-setup:', error.message);
        return false;
    }
}

/**
 * Cria a barbearia padrão se não existir
 */
async function createDefaultBarbershop() {
    try {
        console.log('🏪 Criando barbearia padrão...');
        
        const { error } = await supabase
            .from('barbershops')
            .insert({
                id: DEFAULT_BARBERSHOP_ID,
                name: 'BarberPro - Barbearia Premium',
                address: 'Rua das Flores, 123 - Centro',
                phone: '(11) 99999-9999',
                email: 'contato@barberpro.com'
            });
            
        if (error && !error.message.includes('duplicate key')) {
            throw error;
        }
        
        console.log('   ✅ Barbearia padrão criada');
        return true;
        
    } catch (error) {
        console.error('   ❌ Erro ao criar barbearia:', error.message);
        return false;
    }
}

/**
 * Cria serviços padrão se não existirem
 */
async function createDefaultServices() {
    try {
        console.log('🛠️  Criando serviços padrão...');
        
        const defaultServices = [
            {
                barbershop_id: DEFAULT_BARBERSHOP_ID,
                name: 'Corte Masculino',
                description: 'Corte moderno e estiloso',
                price: 35.00,
                duration_minutes: 30
            },
            {
                barbershop_id: DEFAULT_BARBERSHOP_ID,
                name: 'Barba Completa',
                description: 'Aparar e modelar barba',
                price: 25.00,
                duration_minutes: 20
            },
            {
                barbershop_id: DEFAULT_BARBERSHOP_ID,
                name: 'Corte + Barba',
                description: 'Pacote completo',
                price: 55.00,
                duration_minutes: 45
            }
        ];
        
        for (const service of defaultServices) {
            const { error } = await supabase
                .from('services')
                .insert(service);
                
            if (error && !error.message.includes('duplicate key')) {
                console.warn(`   ⚠️  Aviso ao criar serviço ${service.name}: ${error.message}`);
            }
        }
        
        console.log('   ✅ Serviços padrão criados');
        return true;
        
    } catch (error) {
        console.error('   ❌ Erro ao criar serviços:', error.message);
        return false;
    }
}

/**
 * Validação pré-seed completa
 */
async function validatePreSeed() {
    console.log('🔍 VALIDAÇÃO PRÉ-SEED COMPLETA\n');
    
    try {
        // 1. Verificar saúde do banco
        const issues = await checkDatabaseHealth();
        
        if (issues.length > 0) {
            console.log('⚠️  Problemas encontrados, executando auto-migrate...');
            
            const migrateSuccess = await runAutoSetupComplete(false);
            
            if (!migrateSuccess) {
                throw new Error('Falha na migração automática');
            }
            
            // Verificar novamente após migração
            const remainingIssues = await checkDatabaseHealth();
            
            if (remainingIssues.length > 0) {
                console.log('⚠️  Alguns problemas persistem, tentando correção manual...');
                await fixDatabaseIssues(remainingIssues);
            }
        }
        
        // 2. Verificar dados essenciais específicos para seed
        console.log('\n🔍 Verificando dados essenciais para seed...');
        
        // Verificar se existe pelo menos uma barbearia
        const { data: barbershops } = await supabase
            .from('barbershops')
            .select('id')
            .limit(1);
        
        if (!barbershops || barbershops.length === 0) {
            console.log('   ⚠️  Nenhuma barbearia encontrada, criando barbearia padrão...');
            await createDefaultBarbershop();
        } else {
            console.log('   ✅ Barbearia padrão existe');
        }
        
        // Verificar se existem serviços padrão
        const { data: services } = await supabase
            .from('services')
            .select('id')
            .limit(1);
        
        if (!services || services.length === 0) {
            console.log('   ⚠️  Nenhum serviço encontrado, criando serviços padrão...');
            await createDefaultServices();
        } else {
            console.log('   ✅ Serviços padrão existem');
        }
        
        console.log('\n🎉 VALIDAÇÃO PRÉ-SEED CONCLUÍDA!');
        console.log('✅ Banco pronto para seed de usuários');
        
        return true;
        
    } catch (error) {
        console.error('❌ Erro na validação pré-seed:', error.message);
        return false;
    }
}

/**
 * Verifica a saúde geral do banco
 */
async function checkDatabaseHealth() {
    const issues = [];
    
    // Verificar tabelas essenciais
    for (const table of REQUIRED_TABLES) {
        const exists = await checkTableExists(table);
        if (!exists) {
            issues.push(`Tabela '${table}' não encontrada`);
        }
    }
    
    // Verificar barbearia padrão
    const barbershopExists = await checkDefaultBarbershop();
    if (!barbershopExists) {
        issues.push('Barbearia padrão não encontrada');
    }
    
    // Verificar serviços padrão
    const servicesExist = await checkDefaultServices();
    if (!servicesExist) {
        issues.push('Serviços padrão insuficientes');
    }
    
    return issues;
}

/**
 * Corrige problemas encontrados no banco
 */
async function fixDatabaseIssues(issues) {
    try {
        // Se há tabelas faltando, executar auto-setup
        if (issues.some(issue => issue.includes('Tabela'))) {
            await runAutoSetup();
            
            // Aguardar um pouco para o banco processar
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Criar barbearia padrão se necessário
        if (issues.some(issue => issue.includes('Barbearia padrão'))) {
            await createDefaultBarbershop();
        }
        
        // Criar serviços padrão se necessário
        if (issues.some(issue => issue.includes('Serviços padrão'))) {
            await createDefaultServices();
        }
        
        return true;
        
    } catch (error) {
        console.error('Erro ao corrigir problemas:', error.message);
        return false;
    }
}

/**
 * Executa o health check completo
 */
async function runHealthCheck(autoFix = false) {
    console.log('🏥 BARBERPRO - Health Check do Banco de Dados\n');
    
    let allHealthy = true;
    const issues = [];
    
    // 1. Verificar tabelas essenciais
    console.log('📋 Verificando tabelas essenciais...');
    
    for (const table of REQUIRED_TABLES) {
        const exists = await checkTableExists(table);
        
        if (exists) {
            console.log(`   ✅ Tabela '${table}' existe`);
        } else {
            console.log(`   ❌ Tabela '${table}' não encontrada`);
            allHealthy = false;
            issues.push(`missing_table_${table}`);
        }
    }
    
    // 2. Verificar barbearia padrão
    console.log('\n🏪 Verificando barbearia padrão...');
    const barbershopExists = await checkDefaultBarbershop();
    
    if (barbershopExists) {
        console.log('   ✅ Barbearia padrão existe');
    } else {
        console.log('   ❌ Barbearia padrão não encontrada');
        allHealthy = false;
        issues.push('missing_default_barbershop');
    }
    
    // 3. Verificar serviços padrão
    console.log('\n🛠️  Verificando serviços padrão...');
    const servicesExist = await checkDefaultServices();
    
    if (servicesExist) {
        console.log('   ✅ Serviços padrão existem');
    } else {
        console.log('   ❌ Serviços padrão insuficientes');
        allHealthy = false;
        issues.push('missing_default_services');
    }
    
    // 4. Aplicar correções se solicitado
    if (!allHealthy && autoFix) {
        console.log('\n🔧 Aplicando correções automáticas...');
        
        // Se há tabelas faltando, executar auto-setup
        if (issues.some(issue => issue.startsWith('missing_table'))) {
            await runAutoSetup();
            
            // Aguardar um pouco para o banco processar
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // Criar barbearia padrão se necessário
        if (issues.includes('missing_default_barbershop')) {
            await createDefaultBarbershop();
        }
        
        // Criar serviços padrão se necessário
        if (issues.includes('missing_default_services')) {
            await createDefaultServices();
        }
        
        console.log('\n🔄 Executando nova verificação...');
        return await runHealthCheck(false); // Re-executar sem auto-fix
    }
    
    // 5. Resultado final
    console.log('\n' + '='.repeat(50));
    
    if (allHealthy) {
        console.log('🎉 HEALTH CHECK PASSOU! Banco 100% íntegro');
        console.log('✅ Todas as tabelas e dados essenciais estão presentes');
        console.log('🚀 Sistema pronto para seed e operação');
        return true;
    } else {
        console.log('⚠️  HEALTH CHECK FALHOU! Problemas encontrados:');
        issues.forEach(issue => {
            console.log(`   • ${issue}`);
        });
        console.log('\n💡 Execute com --fix para correção automática:');
        console.log('   node scripts/health-check.js --fix');
        return false;
    }
}

// Execução principal
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
    const autoFix = process.argv.includes('--fix');
    const isPreSeed = process.argv.includes('--pre-seed');
    
    if (isPreSeed) {
        // Modo pré-seed: validação completa
        validatePreSeed()
            .then(success => {
                process.exit(success ? 0 : 1);
            })
            .catch(error => {
                console.error('❌ Erro fatal na validação pré-seed:', error.message);
                process.exit(1);
            });
    } else {
        runHealthCheck(autoFix)
            .then(success => {
                process.exit(success ? 0 : 1);
            })
            .catch(error => {
                console.error('❌ Erro fatal no health check:', error.message);
                process.exit(1);
            });
    }
}

export {
    runHealthCheck,
    checkTableExists,
    checkDefaultBarbershop,
    checkDefaultServices,
    validatePreSeed,
    checkDatabaseHealth,
    fixDatabaseIssues
};