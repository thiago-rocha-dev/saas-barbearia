/**
 * BARBERPRO - Auto Migration Runner
 * 
 * Script que executa automaticamente o auto-setup-complete.sql
 * quando tabelas ou dados essenciais estão ausentes.
 * 
 * Uso: node scripts/auto-migrate.js [--force]
 * --force: Força a execução mesmo se as tabelas já existirem
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
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

/**
 * Executa um comando SQL diretamente
 */
async function executeSqlCommand(command) {
    try {
        // Para comandos DDL, usamos uma abordagem diferente
        if (command.trim().toUpperCase().startsWith('CREATE TABLE')) {
            // Extrair nome da tabela do comando CREATE TABLE
            const tableMatch = command.match(/CREATE TABLE (?:IF NOT EXISTS )?(?:public\.)([\w_]+)/i);
            if (tableMatch) {
                const tableName = tableMatch[1];
                // Verificar se a tabela já existe
                const { data: existingTable } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);
                    
                if (existingTable !== null) {
                    return { success: true, data: null, skipped: true, reason: 'Tabela já existe' };
                }
            }
        }
        
        // Para outros comandos, tentar executar via RPC personalizada
        const { data, error } = await supabase.rpc('exec_sql', {
            sql_query: command
        });
        
        if (error) {
            // Se a função exec_sql não existe, retornar erro específico
            if (error.code === 'PGRST202') {
                throw new Error('Função exec_sql não encontrada. Execute o SQL manualmente no Supabase Dashboard.');
            }
            throw new Error(error.message);
        }
        
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Executa o arquivo auto-setup-complete.sql linha por linha
 */
async function runAutoSetupComplete(force = false) {
    try {
        console.log('🚀 BARBERPRO - Auto Migration Runner\n');
        
        const sqlPath = path.join(__dirname, '..', 'auto-setup-complete.sql');
        
        if (!fs.existsSync(sqlPath)) {
            throw new Error('❌ Arquivo auto-setup-complete.sql não encontrado');
        }
        
        console.log('📄 Lendo auto-setup-complete.sql...');
        const sqlContent = fs.readFileSync(sqlPath, 'utf8');
        
        // Processar o SQL removendo comentários e dividindo em comandos
        const lines = sqlContent.split('\n');
        const commands = [];
        let currentCommand = '';
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            // Pular linhas vazias e comentários
            if (!trimmedLine || trimmedLine.startsWith('--')) {
                continue;
            }
            
            currentCommand += line + '\n';
            
            // Se a linha termina com ';', é o fim de um comando
            if (trimmedLine.endsWith(';')) {
                commands.push(currentCommand.trim());
                currentCommand = '';
            }
        }
        
        // Adicionar último comando se não terminar com ;
        if (currentCommand.trim()) {
            commands.push(currentCommand.trim());
        }
        
        console.log(`📝 Encontrados ${commands.length} comandos SQL para executar\n`);
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const commandPreview = command.substring(0, 50).replace(/\n/g, ' ') + '...';
            
            console.log(`[${i + 1}/${commands.length}] ${commandPreview}`);
            
            try {
                // Tentar executar o comando diretamente via query SQL
                const { data, error } = await supabase.rpc('exec_sql', {
                    sql_query: command
                });
                
                if (error) {
                    // Verificar se é um erro "já existe" que podemos ignorar
                    if (error.message.includes('already exists') ||
                        error.message.includes('duplicate key') ||
                        error.message.includes('relation') && error.message.includes('already exists')) {
                        console.log(`   ⚠️  Já existe - pulando`);
                        skipCount++;
                    } else {
                        console.log(`   ❌ Erro: ${error.message}`);
                        errorCount++;
                        
                        if (!force) {
                            console.log('\n💡 Use --force para continuar mesmo com erros');
                            break;
                        }
                    }
                } else {
                    console.log(`   ✅ Executado com sucesso`);
                    successCount++;
                }
                
            } catch (error) {
                console.log(`   ❌ Erro de execução: ${error.message}`);
                errorCount++;
                
                if (!force) {
                    console.log('\n💡 Use --force para continuar mesmo com erros');
                    break;
                }
            }
            
            // Pequena pausa entre comandos para não sobrecarregar o banco
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        console.log('\n' + '='.repeat(50));
        console.log('📊 RESUMO DA MIGRAÇÃO:');
        console.log(`   ✅ Sucessos: ${successCount}`);
        console.log(`   ⚠️  Pulados: ${skipCount}`);
        console.log(`   ❌ Erros: ${errorCount}`);
        console.log(`   📝 Total: ${commands.length}`);
        
        if (errorCount === 0) {
            console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
            console.log('✅ Banco de dados configurado e pronto para uso');
            return true;
        } else {
            console.log('\n⚠️  MIGRAÇÃO CONCLUÍDA COM AVISOS');
            console.log('💡 Alguns comandos falharam, mas o banco pode estar funcional');
            return errorCount < commands.length / 2; // Sucesso se menos de 50% falharam
        }
        
    } catch (error) {
        console.error('❌ Erro fatal na migração:', error.message);
        return false;
    }
}

/**
 * Cria a função exec_sql no Supabase se não existir
 */
async function ensureExecSqlFunction() {
    try {
        console.log('🔧 Verificando função exec_sql...');
        
        // Tentar criar a função exec_sql
        const createFunctionSql = `
            CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
            RETURNS void AS $$
            BEGIN
                EXECUTE sql_query;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
        `;
        
        const { error } = await supabase.rpc('exec_sql', {
            sql_query: createFunctionSql
        });
        
        if (error) {
            console.log('   ⚠️  Função exec_sql pode não existir, tentando criar...');
            
            // Se falhar, tentar uma abordagem alternativa
            const { error: createError } = await supabase.rpc('create_exec_function');
            
            if (createError) {
                console.log('   ❌ Não foi possível criar função exec_sql');
                console.log('   💡 Execute manualmente no SQL Editor do Supabase:');
                console.log('   ' + createFunctionSql);
                return false;
            }
        }
        
        console.log('   ✅ Função exec_sql disponível');
        return true;
        
    } catch (error) {
        console.log('   ⚠️  Aviso: Não foi possível verificar função exec_sql');
        return true; // Continuar mesmo assim
    }
}

/**
 * Execução principal
 */
async function main() {
    const force = process.argv.includes('--force');
    
    try {
        // Verificar função exec_sql
        await ensureExecSqlFunction();
        
        // Executar migração
        const success = await runAutoSetupComplete(force);
        
        if (success) {
            console.log('\n🚀 Próximos passos:');
            console.log('   1. Execute: npm run seed:users');
            console.log('   2. Acesse: http://localhost:5173');
            console.log('   3. Teste os logins: admin@barberpro.com / admin123');
        }
        
        process.exit(success ? 0 : 1);
        
    } catch (error) {
        console.error('❌ Erro fatal:', error.message);
        process.exit(1);
    }
}

// Execução principal
if (import.meta.url.startsWith('file:') && process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
    main();
}

export {
    runAutoSetupComplete,
    executeSqlCommand,
    ensureExecSqlFunction
};