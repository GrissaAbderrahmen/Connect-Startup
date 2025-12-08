// components/projects/ProjectForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsAPI } from '@/services/api/projects';
import { CreateProjectData } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PROJECT_CATEGORIES } from '@/utils/constants';

export const ProjectForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreateProjectData>({
    title: '',
    description: '',
    budget: 0,
    category: PROJECT_CATEGORIES[0],
    required_skills: [],
    deadline: undefined,
  });

  const [skillsInput, setSkillsInput] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.budget <= 0) {
      newErrors.budget = 'Budget must be greater than 0';
    }

    if (formData.required_skills.length === 0) {
      newErrors.skills = 'At least one skill is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await projectsAPI.create(formData);
      navigate(`/projects/${response.id}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to create project';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkillsChange = (value: string) => {
    setSkillsInput(value);
    // Split by comma and trim whitespace
    const skillsArray = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    setFormData({ ...formData, required_skills: skillsArray });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {errors.general && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {errors.general}
        </div>
      )}

      <Input
        label="Project Title"
        type="text"
        placeholder="e.g., Build a responsive e-commerce website"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        error={errors.title}
        required
      />

      <Textarea
        label="Project Description"
        placeholder="Describe your project in detail..."
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        error={errors.description}
        required
        rows={6}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Budget (USD)"
          type="number"
          placeholder="5000"
          value={formData.budget || ''}
          onChange={(e) => setFormData({ ...formData, budget: Number(e.target.value) })}
          error={errors.budget}
          required
        />

        <Select
          label="Category"
          options={PROJECT_CATEGORIES.map((cat) => ({ value: cat, label: cat }))}
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        />
      </div>

      <Input
        label="Required Skills (comma-separated)"
        type="text"
        placeholder="React, Node.js, MongoDB"
        value={skillsInput}
        onChange={(e) => handleSkillsChange(e.target.value)}
        error={errors.skills}
        required
      />

      {formData.required_skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {formData.required_skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      <Input
        label="Deadline (Optional)"
        type="date"
        value={formData.deadline || ''}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value || undefined })}
      />

      <div className="flex gap-4 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Create Project
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  );
};