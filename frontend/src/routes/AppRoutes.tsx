// routes/AppRoutes.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
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
import { useAuth } from '@/context/AuthContext';

// Temporary Dashboard Component (we'll build this later)
const DashboardPage = () => {
  const { user, logout } = useAuth();
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name}!</h1>
          <p className="text-neutral-600 mb-4">
            Role: <span className="font-medium">{user?.role}</span>
          </p>
          <p className="text-neutral-600 mb-6">
            Email Verified: <span className="font-medium">{user?.is_verified ? 'Yes' : 'No'}</span>
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.location.href = '/projects'}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Browse Projects
            </button>
            {user?.role === 'client' && (
              <button
                onClick={() => window.location.href = '/my-projects'}
                className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
              >
                My Projects
              </button>
            )}
            {user?.role === 'freelancer' && (
              <button
                onClick={() => window.location.href = '/proposals/my-proposals'}
                className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700"
              >
                My Proposals
              </button>
            )}
            <button
              onClick={() => window.location.href = '/contracts'}
              className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700"
            >
              My Contracts
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
      />
      <Route 
        path="/signup" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Project Routes */}
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <ProjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <CreateProjectPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id"
        element={
          <ProtectedRoute>
            <ProjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-projects"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <MyProjectsPage />
          </ProtectedRoute>
        }
      />

      {/* Proposal Routes */}
      <Route
        path="/proposals/my-proposals"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <MyProposalsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/proposals/:id"
        element={
          <ProtectedRoute>
            <ProposalDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:id/propose"
        element={
          <ProtectedRoute allowedRoles={['freelancer']}>
            <SubmitProposalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/projects/:projectId/proposals"
        element={
          <ProtectedRoute allowedRoles={['client']}>
            <ProjectProposalsPage />
          </ProtectedRoute>
        }
      />

      {/* Contract Routes */}
      <Route
        path="/contracts"
        element={
          <ProtectedRoute>
            <MyContractsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contracts/:id"
        element={
          <ProtectedRoute>
            <ContractDetailPage />
          </ProtectedRoute>
        }
      />

      {/* Redirect root to appropriate page */}
      <Route 
        path="/" 
        element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
      />

      {/* 404 Not Found */}
      <Route path="*" element={<div className="text-center mt-20">404 - Page Not Found</div>} />
    </Routes>
  );
};