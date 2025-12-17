// frontend/src/components/layout/AppLayout.tsx

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar';
import { Toaster, toast } from 'sonner'; // Importamos 'toast' também para disparar o alerta
import { useAuth } from '@/contexts/AuthContext';
import { VerificationBanner } from '@/components/auth/VerificationBanner'; // A barra amarela

export function AppLayout() {
  const { socket } = useAuth();

  // --- SISTEMA DE NOTIFICAÇÕES EM TEMPO REAL ---
  useEffect(() => {
    if (!socket) return;

    // Função que toca quando o Backend grita "system_notification"
    const handleNotification = (data: { 
      type: 'success' | 'error' | 'info' | 'warning'; 
      title: string; 
      message: string 
    }) => {
      console.log('🔔 Notificação recebida:', data);
      
      // Dispara o Toast correto baseado no tipo
      if (data.type === 'error') {
        toast.error(data.title, { description: data.message, duration: 6000 });
      } else if (data.type === 'success') {
        toast.success(data.title, { description: data.message, duration: 6000 });
      } else {
        toast.message(data.title, { description: data.message, duration: 6000 });
      }
    };

    // Liga o "ouvido"
    socket.on('system_notification', handleNotification);

    // Desliga quando sair (limpeza)
    return () => {
      socket.off('system_notification', handleNotification);
    };
  }, [socket]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-950 text-gray-100">
      
      {/* 1. Barra de Aviso (Amarela) no topo */}
      <VerificationBanner />

      <main className="flex-1 overflow-y-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>

      <div>
        <TabBar />
      </div>

      {/* Componente que exibe os Toasts na tela */}
      <Toaster richColors theme="dark" position="top-center" />
    </div>
  );
}