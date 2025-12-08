// components/projects/ProjectDetail.tsx
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { useAuth } from '@/context/AuthContext';

interface ProjectDetailProps {
  project: Project;
  proposalCount?: number;
}

export const ProjectDetail = ({ project, proposalCount }: ProjectDetailProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isFreelancer = user?.role === 'freelancer';
  const isClient = user?.role === 'client';
  const isOwner = user?.id === project.client_id;
  const canPropose = isFreelancer && project.status === 'open';
  const canViewProposals = isClient && isOwner;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                {project.title}
              </h1>
              <p className="text-neutral-600">
                Posted by <span className="font-medium">{project.client_name || 'Client'}</span> on{' '}
                {formatDate(project.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {formatCurrency(project.budget)}
              </div>
              <Badge variant="success" className="mt-2">
                {project.status}
              </Badge>
            </div>
          </div>

          <div className="flex gap-3">
            {canPropose && (
              <Button 
                onClick={() => navigate(`/projects/${project.id}/propose`)} 
                className="flex-1"
              >
                Submit Proposal
              </Button>
            )}
            {canViewProposals && (
              <Button 
                onClick={() => navigate(`/projects/${project.id}/proposals`)} 
                variant="secondary"
                className="flex-1"
              >
                View Proposals ({proposalCount || 0})
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Description Card */}
      <Card>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Project Description</h2>
        <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
          {project.description}
        </p>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category and Skills */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Category & Skills</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-600 mb-2">Category</p>
              <Badge variant="primary">{project.category}</Badge>
            </div>
            <div>
              <p className="text-sm text-neutral-600 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {project.required_skills.map((skill, index) => (
                  <Badge key={index} variant="default">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Project Info */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Project Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Budget</p>
              <p className="text-lg font-semibold text-neutral-900">
                {formatCurrency(project.budget)}
              </p>
            </div>
            {project.deadline && (
              <div>
                <p className="text-sm text-neutral-600">Deadline</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {formatDate(project.deadline)}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-neutral-600">Status</p>
              <Badge variant="success">{project.status}</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};