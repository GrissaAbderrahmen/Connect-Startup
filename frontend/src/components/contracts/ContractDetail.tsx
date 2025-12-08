// components/contracts/ContractDetail.tsx
import { Contract } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { ContractStatus } from './ContractStatus';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { contractsAPI } from '@/services/api/contracts';

interface ContractDetailProps {
  contract: Contract;
  onUpdate?: () => void;
}

export const ContractDetail = ({ contract, onUpdate }: ContractDetailProps) => {
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);
  const isClient = user?.id === contract.client_id;
  const canComplete = isClient && contract.status === 'active';

  const handleComplete = async () => {
    if (!confirm('Mark this contract as completed?')) return;

    setIsCompleting(true);
    try {
      await contractsAPI.complete(contract.id);
      alert('Contract marked as completed!');
      onUpdate?.();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to complete contract');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {contract.project_title || 'Contract'}
              </h1>
              <p className="text-neutral-600">
                With: <span className="font-medium">{contract.other_user_name}</span>
              </p>
              <p className="text-neutral-500 text-sm mt-1">
                Created on {formatDate(contract.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600 mb-2">
                {formatCurrency(contract.amount)}
              </div>
              <ContractStatus status={contract.status} />
            </div>
          </div>

          {canComplete && (
            <div className="pt-4 border-t border-neutral-200">
              <Button
                onClick={handleComplete}
                isLoading={isCompleting}
                variant="secondary"
                className="w-full"
              >
                Mark Contract as Completed
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Description */}
      {contract.job_description && (
        <Card>
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Job Description</h2>
          <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
            {contract.job_description}
          </p>
        </Card>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contract Info */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Contract Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Contract Amount</p>
              <p className="text-lg font-semibold text-neutral-900">
                {formatCurrency(contract.amount)}
              </p>
            </div>
            {contract.start_date && (
              <div>
                <p className="text-sm text-neutral-600">Start Date</p>
                <p className="text-neutral-900">{formatDate(contract.start_date)}</p>
              </div>
            )}
            {contract.end_date && (
              <div>
                <p className="text-sm text-neutral-600">End Date</p>
                <p className="text-neutral-900">{formatDate(contract.end_date)}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-neutral-600">Status</p>
              <ContractStatus status={contract.status} />
            </div>
          </div>
        </Card>

        {/* Parties Info */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Parties</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">
                {isClient ? 'Freelancer' : 'Client'}
              </p>
              <p className="text-lg font-semibold text-neutral-900">
                {contract.other_user_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="text-neutral-900">{contract.other_user_email}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};