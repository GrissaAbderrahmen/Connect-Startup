// pages/projects/ProjectDetailPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '@/services/api/projects';
import { proposalsAPI } from '@/services/api/proposals';
import { Project } from '@/types';
import { ProjectDetail } from '@/components/projects/ProjectDetail';
import { Spinner } from '@/components/common/Spinner';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [proposalCount, setProposalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        const response = await projectsAPI.getById(Number(id));
        setProject(response.data);

        // If client and owns this project, get proposal count
        if (user?.role === 'client' && response.data.client_id === user.id) {
          try {
            const proposalsResponse = await proposalsAPI.getProjectProposals(Number(id));
            setProposalCount(proposalsResponse.data.length);
          } catch (err) {
            console.error('Failed to fetch proposals:', err);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate('/projects')} className="mb-6">
          ← Back to Projects
        </Button>
        <ProjectDetail project={project} proposalCount={proposalCount} />
      </div>
    </div>
  );
};