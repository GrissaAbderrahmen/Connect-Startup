// services/api/auth.ts
import apiClient from './client';
import {
  User,
  AuthResponse,
  LoginCredentials,
  SignupData,
  PasswordResetRequest,
  PasswordReset,
} from '@/types';

export const authAPI = {
  // POST /api/auth/signup
  signup: async (data: SignupData): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/signup', data);
    return response.data;
  },

  // POST /api/auth/login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // GET /api/auth/me
  getCurrentUser: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data;
  },

  // POST /api/auth/send-verification
  sendVerificationEmail: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/send-verification');
    return response.data;
  },

  // GET /api/auth/verify-email?token=xxx
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.get<{ message: string }>(`/auth/verify-email?token=${token}`);
    return response.data;
  },

  // POST /api/auth/request-reset
  requestPasswordReset: async (data: PasswordResetRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/request-reset', data);
    return response.data;
  },

  // POST /api/auth/reset-password
  resetPassword: async (data: PasswordReset): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/reset-password', data);
    return response.data;
  },

  // POST /api/auth/change-password (logged in user)
  changePassword: async (current_password: string, new_password: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/change-password', {
      current_password,
      new_password,
    });
    return response.data;
  },

  // DELETE /api/auth/delete-account
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>('/auth/delete-account', {
      data: { password },
    });
    return response.data;
  },

  // POST /api/auth/dev/force-verify (Development only)
  forceVerify: async (): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>('/auth/dev/force-verify');
    return response.data;
  },
};
