// types/contract.ts

export type ContractStatus = 'active' | 'completed' | 'cancelled';

export interface Milestone {
  title: string;
  description: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'completed';
}

export interface Contract {
  id: number;
  proposal_id: number;
  project_id: number;
  client_id: number;
  freelancer_id: number;
  amount: number;
  start_date: string | null;
  end_date: string | null;
  milestones: Milestone[];
  status: ContractStatus;
  created_at: string;
  updated_at: string;
  other_user_id?: number;
  other_user_name?: string;
  other_user_email?: string;
  job_description?: string;
  project_title?: string;
}