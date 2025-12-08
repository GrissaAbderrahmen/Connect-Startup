// services/api/proposals.ts
import apiClient from './client';
import {
  Proposal,
  CreatePublicProposalData,
  CreateDirectProposalData,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const proposalsAPI = {
  // POST /api/proposals/public - Submit public proposal to project
  createPublic: async (data: CreatePublicProposalData): Promise<{ data: Proposal }> => {
    const response = await apiClient.post<{ data: Proposal }>('/proposals/public', data);
    return response.data;
  },

  // POST /api/proposals/direct - Send direct proposal to freelancer
  createDirect: async (data: CreateDirectProposalData): Promise<{ data: Proposal }> => {
    const response = await apiClient.post<{ data: Proposal }>('/proposals/direct', data);
    return response.data;
  },

  // GET /api/proposals/my-proposals - Get freelancer's proposals
  getMyProposals: async (params?: PaginationParams): Promise<PaginatedResponse<Proposal>> => {
    const response = await apiClient.get<PaginatedResponse<Proposal>>('/proposals/my-proposals', {
      params,
    });
    return response.data;
  },

  // GET /api/proposals/my-projects - Get client's projects with proposal counts
  getMyProjects: async (params?: PaginationParams): Promise<PaginatedResponse<any>> => {
    const response = await apiClient.get<PaginatedResponse<any>>('/proposals/my-projects', {
      params,
    });
    return response.data;
  },

  // GET /api/proposals/project/:project_id - Get all proposals for a project
  getProjectProposals: async (projectId: number): Promise<{ data: Proposal[] }> => {
    const response = await apiClient.get<{ data: Proposal[] }>(`/proposals/project/${projectId}`);
    return response.data;
  },

  // PUT /api/proposals/:proposal_id/accept - Accept proposal
  accept: async (proposalId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/proposals/${proposalId}/accept`
    );
    return response.data;
  },

  // PUT /api/proposals/:proposal_id/reject - Reject proposal
  reject: async (proposalId: number): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>(
      `/proposals/${proposalId}/reject`
    );
    return response.data;
  },
};