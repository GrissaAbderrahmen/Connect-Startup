// services/api/contracts.ts
import apiClient from './client';
import {
  Contract,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const contractsAPI = {
  // GET /api/contracts/my-contracts - Get user's contracts
  getMyContracts: async (params?: PaginationParams): Promise<PaginatedResponse<Contract>> => {
    const response = await apiClient.get<PaginatedResponse<Contract>>('/contracts/my-contracts', {
      params,
    });
    return response.data;
  },

  // GET /api/contracts/:contract_id - Get contract details
  getById: async (contractId: number): Promise<Contract> => {
    const response = await apiClient.get<Contract>(`/contracts/${contractId}`);
    return response.data;
  },

  // PUT /api/contracts/:contract_id/complete - Mark contract as complete
  complete: async (contractId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/contracts/${contractId}/complete`
    );
    return response.data;
  },
};