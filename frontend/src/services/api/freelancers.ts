// services/api/freelancers.ts
import apiClient from './client';
import {
    FreelancerProfile,
    FreelancerWithUser,
    FreelancerSearchFilters,
    UpdateFreelancerProfileData
} from '@/types/freelancer';
import { PaginatedResponse, PaginationParams, Rating } from '@/types';

export const freelancersAPI = {
    // GET /api/freelancers/browse - Get all freelancers with filters
    getAll: async (
        params?: FreelancerSearchFilters & PaginationParams
    ): Promise<PaginatedResponse<FreelancerWithUser>> => {
        const response = await apiClient.get<PaginatedResponse<FreelancerWithUser>>('/freelancers/browse', { params });
        return response.data;
    },

    // GET /api/freelancers/search - Search freelancers
    search: async (
        filters: FreelancerSearchFilters & PaginationParams
    ): Promise<PaginatedResponse<FreelancerWithUser>> => {
        const response = await apiClient.get<PaginatedResponse<FreelancerWithUser>>('/freelancers/search', {
            params: filters,
        });
        return response.data;
    },

    // GET /api/freelancers/:id - Get freelancer profile
    getById: async (id: number): Promise<{ data: FreelancerWithUser }> => {
        const response = await apiClient.get<FreelancerWithUser>(`/freelancers/${id}`);
        // Wrap in { data: ... } to match hook expectation
        return { data: response.data };
    },

    // GET /api/freelancers/profile - Get own profile (for freelancers)
    getMyProfile: async (): Promise<{ data: FreelancerProfile }> => {
        const response = await apiClient.get<{ data: FreelancerProfile }>('/freelancers/profile');
        return response.data;
    },

    // PUT /api/freelancers/profile - Update own profile
    updateProfile: async (data: UpdateFreelancerProfileData): Promise<{ data: FreelancerProfile }> => {
        const response = await apiClient.put<{ data: FreelancerProfile }>('/freelancers/profile', data);
        return response.data;
    },

    // GET /api/freelancers/:id/reviews - Get freelancer reviews
    getReviews: async (id: number): Promise<{ data: Rating[] }> => {
        const response = await apiClient.get<{ data: Rating[] }>(`/freelancers/${id}/reviews`);
        return response.data;
    },

    // GET /api/freelancers/skills - Get all available skills for filtering
    getSkills: async (): Promise<{ data: string[] }> => {
        const response = await apiClient.get<{ data: string[] }>('/freelancers/skills');
        return response.data;
    },
};
