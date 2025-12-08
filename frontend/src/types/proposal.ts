// types/proposal.ts

export type ProposalStatus = 'pending' | 'accepted' | 'rejected' | 'completed';
export type ProposalType = 'public' | 'direct';

export interface Proposal {
  id: number;
  project_id: number;
  freelancer_id: number;
  client_id: number;
  proposal_type: ProposalType;
  proposal_text: string;
  proposed_price: number;
  delivery_time: string | null;
  start_date: string | null;
  end_date: string | null;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  freelancer_name?: string;
  freelancer_email?: string;
  client_name?: string;
  client_email?: string;
  project_title?: string;
}

export interface CreatePublicProposalData {
  project_id: number;
  proposal_text: string;
  proposed_price: number;
  delivery_time?: string;
}

export interface CreateDirectProposalData {
  freelancer_id: number;
  title: string;
  description: string;
  proposed_price: number;
  start_date: string;
  end_date: string;
}