// components/projects/ProjectCard.tsx
import { useNavigate } from 'react-router-dom';
import { Project } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatRelativeTime, truncateText } from '@/utils/formatters';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  return (
    <Card hoverable onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="space-y-3">
        {/* Title and Budget */}
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-neutral-900 line-clamp-2">
            {project.title}
          </h3>
          <span className="text-xl font-bold text-primary-600 ml-4">
            {formatCurrency(project.budget)}
          </span>
        </div>

        {/* Description */}
        <p className="text-neutral-600 text-sm line-clamp-3">
          {truncateText(project.description, 150)}
        </p>

        {/* Category and Status */}
        <div className="flex gap-2">
          <Badge variant="primary">{project.category}</Badge>
          <Badge variant="success">{project.status}</Badge>
        </div>

        {/* Skills */}
        {project.required_skills && project.required_skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {project.required_skills.slice(0, 5).map((skill, index) => (
              <Badge key={index} variant="default">
                {skill}
              </Badge>
            ))}
            {project.required_skills.length > 5 && (
              <Badge variant="default">+{project.required_skills.length - 5} more</Badge>
            )}
          </div>
        )}

        {/* Footer - Client and Date */}
        <div className="flex justify-between items-center text-sm text-neutral-500 pt-3 border-t border-neutral-200">
          <span>Posted by {project.client_name || 'Client'}</span>
          <span>{formatRelativeTime(project.created_at)}</span>
        </div>
      </div>
    </Card>
  );
};