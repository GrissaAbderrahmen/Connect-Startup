// hooks/useContracts.ts
import { useState, useEffect } from 'react';
import { contractsAPI } from '@/services/api/contracts';
import { Contract, PaginationParams } from '@/types';

export const useContracts = (params?: PaginationParams) => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchContracts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await contractsAPI.getMyContracts(params);
      setContracts(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch contracts');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [JSON.stringify(params)]);

  return {
    contracts,
    isLoading,
    error,
    pagination,
    refetch: fetchContracts,
  };
};
