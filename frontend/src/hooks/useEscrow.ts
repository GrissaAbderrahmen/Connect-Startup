// hooks/useEscrow.ts
import { useState, useEffect } from 'react';
import { escrowAPI } from '@/services/api/escrow';
import { EscrowTransaction } from '@/types';

export const useEscrow = (contractId: number) => {
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscrow = async () => {
    if (!contractId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await escrowAPI.getByContract(contractId);
      // Get the first (and usually only) escrow transaction
      setEscrow(response.data[0] || null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch escrow');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEscrow();
  }, [contractId]);

  return {
    escrow,
    isLoading,
    error,
    refetch: fetchEscrow,
  };
};