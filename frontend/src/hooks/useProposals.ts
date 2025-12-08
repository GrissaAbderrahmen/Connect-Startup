// hooks/useProposals.ts
import { useState, useEffect } from 'react';
import { proposalsAPI } from '@/services/api/proposals';
import { Proposal, PaginationParams } from '@/types';

export const useProposals = (params?: PaginationParams) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchProposals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await proposalsAPI.getMyProposals(params);
      setProposals(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [JSON.stringify(params)]);

  return {
    proposals,
    isLoading,
    error,
    pagination,
    refetch: fetchProposals,
  };
};

export const useProjectProposals = (projectId: number) => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProposals = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await proposalsAPI.getProjectProposals(projectId);
      setProposals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch proposals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchProposals();
    }
  }, [projectId]);

  return {
    proposals,
    isLoading,
    error,
    refetch: fetchProposals,
  };
};