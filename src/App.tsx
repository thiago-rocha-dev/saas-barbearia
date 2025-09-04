import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import { ToastContainer } from './components/ui/Toast'
import { AuthProvider } from './hooks/useAuth'
import { AdminRoute, BarberRoute, CustomerRoute, PublicRoute } from './components/ProtectedRoute'
import ComponentTest from './pages/ComponentTest'
import Login from './pages/auth/Login'
import AdminLayout from './pages/admin/layout'
import DashboardAdmin from './pages/admin/index'
import BarberLayout from './pages/barber/layout'
import DashboardBarber from './pages/barber/index'
import CustomerLayout from './pages/customer/layout'
import DashboardCustomer from './pages/customer/index'
import './App.css'

function App() {
  useEffect(() => {
    // Teste de conexão com Supabase
    const testConnection = async () => {
      try {
        const { error } = await supabase
          .from('barbershops')
          .select('count')
          .limit(1)
        
        if (error) {
          console.log('Supabase conectado! (Erro esperado - tabelas ainda não criadas)');
        }
      } catch (err) {
        console.error('Erro de conexão:', err);
      }
    }
    
    testConnection();
  }, [])

  return (
    <AuthProvider>
      <Routes>
        {/* Rota padrão redireciona baseado no papel do usuário */}
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        
        {/* Rotas públicas */}
        <Route path="/auth/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        {/* Rota de teste de componentes (desenvolvimento) */}
        <Route path="/test" element={<ComponentTest />} />
        
        {/* Rotas protegidas - Admin */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminLayout>
              <DashboardAdmin />
            </AdminLayout>
          </AdminRoute>
        } />
        
        {/* Rotas protegidas - Barbeiro */}
        <Route path="/barber" element={
          <BarberRoute>
            <BarberLayout>
              <DashboardBarber />
            </BarberLayout>
          </BarberRoute>
        } />
        
        {/* Rotas protegidas - Cliente */}
        <Route path="/customer" element={
          <CustomerRoute>
            <CustomerLayout>
              <DashboardCustomer />
            </CustomerLayout>
          </CustomerRoute>
        } />
        
        {/* Rota 404 - redireciona para login */}
        <Route path="*" element={<Navigate to="/auth/login" replace />} />
      </Routes>
      
      {/* Toast Container */}
      <ToastContainer />
    </AuthProvider>
  )
}

export default App
