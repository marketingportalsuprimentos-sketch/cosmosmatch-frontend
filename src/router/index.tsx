// frontend/src/router/index.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// Páginas
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ForgotPasswordPage from '@/pages/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/ResetPasswordPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import PleaseVerifyPage from '@/pages/PleaseVerifyPage';
import NotFoundPage from '@/pages/NotFoundPage';
import EditProfilePage from '@/pages/EditProfilePage';
import BlockedProfilesPage from '@/pages/BlockedProfilesPage';
import NatalChartPage from '@/pages/NatalChartPage';
import PostPage from '@/pages/PostPage';
import NumerologyReportPage from '@/pages/NumerologyReportPage';

import { FeedPage } from '@/pages/FeedPage';
import { DiscoveryPage } from '@/pages/DiscoveryPage';
import { ChatListPage } from '@/pages/ChatListPage';
import { ChatConversationPage } from '@/pages/ChatConversationPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OnboardingProfilePage } from '@/pages/OnboardingProfilePage';
import { PremiumPage } from '@/pages/PremiumPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminReportsPage } from '@/pages/AdminReportsPage';
import { SearchPage } from '@/pages/SearchPage';
import { SynastryReportPage } from '@/pages/SynastryReportPage';
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';
import { AppLayout } from '@/components/layout/AppLayout';

export const Router = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // 1. Verificação de Email
  const isVerified = 
    (user as any)?.isEmailVerified === true || 
    (user as any)?.emailVerified === true || 
    (user as any)?.email_verified === true ||
    (user as any)?.verified === true;

  // 2. Cálculo do Prazo (3 Dias / 72h)
  let isWithinGracePeriod = false;
  if (user?.createdAt) {
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const diffHours = Math.abs(now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);
    if (diffHours <= 72) {
      isWithinGracePeriod = true;
    }
  }

  // 3. Verificação de Onboarding (Se tem data de nascimento, já fez o setup)
  const hasCompletedOnboarding = !!(user as any)?.profile?.birthDate;

  // --- LÓGICA MESTRA DE REDIRECIONAMENTO ---
  const getRedirectPath = () => {
    // A. BLOQUEIO FATAL: Se não verificou e o prazo ACABOU -> Tela de Bloqueio.
    if (!isVerified && !isWithinGracePeriod) {
      return "/please-verify";
    }

    // B. PRIMEIRO ACESSO (O Pulo do Gato 😺): 
    // Se não verificou E ainda não tem perfil (acabou de registrar) -> Tela de Aviso.
    // Isso garante que após o registro ele veja a tela de email antes do Onboarding.
    if (!isVerified && !hasCompletedOnboarding) {
      return "/please-verify";
    }

    // C. Se já viu a tela de email (clicou em continuar) mas não tem perfil -> Onboarding
    if (!hasCompletedOnboarding) {
      return "/onboarding";
    }

    // D. Tudo certo -> App Liberado
    return "/discovery";
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <HomePage />,
    },
    
    // Rotas Públicas
    { path: '/login', element: !isAuthenticated ? <LoginPage /> : <Navigate to={getRedirectPath()} replace /> },
    { path: '/register', element: !isAuthenticated ? <RegisterPage /> : <Navigate to={getRedirectPath()} replace /> },
    
    { path: '/privacy', element: <PrivacyPage /> },
    { path: '/terms', element: <TermsPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    { path: '/reset-password', element: <ResetPasswordPage /> },
    { path: '/verify-email', element: <VerifyEmailPage /> },
    { path: '/please-verify', element: <PleaseVerifyPage /> },

    // Rotas Protegidas
    {
      path: '/',
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { path: '/feed', element: <FeedPage /> },
            { path: '/discovery', element: <DiscoveryPage /> },
            { path: '/chat', element: <ChatListPage /> },
            { path: '/chat/:conversationId', element: <ChatConversationPage /> },
            { path: '/search', element: <SearchPage /> },
            { path: '/profile', element: <ProfilePage /> },
            { path: '/profile/:userId', element: <ProfilePage /> },
            { path: '/synastry/:userId', element: <SynastryReportPage /> },
            { path: '/numerology-report/:userId', element: <NumerologyReportPage /> },
          ],
        },
        // Telas Cheias
        { path: '/profile/edit', element: <EditProfilePage /> },
        { path: '/profile/blocked', element: <BlockedProfilesPage /> },
        { path: '/onboarding', element: <OnboardingProfilePage /> },
        { path: '/natal-chart', element: <NatalChartPage /> },
        { path: '/premium', element: <PremiumPage /> },
        { path: '/admin', element: <AdminPage /> },
        { path: '/admin/reports', element: <AdminReportsPage /> },
        { path: '/post/:id', element: <PostPage /> },
      ],
    },

    { path: '*', element: <NotFoundPage /> },
  ]);

  return <RouterProvider router={router} />;
};