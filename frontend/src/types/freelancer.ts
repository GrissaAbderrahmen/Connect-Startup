// types/freelancer.ts

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

export interface FreelancerWithUser extends FreelancerProfile {
    name: string;
    email: string;
    is_verified: boolean;
    location?: string;
    completed_projects?: number;
    response_time?: string;
    member_since?: string;
    social_links?: {
        github?: string;
        linkedin?: string;
        website?: string;
        behance?: string;
        dribbble?: string;
    };
}

export interface FreelancerSearchFilters {
    skills?: string[];
    category?: string;
    min_rate?: number;
    max_rate?: number;
    min_rating?: number;
    location?: string;
    is_verified?: boolean;
    query?: string;
}

export interface UpdateFreelancerProfileData {
    bio?: string;
    skills?: string[];
    hourly_rate?: number;
    portfolio_url?: string;
    social_links?: {
        github?: string;
        linkedin?: string;
        website?: string;
    };
}

export interface FreelancerPortfolioItem {
    id: number;
    title: string;
    description: string;
    image_url?: string;
    link?: string;
}
