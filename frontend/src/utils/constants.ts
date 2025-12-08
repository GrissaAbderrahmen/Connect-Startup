// utils/constants.ts

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const PROJECT_CATEGORIES = [
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Graphic Design',
  'Content Writing',
  'Digital Marketing',
  'Data Science',
  'DevOps',
  'Game Development',
  'Video Editing',
  'Other',
] as const;

export const PROJECT_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PROPOSAL_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
} as const;

export const CONTRACT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const ESCROW_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PAYMENT_RECEIVED: 'payment_received',
  WORK_COMPLETED: 'work_completed',
  FUNDS_RELEASED: 'funds_released',
  DISPUTED: 'disputed',
  REFUNDED: 'refunded',
} as const;

export const USER_ROLES = {
  CLIENT: 'client',
  FREELANCER: 'freelancer',
} as const;

export const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  PROPOSAL: 'proposal',
  PUBLIC_PROPOSAL: 'public_proposal',
  DIRECT_PROPOSAL: 'direct_proposal',
  CONTRACT: 'contract',
  ESCROW: 'escrow',
  RATING: 'rating',
} as const;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 10,
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER: 'user',
} as const;

export const STATUS_COLORS = {
  // Project statuses
  open: 'bg-secondary-100 text-secondary-800',
  in_progress: 'bg-primary-100 text-primary-800',
  completed: 'bg-neutral-100 text-neutral-800',
  cancelled: 'bg-red-100 text-red-800',
  
  // Proposal statuses
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-secondary-100 text-secondary-800',
  rejected: 'bg-red-100 text-red-800',
  
  // Contract statuses
  active: 'bg-primary-100 text-primary-800',
  
  // Escrow statuses
  pending_payment: 'bg-yellow-100 text-yellow-800',
  payment_received: 'bg-primary-100 text-primary-800',
  work_completed: 'bg-accent-100 text-accent-800',
  funds_released: 'bg-secondary-100 text-secondary-800',
  disputed: 'bg-red-100 text-red-800',
  refunded: 'bg-neutral-100 text-neutral-800',
} as const;