// pages/proposals/ProposalDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { proposalsAPI } from '@/services/api/proposals';
import { Proposal } from '@/types';
import { ProposalDetail } from '@/components/proposals/ProposalDetail';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';

export const ProposalDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposal = async () => {
    if (!id) return;

    try {
      const response = await proposalsAPI.getById(Number(id));
      setProposal(response.data);
    } catch (err: any) {
      console.error('Error fetching proposal:', err);
      setError(err.response?.data?.error || 'Failed to load proposal');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposal();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Proposal not found'}</p>
          <Button onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button
          variant="outline"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          ← Go Back
        </Button>
        <ProposalDetail proposal={proposal} onUpdate={fetchProposal} />
      </div>
    </div>
  );
};
