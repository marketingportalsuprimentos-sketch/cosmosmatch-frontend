// src/router/index.tsx
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';

// --- GRUPO 1: PÁGINAS COM "EXPORT DEFAULT" (Sem chaves) ---
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
// --- CORREÇÃO: Movidos para cá (Default) ---
import NatalChartPage from '@/pages/NatalChartPage';
import PostPage from '@/pages/PostPage';
import NumerologyReportPage from '@/pages/NumerologyReportPage';

// --- GRUPO 2: PÁGINAS COM "EXPORT CONST" (Com chaves { }) ---
import { FeedPage } from '@/pages/FeedPage';
import { DiscoveryPage } from '@/pages/DiscoveryPage';
import { ChatListPage } from '@/pages/ChatListPage';
import { ChatConversationPage } from '@/pages/ChatConversationPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { OnboardingProfilePage } from '@/pages/OnboardingProfilePage';
import { PremiumPage } from '@/pages/PremiumPage';
import { AdminPage } from '@/pages/AdminPage';
import { SearchPage } from '@/pages/SearchPage';
import { SynastryReportPage } from '@/pages/SynastryReportPage';

// --- PÁGINAS NOVAS (Com chaves) ---
import { PrivacyPage } from '@/pages/PrivacyPage';
import { TermsPage } from '@/pages/TermsPage';

// Layout
import { AppLayout } from '@/components/layout/AppLayout';

export const Router = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;

  // Lógica de Validação de Email
  const isVerified = 
    (user as any)?.isEmailVerified === true || 
    (user as any)?.emailVerified === true || 
    (user as any)?.email_verified === true ||
    (user as any)?.verified === true;

  // Lógica de 36 Horas
  let isWithinGracePeriod = false;
  if (user?.createdAt) {
    const createdDate = new Date(user.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    if (diffHours <= 36) {
      isWithinGracePeriod = true;
    }
  }

  const getRedirectPath = () => {
    if (isVerified || isWithinGracePeriod) {
      return "/discovery";
    }
    return "/please-verify";
  };

  const router = createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to={getRedirectPath()} replace /> : <HomePage />,
    },
    
    // Rotas Públicas
    { path: '/privacy', element: <PrivacyPage /> },
    { path: '/terms', element: <TermsPage /> },

    // Auth
    {
      path: '/login',
      element: !isAuthenticated ? <LoginPage /> : <Navigate to={getRedirectPath()} replace />,
    },
    {
      path: '/register',
      element: !isAuthenticated ? <RegisterPage /> : <Navigate to={getRedirectPath()} replace />,
    },
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
        { path: '/post/:id', element: <PostPage /> },
      ],
    },

    { path: '*', element: <NotFoundPage /> },
  ]);

  return <RouterProvider router={router} />;
};