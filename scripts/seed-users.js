#!/usr/bin/env node

/**
 * BARBERPRO - SEED DE USUÁRIOS AUTOMÁTICO COM VALIDAÇÃO PRÉ-SEED
 * 
 * Este script cria automaticamente os usuários de teste no Supabase Auth
 * usando a API administrativa. Inclui validação automática do banco.
 * 
 * Usuários criados:
 * - admin@barberpro.com / admin123 (Administrador)
 * - barbeiro@barberpro.com / barber123 (Barbeiro)
 * - cliente@barberpro.com / client123 (Cliente)
 * 
 * Os perfis são criados automaticamente via trigger SQL.
 * Executa validação pré-seed para garantir integridade do banco.
 */

import { createClient } from '@supabase/supabase-js';
import { validatePreSeed } from './health-check.js';
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

/**
 * Executa validação pré-seed para garantir integridade do banco
 */
async function runPreSeedValidation() {
    console.log('🔍 EXECUTANDO VALIDAÇÃO PRÉ-SEED...\n');
    
    try {
        const success = await validatePreSeed();
        
        if (!success) {
            throw new Error('Validação pré-seed falhou');
        }
        
        console.log('✅ Validação pré-seed concluída com sucesso\n');
        return true;
        
    } catch (error) {
        console.error('❌ Erro na validação pré-seed:', error.message);
        console.error('💡 Execute manualmente: npm run db:autoup');
        return false;
    }
}

// Cliente administrativo do Supabase
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// ID da barbearia padrão (deve corresponder ao auto-setup-complete.sql)
const DEFAULT_BARBERSHOP_ID = '550e8400-e29b-41d4-a716-446655440000';

// Usuários de teste para criar
const testUsers = [
    {
        email: 'admin@barberpro.com',
        password: 'admin123',
        role: 'admin',
        name: 'Administrador BarberPro',
        barbershop_id: DEFAULT_BARBERSHOP_ID
    },
    {
        email: 'barber@barberpro.com', // Mudando de barbeiro@ para barber@
        password: 'barber123',
        role: 'barber',
        name: 'João Silva - Barbeiro Especialista',
        barbershop_id: DEFAULT_BARBERSHOP_ID,
        specialty: 'Especialista em cortes clássicos e modernos, barbas estilizadas e tratamentos capilares',
        experience_years: 5
    },
    {
        email: 'cliente@barberpro.com',
        password: 'client123',
        role: 'customer',
        name: 'Maria Santos (Cliente)',
        barbershop_id: null
    }
];

/**
 * Função para buscar usuário existente por email
 */
async function findUserByEmail(email) {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        const user = data.users.find(user => user.email === email);
        if (!user) {
            console.log(`   🔍 Usuário ${email} não encontrado na lista de ${data.users.length} usuários`);
        }
        return user;
    } catch (error) {
        console.error(`❌ Erro ao buscar usuário ${email}:`, error.message);
        return null;
    }
}

/**
 * Função para listar todos os usuários (debug)
 */
async function listAllUsers() {
    try {
        const { data, error } = await supabase.auth.admin.listUsers();
        if (error) throw error;
        
        console.log(`\n🔍 Total de usuários no Auth: ${data.users.length}`);
        data.users.forEach(user => {
            console.log(`   • ${user.email} (ID: ${user.id.substring(0, 8)}...)`);
        });
        
        return data.users;
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error.message);
        return [];
    }
}

/**
 * Função para criar perfil na tabela profiles
 */
async function createProfile(userId, userData) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .insert({
                id: userId,
                email: userData.email,
                full_name: userData.name,
                role: userData.role,
                barbershop_id: userData.barbershop_id
            })
            .select()
            .single();
            
        if (error) {
            if (error.code === '23505') { // Duplicate key
                console.log(`⚠️  Perfil para ${userData.email} já existe`);
                return { success: true, existed: true };
            }
            throw error;
        }
        
        console.log(`✅ Perfil criado: ${userData.email} (Role: ${userData.role})`);
        return { success: true, profile: data, existed: false };
        
    } catch (error) {
        console.error(`❌ Erro ao criar perfil ${userData.email}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Função para criar registro de barbeiro (se necessário)
 */
async function createBarberRecord(profileId, barbershopId, userData) {
    try {
        // Verificar se já existe
        const { data: existing } = await supabase
            .from('barbers')
            .select('id, specialty, experience_years')
            .eq('profile_id', profileId)
            .single();
            
        if (existing) {
            console.log(`⚠️  Registro de barbeiro já existe para o perfil`);
            
            // Atualizar dados se necessário
            if (userData.specialty || userData.experience_years) {
                const updateData = {};
                if (userData.specialty) updateData.specialty = userData.specialty;
                if (userData.experience_years) updateData.experience_years = userData.experience_years;
                
                const { error: updateError } = await supabase
                    .from('barbers')
                    .update(updateData)
                    .eq('profile_id', profileId);
                    
                if (!updateError) {
                    console.log(`✅ Dados do barbeiro atualizados`);
                }
            }
            
            return { success: true, existed: true };
        }
        
        const insertData = {
            profile_id: profileId,
            barbershop_id: barbershopId
        };
        
        if (userData.specialty) insertData.specialty = userData.specialty;
        if (userData.experience_years) insertData.experience_years = userData.experience_years;
        
        const { data, error } = await supabase
            .from('barbers')
            .insert(insertData)
            .select()
            .single();
            
        if (error) throw error;
        
        console.log(`✅ Registro de barbeiro criado com dados completos`);
        return { success: true, barber: data, existed: false };
        
    } catch (error) {
        console.error(`❌ Erro ao criar registro de barbeiro:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * Função principal para processar um usuário (idempotente)
 */
async function processUser(userData) {
    try {
        console.log(`\n🔄 Processando usuário: ${userData.email}`);
        
        // 1. Verificar se usuário já existe no Auth
        let user = await findUserByEmail(userData.email);
        let userCreated = false;
        
        if (!user) {
            // Criar usuário no Supabase Auth
            console.log(`   📝 Criando usuário no Auth...`);
            const { data, error } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: {
                    full_name: userData.name,
                    role: userData.role
                }
            });
            
            if (error) {
                // Verificar se é erro de usuário já existente
                if (error.message.includes('already registered') || 
                    error.message.includes('already exists')) {
                    console.log(`   ⚠️  Usuário ${userData.email} já existe (erro Auth), buscando...`);
                    // Tentar buscar novamente
                    user = await findUserByEmail(userData.email);
                    if (!user) {
                        throw new Error(`Usuário existe no Auth mas não foi encontrado: ${error.message}`);
                    }
                } else if (error.message.includes('Database error creating new user')) {
                    console.log(`   ⚠️  Erro de banco ao criar ${userData.email}, tentando novamente...`);
                    // Aguardar um pouco e tentar novamente
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const { data: retryData, error: retryError } = await supabase.auth.admin.createUser({
                        email: userData.email,
                        password: userData.password,
                        email_confirm: true,
                        user_metadata: {
                            full_name: userData.name,
                            role: userData.role
                        }
                    });
                    
                    if (retryError) {
                        console.log(`   ❌ Falha na segunda tentativa: ${retryError.message}`);
                        throw retryError;
                    }
                    
                    user = retryData.user;
                    userCreated = true;
                    console.log(`   ✅ Usuário criado na segunda tentativa (ID: ${user.id})`);
                } else {
                    throw error;
                }
            } else {
                user = data.user;
                userCreated = true;
                console.log(`   ✅ Usuário criado no Auth (ID: ${user.id})`);
            }
        } else {
            console.log(`   ⚠️  Usuário já existe no Auth (ID: ${user.id})`);
        }
        
        // 2. Verificar/criar perfil
        console.log(`   📝 Verificando perfil...`);
        const profileResult = await createProfile(user.id, userData);
        
        // Se o perfil foi criado mas com role errado, corrigir
        if (profileResult.success && !profileResult.existed) {
            console.log(`   ✅ Perfil criado com sucesso`);
        } else if (profileResult.existed) {
            // Verificar se o role está correto
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
                
            if (existingProfile && existingProfile.role !== userData.role) {
                console.log(`   🔄 Corrigindo role do perfil de ${existingProfile.role} para ${userData.role}...`);
                await supabase
                    .from('profiles')
                    .update({ role: userData.role, barbershop_id: userData.barbershop_id })
                    .eq('id', user.id);
                console.log(`   ✅ Role do perfil corrigido`);
            }
        }
        
        // 3. Se for barbeiro, criar registro na tabela barbers
        if (userData.role === 'barber' && userData.barbershop_id) {
            console.log(`   📝 Criando registro de barbeiro...`);
            await createBarberRecord(user.id, userData.barbershop_id, userData);
        }
        
        return {
            success: true,
            userId: user.id,
            userCreated,
            profileCreated: profileResult.success && !profileResult.existed
        };
        
    } catch (error) {
        console.error(`❌ Erro ao processar usuário ${userData.email}:`, error.message);
        console.error(`   Detalhes do erro:`, error);
        return { success: false, error: error.message };
    }
}

/**
 * Função para verificar se os perfis foram criados corretamente
 */
async function verifyProfiles() {
    try {
        console.log('\n🔍 Verificando perfis criados...');
        
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('id, email, role, full_name, barbershop_id')
            .in('email', testUsers.map(u => u.email));
            
        if (error) {
            console.error('❌ Erro ao verificar perfis:', error.message);
            return false;
        }
        
        console.log('\n📋 Perfis encontrados:');
        profiles.forEach(profile => {
            const barbershopInfo = profile.barbershop_id ? ` (Barbearia: ${profile.barbershop_id.substring(0, 8)}...)` : '';
            console.log(`   • ${profile.email} - ${profile.role} - ${profile.full_name}${barbershopInfo}`);
        });
        
        // Verificar barbeiros
        const barberProfiles = profiles.filter(p => p.role === 'barber');
        if (barberProfiles.length > 0) {
            console.log('\n🔍 Verificando registros de barbeiros...');
            
            const { data: barbers, error: barbersError } = await supabase
                .from('barbers')
                .select('profile_id, specialties, rating')
                .in('profile_id', barberProfiles.map(p => p.id));
                
            if (!barbersError && barbers) {
                console.log('📋 Barbeiros encontrados:');
                barbers.forEach(barber => {
                    const profile = barberProfiles.find(p => p.id === barber.profile_id);
                    console.log(`   • ${profile?.email} - Rating: ${barber.rating} - Especialidades: ${barber.specialties?.join(', ')}`);
                });
            }
        }
        
        return profiles.length === testUsers.length;
        
    } catch (error) {
        console.error('❌ Erro na verificação:', error.message);
        return false;
    }
}

/**
 * Função para criar serviços padrão para cada barbeiro
 * TRAE_FIX-services: Garantir que cada barbeiro tenha pelo menos 3 serviços
 */
async function createDefaultServices() {
    try {
        console.log('\n🛠️  Criando serviços padrão para barbeiros...');
        
        // Buscar barbeiros ativos
        const { data: barbers, error: barbersError } = await supabase
            .from('barbers')
            .select('id, profile_id, barbershop_id')
            .eq('is_available', true);
            
        if (barbersError || !barbers?.length) {
            console.log('⚠️  Nenhum barbeiro encontrado para criar serviços');
            return;
        }
        
        // Serviços padrão que cada barbeiro deve ter
        const defaultServices = [
            {
                name: 'Corte',
                description: 'Corte de cabelo masculino clássico ou moderno',
                price: 40.00,
                duration_minutes: 30
            },
            {
                name: 'Barba',
                description: 'Barba estilizada ou tradicional, acabamento com toalha quente',
                price: 30.00,
                duration_minutes: 30
            },
            {
                name: 'Corte + Barba',
                description: 'Combo completo: corte + barba',
                price: 60.00,
                duration_minutes: 60
            }
        ];
        
        let servicesCreated = 0;
        
        for (const barber of barbers) {
            console.log(`   📝 Criando serviços para barbeiro ${barber.id.substring(0, 8)}...`);
            
            // Verificar se já existem serviços para esta barbearia
            const { data: existingServices } = await supabase
                .from('services')
                .select('name')
                .eq('barbershop_id', barber.barbershop_id);
                
            const existingServiceNames = existingServices?.map(s => s.name) || [];
            
            // Criar apenas os serviços que não existem
            for (const service of defaultServices) {
                if (!existingServiceNames.includes(service.name)) {
                    const { error: serviceError } = await supabase
                        .from('services')
                        .insert({
                            barbershop_id: barber.barbershop_id,
                            name: service.name,
                            description: service.description,
                            price: service.price,
                            duration_minutes: service.duration_minutes,
                            is_active: true
                        });
                        
                    if (!serviceError) {
                        servicesCreated++;
                        console.log(`      ✅ Serviço "${service.name}" criado`);
                    } else {
                        console.log(`      ❌ Erro ao criar "${service.name}": ${serviceError.message}`);
                    }
                } else {
                    console.log(`      ⚠️  Serviço "${service.name}" já existe`);
                }
            }
        }
        
        console.log(`✅ ${servicesCreated} serviços padrão criados/verificados`);
        
    } catch (error) {
        console.error('❌ Erro ao criar serviços padrão:', error.message);
    }
}

/**
 * Função para criar horários de trabalho padrão para barbeiros
 */
async function createDefaultWorkingHours() {
    try {
        console.log('\n⏰ Criando horários de trabalho padrão...');
        
        // Buscar todos os barbeiros
        const { data: barbers } = await supabase
            .from('barbers')
            .select('id, profile_id');
            
        if (!barbers?.length) {
            console.log('⚠️  Nenhum barbeiro encontrado');
            return;
        }
        
        // Horários padrão: Segunda a Sexta 8h-18h, Sábado 8h-16h
        const defaultSchedule = [
            { day_of_week: 1, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }, // Segunda
            { day_of_week: 2, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }, // Terça
            { day_of_week: 3, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }, // Quarta
            { day_of_week: 4, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }, // Quinta
            { day_of_week: 5, start_time: '08:00', end_time: '18:00', break_start: '12:00', break_end: '13:00' }, // Sexta
            { day_of_week: 6, start_time: '08:00', end_time: '16:00', break_start: '12:00', break_end: '13:00' }  // Sábado
        ];
        
        let workingHoursCreated = 0;
        
        for (const barber of barbers) {
            console.log(`   📅 Criando horários para barbeiro ${barber.id.substring(0, 8)}...`);
            
            // Verificar se já existem horários para este barbeiro
            const { data: existingHours } = await supabase
                .from('working_hours')
                .select('day_of_week')
                .eq('barber_id', barber.id);
                
            const existingDays = existingHours?.map(h => h.day_of_week) || [];
            
            // Criar horários apenas para os dias que não existem
            for (const schedule of defaultSchedule) {
                if (!existingDays.includes(schedule.day_of_week)) {
                    const { error: hourError } = await supabase
                        .from('working_hours')
                        .insert({
                            barber_id: barber.id,
                            day_of_week: schedule.day_of_week,
                            start_time: schedule.start_time,
                            end_time: schedule.end_time,
                            break_start: schedule.break_start,
                            break_end: schedule.break_end,
                            is_available: true
                        });
                        
                    if (!hourError) {
                        workingHoursCreated++;
                        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                        console.log(`      ✅ ${dayNames[schedule.day_of_week]} ${schedule.start_time}-${schedule.end_time}`);
                    } else {
                        console.log(`      ❌ Erro ao criar horário: ${hourError.message}`);
                    }
                } else {
                    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                    console.log(`      ⚠️  ${dayNames[schedule.day_of_week]} já existe`);
                }
            }
        }
        
        console.log(`✅ ${workingHoursCreated} horários de trabalho criados/verificados`);
        
    } catch (error) {
        console.error('❌ Erro ao criar horários de trabalho:', error.message);
    }
}

/**
 * Função para criar agendamentos de exemplo
 */
async function createSampleAppointments() {
    try {
        console.log('\n🗓️  Criando agendamentos de exemplo...');
        
        // Buscar IDs necessários
        const { data: profiles } = await supabase
            .from('profiles')
            .select('id, email, role');
            
        const { data: services } = await supabase
            .from('services')
            .select('id, name, price')
            .limit(3);
            
        const { data: barbers } = await supabase
            .from('barbers')
            .select('id, profile_id');
            
        const { data: barbershops } = await supabase
            .from('barbershops')
            .select('id')
            .limit(1);
            
        if (!profiles?.length || !services?.length || !barbers?.length || !barbershops?.length) {
            console.log('⚠️  Dados insuficientes para criar agendamentos');
            return;
        }
        
        const customer = profiles.find(p => p.role === 'customer');
        const barber = barbers[0];
        const barbershop = barbershops[0];
        
        if (!customer || !barber) {
            console.log('⚠️  Cliente ou barbeiro não encontrado');
            return;
        }
        
        // Criar agendamentos de exemplo
        const appointments = [
            {
                customer_id: customer.id,
                customer_name: 'Maria Santos',
                customer_email: customer.email,
                barber_id: barber.id,
                service_id: services[0].id,
                barbershop_id: barbershop.id,
                appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // amanhã
                appointment_time: '10:00:00',
                status: 'pending',
                total_price: services[0].price,
                notes: 'Agendamento de teste criado automaticamente'
            },
            {
                customer_id: customer.id,
                customer_name: 'Maria Santos',
                customer_email: customer.email,
                barber_id: barber.id,
                service_id: services[1]?.id || services[0].id,
                barbershop_id: barbershop.id,
                appointment_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // depois de amanhã
                appointment_time: '14:30:00',
                status: 'confirmed',
                total_price: services[1]?.price || services[0].price,
                notes: 'Segundo agendamento de teste'
            }
        ];
        
        const { error } = await supabase
            .from('appointments')
            .insert(appointments);
            
        if (error) {
            console.error('❌ Erro ao criar agendamentos:', error.message);
        } else {
            console.log(`✅ ${appointments.length} agendamentos de exemplo criados`);
        }
        
    } catch (error) {
        console.error('❌ Erro ao criar agendamentos:', error.message);
    }
}

/**
 * Função principal
 */
async function main() {
    console.log('🚀 BARBERPRO - Seed Automático de Usuários e Perfis\n');
    console.log('📋 Processo idempotente: verifica existência antes de criar\n');
    
    // 1. VALIDAÇÃO PRÉ-SEED: Garantir integridade do banco
    const preSeedOk = await runPreSeedValidation();
    if (!preSeedOk) {
        console.error('❌ Falha na validação pré-seed. Abortando seed.');
        process.exit(1);
    }
    
    // Debug: listar usuários existentes
    await listAllUsers();
    
    let usersCreated = 0;
    let profilesCreated = 0;
    let usersExisted = 0;
    let totalProcessed = 0;
    
    // Processar cada usuário
    for (const userData of testUsers) {
        const result = await processUser(userData);
        
        if (result.success) {
            totalProcessed++;
            if (result.userCreated) usersCreated++;
            else usersExisted++;
            if (result.profileCreated) profilesCreated++;
        }
        
        // Pequena pausa entre processamentos
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    console.log(`\n📊 Resumo do Processamento:`);
    console.log(`   • Usuários criados no Auth: ${usersCreated}`);
    console.log(`   • Usuários já existiam: ${usersExisted}`);
    console.log(`   • Perfis criados: ${profilesCreated}`);
    console.log(`   • Total processado: ${totalProcessed}/${testUsers.length}`);
    
    // Verificar estado final
    const profilesOk = await verifyProfiles();
    
    if (profilesOk) {
        console.log('\n✅ Todos os usuários e perfis estão sincronizados!');
        
        // Criar serviços padrão para barbeiros
        await createDefaultServices();
        
        // Criar horários de trabalho padrão
        await createDefaultWorkingHours();
        
        // Criar agendamentos de exemplo
        await createSampleAppointments();
        
        console.log('\n🎉 Seed completo! Sistema pronto para uso:');
        console.log('   • admin@barberpro.com / admin123 (Administrador)');
        console.log('   • barbeiro@barberpro.com / barber123 (Barbeiro)');
        console.log('   • cliente@barberpro.com / client123 (Cliente)');
        console.log('\n🌐 Acesse: http://localhost:5173');
        console.log('\n💡 Este script é idempotente - pode ser executado múltiplas vezes sem problemas!');
        
    } else {
        console.log('\n⚠️  Alguns perfis podem não ter sido sincronizados corretamente.');
        console.log('💡 Execute o script novamente ou verifique os logs acima.');
    }
}

// Executar script
main().catch(error => {
    console.error('❌ Erro fatal:', error.message);
    process.exit(1);
});

export { processUser, findUserByEmail, createProfile, createBarberRecord, verifyProfiles, createDefaultServices, createSampleAppointments };