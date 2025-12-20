// routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { HomePage } from '@/pages/HomePage';
import { ProjectsPage } from '@/pages/projects/ProjectsPage';
import { ProjectDetailPage } from '@/pages/projects/ProjectDetailPage';
import { CreateProjectPage } from '@/pages/projects/CreateProjectPage';
import { MyProjectsPage } from '@/pages/projects/MyProjectsPage';
import { MyProposalsPage } from '@/pages/proposals/MyProposalsPage';
import { ProposalDetailPage } from '@/pages/proposals/ProposalDetailPage';
import { SubmitProposalPage } from '@/pages/proposals/SubmitProposalPage';
import { ProjectProposalsPage } from '@/pages/proposals/ProjectProposalsPage';
import { MyContractsPage } from '@/pages/contracts/MyContractsPage';
import { ContractDetailPage } from '@/pages/contracts/ContractDetailPage';
import { ClientDashboard } from '@/pages/dashboard/ClientDashboard';
import { FreelancerDashboard } from '@/pages/dashboard/FreelancerDashboard';
import { MessagesPage } from '@/pages/messages/MessagesPage';
import { ConversationPage } from '@/pages/messages/ConversationPage';
import { FreelancerProfilePage } from '@/pages/freelancers/FreelancerProfilePage';
import { MyFreelancerProfilePage } from '@/pages/freelancers/MyFreelancerProfilePage';
import { BrowseFreelancersPage } from '@/pages/freelancers/BrowseFreelancersPage';
import { NotificationsPage } from '@/pages/notifications/NotificationsPage';
import { WalletPage } from '@/pages/wallet/WalletPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { PaymentsPage } from '@/pages/payments/PaymentsPage';
import { ReviewsPage } from '@/pages/reviews/ReviewsPage';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminWithdrawalsPage } from '@/pages/admin/AdminWithdrawalsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminDisputesPage } from '@/pages/admin/AdminDisputesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { useAuth } from '@/context/AuthContext';

// Dashboard selector based on user role
const DashboardPage = () => {
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'client') {
    return <ClientDashboard />;
  }

  if (user?.role === 'freelancer') {
    return <FreelancerDashboard />;
  }

  return <ClientDashboard />;
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <PublicLayout>
              <HomePage />
            </PublicLayout>
          )
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />
      <Route
        path="/signup"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />}
      />
      <Route
        path="/verify-email"
        element={<VerifyEmailPage />}
      />
      <Route
        path="/reset-password"
        element={<ResetPasswordPage />}
      />
      <Route
        path="/forgot-password"
        element={<ForgotPasswordPage />}
      />
      <Route
        path="/forgot_password"
        element={<ForgotPasswordPage />}
      />

      {/* Protected Routes with Dashboard Layout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Project Routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout>
              <CreateProjectPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProjectDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-projects"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout>
              <MyProjectsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Proposal Routes */}
      <Route
        path="/proposals/my-proposals"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout>
              <MyProposalsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/proposals/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ProposalDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/propose"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout>
              <SubmitProposalPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/proposals"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout>
              <ProjectProposalsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Contract Routes */}
      <Route
        path="/contracts"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MyContractsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ContractDetailPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Messages Routes */}
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <MessagesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages/:userId"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <ConversationPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Freelancer Routes */}
      <Route
        path="/freelancers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <BrowseFreelancersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/freelancers/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <FreelancerProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout>
              <MyFreelancerProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/me"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout>
              <MyFreelancerProfilePage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <NotificationsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Wallet - Freelancers only */}
      <Route
        path="/wallet"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout>
              <WalletPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Payments (for clients) */}
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <DashboardLayout>
              <PaymentsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Reviews (for freelancers) */}
      <Route
        path="/reviews"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <DashboardLayout>
              <ReviewsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <SettingsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/withdrawals"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminWithdrawalsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminUsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <DashboardLayout>
              <AdminDisputesPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <PublicLayout showFooter={false}>
            <NotFoundPage />
          </PublicLayout>
        }
      />
    </Routes>
  );
};