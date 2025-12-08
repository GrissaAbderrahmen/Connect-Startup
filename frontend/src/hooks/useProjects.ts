// hooks/useProjects.ts
import { useState, useEffect } from 'react';
import { projectsAPI } from '@/services/api/projects';
import { Project, ProjectFilters, PaginationParams } from '@/types';

export const useProjects = (filters?: ProjectFilters & PaginationParams) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = filters && Object.keys(filters).length > 0
        ? await projectsAPI.search(filters)
        : await projectsAPI.getAll(filters);
      
      setProjects(response.data);
      setPagination(response.pagination);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [JSON.stringify(filters)]);

  return {
    projects,
    isLoading,
    error,
    pagination,
    refetch: fetchProjects,
  };
};