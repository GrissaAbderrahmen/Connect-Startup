// types/escrow.ts
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