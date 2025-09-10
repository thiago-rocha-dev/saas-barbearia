import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkDatabase() {
    try {
        console.log('🔍 Verificando todas as tabelas...');
        
        // Verificar profiles
        const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
            
        console.log('👥 Profiles:');
        if (profilesError) {
            console.log('   ❌ Erro:', profilesError.message);
        } else {
            console.log(`   ✅ ${profiles?.length || 0} registros`);
            profiles?.forEach(p => console.log(`      • ${p.email} - ${p.role}`));
        }
        
        // Verificar barbershops
        const { data: barbershops, error: barbershopsError } = await supabase
            .from('barbershops')
            .select('*');
            
        console.log('\n🏪 Barbershops:');
        if (barbershopsError) {
            console.log('   ❌ Erro:', barbershopsError.message);
        } else {
            console.log(`   ✅ ${barbershops?.length || 0} registros`);
            barbershops?.forEach(b => console.log(`      • ${b.name}`));
        }
        
        // Verificar barbers
        const { data: barbers, error: barbersError } = await supabase
            .from('barbers')
            .select('*');
            
        console.log('\n💈 Barbers:');
        if (barbersError) {
            console.log('   ❌ Erro:', barbersError.message);
        } else {
            console.log(`   ✅ ${barbers?.length || 0} registros`);
            barbers?.forEach(b => console.log(`      • ID: ${b.id}, Profile: ${b.profile_id}`));
        }
        
        // Verificar services
        const { data: services, error: servicesError } = await supabase
            .from('services')
            .select('*');
            
        console.log('\n🛠️  Services:');
        if (servicesError) {
            console.log('   ❌ Erro:', servicesError.message);
        } else {
            console.log(`   ✅ ${services?.length || 0} registros`);
            services?.forEach(s => console.log(`      • ${s.name} - R$ ${s.price}`));
        }
        
        // Verificar working_hours
        const { data: workingHours, error: workingHoursError } = await supabase
            .from('working_hours')
            .select('*');
            
        console.log('\n⏰ Working Hours:');
        if (workingHoursError) {
            console.log('   ❌ Erro:', workingHoursError.message);
        } else {
            console.log(`   ✅ ${workingHours?.length || 0} registros`);
        }
        
        // Verificar appointments
        const { data: appointments, error: appointmentsError } = await supabase
            .from('appointments')
            .select('*');
            
        console.log('\n📅 Appointments:');
        if (appointmentsError) {
            console.log('   ❌ Erro:', appointmentsError.message);
        } else {
            console.log(`   ✅ ${appointments?.length || 0} registros`);
        }
        
        // Verificar usuários do Auth
        console.log('\n🔐 Verificando Auth Users...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) {
            console.log('   ❌ Erro ao acessar Auth:', authError.message);
        } else {
            console.log(`   ✅ ${authUsers?.users?.length || 0} usuários no Auth`);
            authUsers?.users?.forEach(u => {
                console.log(`      • ${u.email} - ${u.user_metadata?.role || 'sem role'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Erro geral:', error.message);
    }
}

checkDatabase();