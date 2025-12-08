// pages/projects/CreateProjectPage.tsx
import { useNavigate } from 'react-router-dom';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/context/AuthContext';

export const CreateProjectPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Only clients can create projects
  if (user?.role !== 'client') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card>
          <p className="text-red-600 text-lg mb-4">Only clients can post projects</p>
          <Button onClick={() => navigate('/projects')}>Browse Projects</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate('/projects')} className="mb-6">
          ← Back to Projects
        </Button>

        <Card>
          <h1 className="text-3xl font-bold text-neutral-900 mb-6">Post a New Project</h1>
          <ProjectForm />
        </Card>
      </div>
    </div>
  );
};