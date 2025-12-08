// components/projects/ProjectList.tsx
import { Project } from '@/types';
import { ProjectCard } from './ProjectCard';
import { Spinner } from '@/components/common/Spinner';

interface ProjectListProps {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
}

export const ProjectList = ({ projects, isLoading, error }: ProjectListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 text-lg">No projects found</p>
        <p className="text-neutral-400 text-sm mt-2">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};