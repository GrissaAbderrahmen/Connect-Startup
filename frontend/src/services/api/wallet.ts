// services/api/wallet.ts
import apiClient from './client';

export interface Wallet {
    id: number;
    user_id: number;
    available_balance: string;
    pending_balance: string;
    total_earned: string;
    created_at: string;
    updated_at: string;
}

export interface WalletTransaction {
    id: number;
    type: 'credit' | 'withdrawal' | 'fee';
    amount: string;
    description: string;
    reference_type: string;
    reference_id: number;
    balance_after: string;
    created_at: string;
}

export interface WithdrawalRequest {
    id: number;
    amount: string;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    status: 'pending' | 'processing' | 'completed' | 'rejected';
    admin_notes: string | null;
    processed_at: string | null;
    created_at: string;
}

export interface WithdrawData {
    amount: number;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
}

export const walletAPI = {
    // GET /api/wallet - Get wallet balance
    getWallet: async (): Promise<Wallet> => {
        const response = await apiClient.get<Wallet>('/wallet');
        return response.data;
    },

    // GET /api/wallet/transactions - Get transaction history
    getTransactions: async (page = 1, limit = 20): Promise<{
        data: WalletTransaction[];
        pagination: { page: number; limit: number; total: number; totalPages: number };
    }> => {
        const response = await apiClient.get('/wallet/transactions', {
            params: { page, limit }
        });
        return response.data;
    },

    // POST /api/wallet/withdraw - Request withdrawal
    withdraw: async (data: WithdrawData): Promise<{ message: string; withdrawal_id: number }> => {
        const response = await apiClient.post<{ message: string; withdrawal_id: number }>(
            '/wallet/withdraw',
            data
        );
        return response.data;
    },

    // GET /api/wallet/withdrawals - Get withdrawal history
    getWithdrawals: async (): Promise<{ data: WithdrawalRequest[] }> => {
        const response = await apiClient.get<{ data: WithdrawalRequest[] }>('/wallet/withdrawals');
        return response.data;
    },
};
