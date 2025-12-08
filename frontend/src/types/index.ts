// types/index.ts - Export all types
export * from './user';
export * from './project';
export * from './proposal';
export * from './contract';
export * from './api';

// Explicitly re-export to ensure they're available
export type { CreateProjectData, ProjectFilters } from './project';
export type { CreatePublicProposalData, CreateDirectProposalData } from './proposal';
export type { PaginationParams, PaginatedResponse } from './api';

// Re-export individual types that were in combined files
export type EscrowStatus = 
  | 'pending_payment' 
  | 'payment_received' 
  | 'work_completed' 
  | 'funds_released' 
  | 'disputed' 
  | 'refunded';

export interface EscrowTransaction {
  id: number;
  contract_id: number;
  project_id: number;
  client_id: number;
  freelancer_id: number;
  amount: number;
  status: EscrowStatus;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  project_id: number | null;
  message_text: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
}

export interface SendMessageData {
  recipient_id: number;
  message_text: string;
  project_id?: number;
}

export type NotificationType = 
  | 'message' 
  | 'proposal' 
  | 'public_proposal'
  | 'direct_proposal'
  | 'contract' 
  | 'escrow' 
  | 'rating';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  message: string;
  is_read: boolean;
  created_at: string;
  proposal_id: number | null;
}

export interface Rating {
  id: number;
  project_id: number;
  freelancer_id: number;
  client_id: number;
  rating: number;
  review_text: string | null;
  created_at: string;
}

export interface CreateRatingData {
  freelancer_id: number;
  project_id: number;
  rating: number;
  review_text?: string;
}

export interface FreelancerProfile {
  id: number;
  user_id: number;
  bio: string;
  skills: string[];
  hourly_rate: number | null;
  portfolio_url: string;
  average_rating?: number;
  total_reviews?: number;
  created_at: string;
  updated_at: string;
}

export interface ClientProfile {
  id: number;
  user_id: number;
  company_name: string;
  created_at: string;
  updated_at: string;
}