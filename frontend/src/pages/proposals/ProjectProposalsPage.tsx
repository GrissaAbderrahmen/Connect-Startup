// pages/proposals/ProjectProposalsPage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useProjectProposals } from '@/hooks/useProposals';
import { ProposalList } from '@/components/proposals/ProposalList';
import { Button } from '@/components/common/Button';
import { Proposal } from '@/types';

export const ProjectProposalsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { proposals, isLoading, error } = useProjectProposals(Number(projectId));

  const handleProposalClick = (proposal: Proposal) => {
    navigate(`/proposals/${proposal.id}`);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate(`/projects/${projectId}`)}
          className="mb-6"
        >
          ← Back to Project
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Project Proposals</h1>
          <p className="text-neutral-600 mt-2">
            Review and manage proposals for this project ({proposals.length} total)
          </p>
        </div>

        <ProposalList
          proposals={proposals}
          isLoading={isLoading}
          error={error}
          onProposalClick={handleProposalClick}
          showFreelancer
        />
      </div>
    </div>
  );
};