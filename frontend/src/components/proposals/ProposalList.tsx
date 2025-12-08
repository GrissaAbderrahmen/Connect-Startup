// components/proposals/ProposalList.tsx
import { Proposal } from '@/types';
import { ProposalCard } from './ProposalCard';
import { Spinner } from '@/components/common/Spinner';

interface ProposalListProps {
  proposals: Proposal[];
  isLoading: boolean;
  error: string | null;
  onProposalClick?: (proposal: Proposal) => void;
  showProject?: boolean;
  showFreelancer?: boolean;
}

export const ProposalList = ({ 
  proposals, 
  isLoading, 
  error, 
  onProposalClick,
  showProject = false,
  showFreelancer = false
}: ProposalListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (proposals.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 text-lg">No proposals found</p>
        <p className="text-neutral-400 text-sm mt-2">
          {showProject ? 'Start submitting proposals to projects' : 'No proposals received yet'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onClick={() => onProposalClick?.(proposal)}
          showProject={showProject}
          showFreelancer={showFreelancer}
        />
      ))}
    </div>
  );
};