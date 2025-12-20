// services/api/admin.ts
import apiClient from './client';

// Types
export interface DashboardStats {
    users: {
        total: number;
        clients: number;
        freelancers: number;
    };
    projects: {
        total: number;
        open: number;
        active: number;
        completed: number;
    };
    contracts: {
        total: number;
        active: number;
        completed: number;
    };
    escrow: {
        total: number;
        totalReleased: number;
        totalInEscrow: number;
        activeDisputes: number;
    };
    withdrawals: {
        pendingCount: number;
        pendingAmount: number;
    };
    recent: {
        newUsers: number;
        newProjects: number;
        newContracts: number;
    };
}

export interface WithdrawalRequest {
    id: number;
    wallet_id: number;
    amount: string;
    bank_name: string;
    account_number: string;
    account_holder_name: string;
    status: string;
    admin_notes?: string;
    processed_at?: string;
    created_at: string;
    user_id: number;
    user_name: string;
    user_email: string;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    role: string;
    is_verified: boolean;
    created_at: string;
    project_count: number;
    contract_count: number;
}

export interface Dispute {
    id: number;
    contract_id: number;
    client_id: number;
    freelancer_id: number;
    amount: string;
    status: string;
    created_at: string;
    client_name: string;
    client_email: string;
    freelancer_name: string;
    freelancer_email: string;
    project_title: string;
}

export const adminAPI = {
    // Dashboard
    getDashboard: async (): Promise<DashboardStats> => {
        const response = await apiClient.get<DashboardStats>('/admin/dashboard');
        return response.data;
    },

    // Withdrawals
    getWithdrawals: async (status: string = 'pending'): Promise<{ data: WithdrawalRequest[] }> => {
        const response = await apiClient.get<{ data: WithdrawalRequest[] }>(`/admin/withdrawals?status=${status}`);
        return response.data;
    },

    approveWithdrawal: async (id: number, adminNotes?: string): Promise<{ message: string }> => {
        const response = await apiClient.put<{ message: string }>(`/admin/withdrawals/${id}/approve`, {
            admin_notes: adminNotes
        });
        return response.data;
    },

    rejectWithdrawal: async (id: number, adminNotes: string): Promise<{ message: string }> => {
        const response = await apiClient.put<{ message: string }>(`/admin/withdrawals/${id}/reject`, {
            admin_notes: adminNotes
        });
        return response.data;
    },

    // Users
    getUsers: async (params?: { role?: string; search?: string; page?: number }): Promise<{ data: AdminUser[]; pagination: any }> => {
        const queryParams = new URLSearchParams();
        if (params?.role) queryParams.append('role', params.role);
        if (params?.search) queryParams.append('search', params.search);
        if (params?.page) queryParams.append('page', params.page.toString());

        const response = await apiClient.get<{ data: AdminUser[]; pagination: any }>(`/admin/users?${queryParams.toString()}`);
        return response.data;
    },

    getUserDetails: async (id: number): Promise<AdminUser & { stats: any }> => {
        const response = await apiClient.get<AdminUser & { stats: any }>(`/admin/users/${id}`);
        return response.data;
    },

    // Disputes
    getDisputes: async (): Promise<{ data: Dispute[] }> => {
        const response = await apiClient.get<{ data: Dispute[] }>('/admin/disputes');
        return response.data;
    },

    resolveDispute: async (id: number, refundToClient: boolean): Promise<{ message: string }> => {
        const response = await apiClient.put<{ message: string }>(`/admin/disputes/${id}/resolve`, {
            refund_to_client: refundToClient
        });
        return response.data;
    }
};
