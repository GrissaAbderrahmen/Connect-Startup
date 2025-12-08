// types/user.ts

export type UserRole = 'client' | 'freelancer';

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  is_verified: boolean;
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

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordReset {
  token: string;
  new_password: string;
}