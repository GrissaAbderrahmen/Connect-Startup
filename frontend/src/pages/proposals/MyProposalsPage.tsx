// pages/proposals/MyProposalsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProposals } from '@/hooks/useProposals';
import { ProposalList } from '@/components/proposals/ProposalList';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';
import { Proposal } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const MyProposalsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const { proposals, isLoading, error, pagination } = useProposals({ page, limit: 10 });

  const handleProposalClick = (proposal: Proposal) => {
    navigate(`/proposals/${proposal.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Only freelancers can access
  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-red-600 mb-4">Only freelancers can view this page</p>
          <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Proposals</h1>
            <p className="text-neutral-600 mt-2">
              View and track your submitted proposals ({pagination.total} total)
            </p>
          </div>
          <Button onClick={() => navigate('/projects')}>
            Browse Projects
          </Button>
        </div>

        {/* Proposals List */}
        <ProposalList
          proposals={proposals}
          isLoading={isLoading}
          error={error}
          onProposalClick={handleProposalClick}
          showProject
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};
