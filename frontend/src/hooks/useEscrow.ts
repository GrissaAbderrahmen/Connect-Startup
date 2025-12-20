// hooks/useEscrow.ts
import { useState, useEffect } from 'react';
import { escrowAPI } from '@/services/api/escrow';
import { EscrowTransaction } from '@/types';

export const useEscrow = (contractId: number) => {
  const [escrow, setEscrow] = useState<EscrowTransaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEscrow = async () => {
    if (!contractId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await escrowAPI.getByContract(contractId);
      setEscrow(data);
    } catch (err: any) {
      // 404 is expected if no escrow exists yet
      if (err.response?.status === 404) {
        setEscrow(null);
      } else {
        setError(err.response?.data?.error || 'Failed to fetch escrow');
      }
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