// services/api/projects.ts
import apiClient from './client';
import {
  Project,
  CreateProjectData,
  ProjectFilters,
  PaginatedResponse,
  PaginationParams,
} from '@/types';

export const projectsAPI = {
  // GET /api/projects - Get all open projects with pagination
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects', { params });
    return response.data;
  },

  // GET /api/projects/search - Search projects with filters
  search: async (
    filters: ProjectFilters & PaginationParams
  ): Promise<PaginatedResponse<Project>> => {
    const response = await apiClient.get<PaginatedResponse<Project>>('/projects/search', {
      params: filters,
    });
    return response.data;
  },

  // GET /api/projects/:id - Get single project
  getById: async (id: number): Promise<{ data: Project }> => {
    const response = await apiClient.get<{ data: Project }>(`/projects/${id}`);
    return response.data;
  },

  // POST /api/projects - Create new project (clients only)
  create: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post<Project>('/projects', data);
    return response.data;
  },
};