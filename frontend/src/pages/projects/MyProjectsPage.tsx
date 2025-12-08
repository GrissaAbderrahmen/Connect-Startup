// pages/projects/MyProjectsPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { projectsAPI } from '@/services/api/projects';
import { Project } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import { useAuth } from '@/context/AuthContext';

export const MyProjectsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only clients can access this page
  if (user?.role !== 'client') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600 mb-4">Only clients can view this page</p>
          <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchMyProjects = async () => {
      setIsLoading(true);
      try {
        // Get all projects and filter by current user's ID
        const response = await projectsAPI.getAll({ limit: 100 });
        const myProjects = response.data.filter(p => p.client_id === user.id);
        setProjects(myProjects);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load projects');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyProjects();
  }, [user.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">My Projects</h1>
            <p className="text-neutral-600 mt-2">
              Manage your posted projects ({projects.length} total)
            </p>
          </div>
          <Link to="/projects/create">
            <Button>Post New Project</Button>
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Projects List */}
        {projects.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-neutral-500 text-lg mb-4">You haven't posted any projects yet</p>
              <Link to="/projects/create">
                <Button>Post Your First Project</Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {projects.map((project) => (
              <Card 
                key={project.id} 
                hoverable 
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                      {project.title}
                    </h3>
                    <p className="text-neutral-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="flex gap-3 items-center">
                      <Badge 
                        className={STATUS_COLORS[project.status as keyof typeof STATUS_COLORS]}
                      >
                        {project.status}
                      </Badge>
                      <Badge variant="primary">{project.category}</Badge>
                      <span className="text-sm text-neutral-500">
                        Posted {formatDate(project.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right ml-6">
                    <div className="text-2xl font-bold text-primary-600 mb-2">
                      {formatCurrency(project.budget)}
                    </div>
                    {project.deadline && (
                      <p className="text-sm text-neutral-500">
                        Deadline: {formatDate(project.deadline)}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};