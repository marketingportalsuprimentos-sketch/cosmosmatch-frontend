// src/router/index.tsx
import { createBrowserRouter } from 'react-router-dom';

// Importar o Layout e a Rota Protegida
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';

// --- INÍCIO DA MODIFICAÇÃO: Importar a nova HomePage ---
import HomePage from '@/pages/HomePage';
// --- FIM DA MODIFICAÇÃO ---

// Importar todas as suas páginas
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import EditProfilePage from '@/pages/EditProfilePage';
import NatalChartPage from '@/pages/NatalChartPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PostPage from '@/pages/PostPage';
import { FeedPage } from '@/pages/FeedPage';
import { DiscoveryPage } from '@/pages/DiscoveryPage';
import { ChatListPage } from '@/pages/ChatListPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OnboardingProfilePage } from '@/pages/OnboardingProfilePage';
import BlockedProfilesPage from '@/pages/BlockedProfilesPage';
import { PremiumPage } from '@/pages/PremiumPage';
import { ChatConversationPage } from '@/pages/ChatConversationPage';
import { AdminPage } from '@/pages/AdminPage';
import { VerifyEmailPage } from '@/pages/VerifyEmailPage';
import { PleaseVerifyPage } from '@/pages/PleaseVerifyPage';
import { SearchPage } from '@/pages/SearchPage';

import { SynastryReportPage } from '@/pages/SynastryReportPage';
import NumerologyReportPage from '@/pages/NumerologyReportPage';

export const router = createBrowserRouter([
  // --- INÍCIO DA MODIFICAÇÃO: Nova Rota Pública (Página de Apresentação) ---
  // Esta é agora a rota principal "/" do seu site.
  {
    path: '/',
    element: <HomePage />,
  },
  // --- FIM DA MODIFICAÇÃO ---

  // --- Rotas Públicas (Sem Layout) ---
  {
    path: '/login',
    element: <LoginPage />,
  },
  // ... (outras rotas públicas iguais) ...
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPasswordPage />,
  },
  {
    path: '/post/:id',
    element: <PostPage />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },

  // --- Rotas Protegidas (Dentro do AppLayout) ---
  // Este bloco continua a proteger todas as rotas filhas
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // ... (rotas do AppLayout iguais) ...

          // --- INÍCIO DA MODIFICAÇÃO: Rota "index" removida ---
          // A rota "index" (que respondia por "/") foi removida
          // porque "/" é agora a HomePage pública.
          // {
          //   index: true,
          //   element: <FeedPage />,
          // },
          // --- FIM DA MODIFICAÇÃO ---
          
          {
            path: '/feed',
            element: <FeedPage />,
          },
          {
            path: '/discovery',
            element: <DiscoveryPage />,
          },
          {
            path: '/chat',
            element: <ChatListPage />,
          },
          {
            path: '/chat/:conversationId',
            element: <ChatConversationPage />,
          },
          {
            path: '/search',
            element: <SearchPage />,
          },
          {
            path: '/profile',
            element: <ProfilePage />,
          },
          {
            path: '/profile/:userId',
            element: <ProfilePage />,
          },
          
          // --- INÍCIO DA ADIÇÃO (Mover Rotas para o Paywall) ---
          // Estas rotas agora estão DENTRO do AppLayout
          // para que o Modal de Paywall possa ser ativado.
          {
            path: '/synastry/:userId',
            element: <SynastryReportPage />,
          },
          {
            path: '/numerology-report/:userId',
            element: <NumerologyReportPage />,
          },
          // --- FIM DA ADIÇÃO ---
        ],
      },
      // --- Rotas Protegidas (Sem AppLayout) ---
      {
        path: '/profile/edit',
        element: <EditProfilePage />,
      },
      {
        path: '/profile/blocked',
        element: <BlockedProfilesPage />,
      },
      {
        path: '/onboarding',
        element: <OnboardingProfilePage />,
      },
      {
        path: '/natal-chart',
        element: <NatalChartPage />,
      },
      
      // --- INÍCIO DA REMOÇÃO (Rotas Movidas) ---
      // As rotas de sinastria e numerologia foram REMOVIDAS daqui
      // --- FIM DA REMOÇÃO ---
      
      {
        path: '/premium',
        element: <PremiumPage />,
      },
      {
        path: '/admin',
        element: <AdminPage />,
      },
      {
        path: '/please-verify',
        element: <PleaseVerifyPage />,
      },
    ],
  },

  // --- Página 404 ---
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);