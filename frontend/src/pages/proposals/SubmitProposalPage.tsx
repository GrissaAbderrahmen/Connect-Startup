// pages/proposals/SubmitProposalPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsAPI } from '@/services/api/projects';
import { Project } from '@/types';
import { PublicProposalForm } from '@/components/proposals/PublicProposalForm';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { formatCurrency } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';

export const SubmitProposalPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Only freelancers can submit proposals
  if (user?.role !== 'freelancer') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600 mb-4">Only freelancers can submit proposals</p>
          <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      
      try {
        const response = await projectsAPI.getById(Number(id));
        setProject(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id]);

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
        <Card>
          <p className="text-red-600 text-lg mb-4">{error || 'Project not found'}</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/projects/${project.id}`)} 
          className="mb-6"
        >
          ← Back to Project
        </Button>

        {/* Project Summary */}
        <Card className="mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Submit Proposal
          </h2>
          <div className="bg-neutral-50 p-4 rounded-lg">
            <h3 className="font-semibold text-lg text-neutral-900 mb-2">
              {project.title}
            </h3>
            <div className="flex items-center gap-4">
              <Badge variant="primary">{project.category}</Badge>
              <span className="text-lg font-bold text-primary-600">
                Budget: {formatCurrency(project.budget)}
              </span>
            </div>
          </div>
        </Card>

        {/* Proposal Form */}
        <Card>
          <PublicProposalForm
            projectId={project.id}
            onSuccess={() => {
              alert('Proposal submitted successfully!');
              navigate('/proposals/my-proposals');
            }}
          />
        </Card>
      </div>
    </div>
  );
};