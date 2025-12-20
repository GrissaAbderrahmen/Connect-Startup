// pages/contracts/ContractDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contractsAPI } from '@/services/api/contracts';
import { Contract } from '@/types';
import { ContractDetail } from '@/components/contracts/ContractDetail';
import { EscrowStatus } from '@/components/escrow/EscrowStatus';
import { EscrowActions } from '@/components/escrow/EscrowActions';
import { LeaveReviewForm } from '@/components/contracts/LeaveReviewForm';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { useEscrow } from '@/hooks/useEscrow';
import { useAuth } from '@/context/AuthContext';

export const ContractDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { escrow, isLoading: escrowLoading, refetch: refetchEscrow } = useEscrow(
    contract?.id || 0
  );

  const fetchContract = async () => {
    if (!id) return;

    try {
      const data = await contractsAPI.getById(Number(id));
      setContract(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load contract');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContract();
  }, [id]);

  const handleUpdate = () => {
    fetchContract();
    refetchEscrow();
  };

  // Check if current user is the client (clients can leave reviews)
  const isClient = user?.id === contract?.client_id;
  // Show review form if contract completed OR escrow funds released (redundant check for safety)
  const canLeaveReview = isClient && (contract?.status === 'completed' || escrow?.status === 'funds_released');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Contract not found'}</p>
          <Button onClick={() => navigate('/contracts')}>
            Back to Contracts
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
          onClick={() => navigate('/contracts')}
          className="mb-6"
        >
          ← Back to Contracts
        </Button>

        <ContractDetail contract={contract} onUpdate={handleUpdate} />

        {/* Escrow Section */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <EscrowStatus escrow={escrow} isLoading={escrowLoading} />
          {escrow && <EscrowActions escrow={escrow} contractId={contract.id} onUpdate={handleUpdate} />}
        </div>

        {/* Leave Review Section - Only for clients on completed contracts */}
        {canLeaveReview && contract.freelancer_id && contract.project_id && (
          <div className="mt-6">
            <LeaveReviewForm
              freelancerId={contract.freelancer_id}
              projectId={contract.project_id}
              freelancerName={contract.other_user_name || 'Freelancer'}
              onSuccess={handleUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};