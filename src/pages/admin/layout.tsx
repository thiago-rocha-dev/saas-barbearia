import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';
import Header from '../../components/dashboard/Header';
import { useAuth } from '../../hooks/useAuth';

interface AdminLayoutProps {
  children?: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] pointer-events-none" />
      <div className="fixed inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
      
      {/* Layout Container */}
      <div className="relative flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar role="admin" />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <Header 
            title="Dashboard Administrativo"
            subtitle="Gerencie sua barbearia com controle total"
            role="admin"
          />
          
          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="max-w-7xl mx-auto">
              {children || <Outlet />}
            </div>
          </main>
        </div>
      </div>
      
      {/* Glassmorphism Overlay Effects */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        {/* Top gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/20 to-transparent" />
        
        {/* Corner glows */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl" />
      </div>
    </div>
  );
};

export default AdminLayout;