// components/proposals/ProposalActions.tsx
import { useState } from 'react';
import { proposalsAPI } from '@/services/api/proposals';
import { Proposal } from '@/types';
import { Button } from '@/components/common/Button';

interface ProposalActionsProps {
  proposal: Proposal;
  onSuccess?: () => void;
}

export const ProposalActions = ({ proposal, onSuccess }: ProposalActionsProps) => {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAccept = async () => {
    if (!confirm('Accept this proposal? This will create a contract and escrow transaction.')) {
      return;
    }

    setIsAccepting(true);
    setError(null);

    try {
      await proposalsAPI.accept(proposal.id);
      alert('Proposal accepted! Contract created.');
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to accept proposal');
    } finally {
      setIsAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!confirm('Reject this proposal? This action cannot be undone.')) {
      return;
    }

    setIsRejecting(true);
    setError(null);

    try {
      await proposalsAPI.reject(proposal.id);
      alert('Proposal rejected.');
      onSuccess?.();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reject proposal');
    } finally {
      setIsRejecting(false);
    }
  };

  if (proposal.status !== 'pending') {
    return null;
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleAccept}
          isLoading={isAccepting}
          disabled={isRejecting}
          className="flex-1"
        >
          Accept Proposal
        </Button>
        <Button
          onClick={handleReject}
          variant="danger"
          isLoading={isRejecting}
          disabled={isAccepting}
          className="flex-1"
        >
          Reject
        </Button>
      </div>
    </div>
  );
};