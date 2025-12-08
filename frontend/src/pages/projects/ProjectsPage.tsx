// pages/projects/ProjectsPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { ProjectList } from '@/components/projects/ProjectList';
import { ProjectFilters } from '@/components/projects/ProjectFilters';
import { Pagination } from '@/components/common/Pagination';
import { Button } from '@/components/common/Button';
import { ProjectFilters as FilterType } from '@/types';
import { useAuth } from '@/context/AuthContext';

export const ProjectsPage = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FilterType & { page?: number; limit?: number }>({
    page: 1,
    limit: 9,
  });

  const { projects, isLoading, error, pagination } = useProjects(filters);

  const handleFilter = (newFilters: FilterType) => {
    setFilters({ ...newFilters, page: 1, limit: 9 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Browse Projects</h1>
            <p className="text-neutral-600 mt-2">
              Find your next opportunity from {pagination.total} open projects
            </p>
          </div>
          {user?.role === 'client' && (
            <Link to="/projects/create">
              <Button>Post a Project</Button>
            </Link>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <ProjectFilters onFilter={handleFilter} />
          </div>

          {/* Projects List */}
          <div className="lg:col-span-3">
            <ProjectList projects={projects} isLoading={isLoading} error={error} />
            
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};