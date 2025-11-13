// src/components/layout/AppLayout.tsx

import { Outlet } from 'react-router-dom';
import { TabBar } from './TabBar'; 
// --- TODOS OS IMPORTS DO MODAL FORAM REMOVIDOS ---
// (useState, useEffect, Fragment, Dialog, Transition, SparklesIcon, useNavigate)

export function AppLayout() {
  // --- TODO O CÓDIGO DO MODAL FOI REMOVIDO ---
  // (useState, useNavigate, handleUpgradeClick, handleCloseModal, useEffect)

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

      {/* --- TODO O JSX DO MODAL FOI REMOVIDO --- */}
      {/* (O <Transition appear show={isPaywallOpen} ...> foi apagado) */}
    </div>
  );
}