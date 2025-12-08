// components/escrow/EscrowActions.tsx
import { useState } from 'react';
import { EscrowTransaction } from '@/types';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { escrowAPI } from '@/services/api/escrow';
import { useAuth } from '@/context/AuthContext';

interface EscrowActionsProps {
  escrow: EscrowTransaction;
  contractId: number;
  onUpdate?: () => void;
}

export const EscrowActions = ({ escrow, contractId, onUpdate }: EscrowActionsProps) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isClient = user?.id === escrow.client_id;
  const isFreelancer = user?.id === escrow.freelancer_id;

  const handleAction = async (
    action: () => Promise<any>,
    confirmMessage: string,
    successMessage: string
  ) => {
    if (!confirm(confirmMessage)) return;

    setIsLoading(true);
    setError(null);

    try {
      await action();
      alert(successMessage);
      onUpdate?.();
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || 'Action failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Escrow Actions</h3>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {/* Client Actions */}
        {isClient && escrow.status === 'pending_payment' && (
          <Button
            onClick={() => handleAction(
              () => escrowAPI.confirmPayment(escrow.id),
              'Confirm that you have made the payment?',
              'Payment confirmed!'
            )}
            isLoading={isLoading}
            className="w-full"
          >
            Confirm Payment
          </Button>
        )}

        {isClient && escrow.status === 'work_completed' && (
          <Button
            onClick={() => handleAction(
              () => escrowAPI.releaseFunds(escrow.id),
              'Release funds to freelancer? This cannot be undone.',
              'Funds released to freelancer!'
            )}
            isLoading={isLoading}
            variant="secondary"
            className="w-full"
          >
            Release Funds
          </Button>
        )}

        {/* Freelancer Actions */}
        {isFreelancer && escrow.status === 'payment_received' && (
          <Button
            onClick={() => handleAction(
              () => escrowAPI.markWorkCompleted(escrow.id),
              'Mark work as completed?',
              'Work marked as completed! Waiting for client approval.'
            )}
            isLoading={isLoading}
            variant="secondary"
            className="w-full"
          >
            Mark Work as Completed
          </Button>
        )}

        {/* Dispute (both can raise) */}
        {(isClient || isFreelancer) && 
         !['funds_released', 'refunded', 'disputed'].includes(escrow.status) && (
          <Button
            onClick={() => handleAction(
              () => escrowAPI.dispute(escrow.id),
              'Raise a dispute on this escrow?',
              'Dispute raised. An admin will review this case.'
            )}
            isLoading={isLoading}
            variant="danger"
            className="w-full"
          >
            Raise Dispute
          </Button>
        )}

        {/* Status message */}
        {escrow.status === 'funds_released' && (
          <p className="text-sm text-green-600 text-center">
            ✅ Funds have been released to the freelancer
          </p>
        )}
        {escrow.status === 'disputed' && (
          <p className="text-sm text-red-600 text-center">
            ⚠️ This escrow is under dispute
          </p>
        )}
      </div>
    </Card>
  );
};