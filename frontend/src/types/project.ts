// types/project.ts

export type ProjectStatus = 'open' | 'in_progress' | 'completed' | 'cancelled';

export interface Project {
  id: number;
  client_id: number;
  title: string;
  description: string;
  budget: number;
  category: string;
  required_skills: string[];
  status: ProjectStatus;
  deadline: string | null;
  hired_freelancer_id: number | null;
  created_at: string;
  updated_at: string;
  client_name?: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  budget: number;
  category: string;
  required_skills: string[];
  deadline?: string;
}

export interface ProjectFilters {
  category?: string;
  min_budget?: number;
  max_budget?: number;
  skills?: string;
  query?: string;
}