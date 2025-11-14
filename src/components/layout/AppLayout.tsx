// src/components/layout/AppLayout.tsx
// (COLE ISTO NO SEU ARQUIVO)

import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar'; 
// --- INÍCIO DA ADIÇÃO (Toaster) ---
// 1. Importar o componente Toaster da biblioteca sonner
import { Toaster } from 'sonner';
// --- FIM DA ADIÇÃO ---

export function AppLayout() {

  return (
    // --- 'relative z-0' REMOVIDO ---
    <div className="flex h-screen w-full flex-col overflow-hidden bg-gray-950 text-gray-100">
      
      <main className="flex-1 overflow-y-auto"> 
        <div className="h-full">
          <Outlet />
        </div>
      </main>

      {/* --- 'relative z-0' REMOVIDO --- */}
      <div>
        <TabBar />
      </div>

      {/* --- INÍCIO DA ADIÇÃO (Toaster) --- */}
      {/* 2. Adicionar o componente Toaster aqui. */}
      {/* Ele vai apanhar todas as chamadas 'toast()' da aplicação. */}
      {/* Usamos 'richColors' e 'dark' para o tema escuro. */}
      <Toaster richColors theme="dark" position="bottom-center" />
      {/* --- FIM DA ADIÇÃO --- */}
    </div>
  );
}