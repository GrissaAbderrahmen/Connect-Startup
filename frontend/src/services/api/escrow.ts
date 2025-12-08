// services/api/escrow.ts
import apiClient from './client';
import { EscrowTransaction } from '@/types';

export const escrowAPI = {
  // GET /api/escrow/contract/:contract_id - Get escrow for contract
  getByContract: async (contractId: number): Promise<{ data: EscrowTransaction[] }> => {
    const response = await apiClient.get<{ data: EscrowTransaction[] }>(
      `/escrow/contract/${contractId}`
    );
    return response.data;
  },

  // POST /api/escrow/deposit - Deposit escrow
  deposit: async (data: { contract_id: number; amount: number }): Promise<{ message: string; escrow_id: number }> => {
    const response = await apiClient.post<{ message: string; escrow_id: number }>(
      '/escrow/deposit',
      data
    );
    return response.data;
  },

  // PUT /api/escrow/:escrow_id/payment-confirmed - Confirm payment received
  confirmPayment: async (escrowId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/escrow/${escrowId}/payment-confirmed`
    );
    return response.data;
  },

  // PUT /api/escrow/:escrow_id/work-completed - Mark work as completed
  markWorkCompleted: async (escrowId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/escrow/${escrowId}/work-completed`
    );
    return response.data;
  },

  // PUT /api/escrow/:escrow_id/release-funds - Release funds to freelancer
  releaseFunds: async (escrowId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/escrow/${escrowId}/release-funds`
    );
    return response.data;
  },

  // PUT /api/escrow/:escrow_id/dispute - Raise a dispute
  dispute: async (escrowId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/escrow/${escrowId}/dispute`
    );
    return response.data;
  },

  // PUT /api/escrow/:escrow_id/refund - Refund to client
  refund: async (escrowId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/escrow/${escrowId}/refund`
    );
    return response.data;
  },
};