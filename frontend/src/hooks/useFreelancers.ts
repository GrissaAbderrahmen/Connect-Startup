// hooks/useFreelancers.ts
import { useState, useEffect, useCallback } from 'react';
import { freelancersAPI } from '@/services/api/freelancers';
import { FreelancerWithUser, FreelancerSearchFilters, FreelancerProfile, UpdateFreelancerProfileData } from '@/types/freelancer';
import { PaginationParams, Rating } from '@/types';

export const useFreelancers = (filters?: FreelancerSearchFilters & PaginationParams) => {
    const [freelancers, setFreelancers] = useState<FreelancerWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
    });

    const fetchFreelancers = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = filters && Object.keys(filters).length > 0
                ? await freelancersAPI.search(filters)
                : await freelancersAPI.getAll(filters);

            setFreelancers(response.data);
            setPagination(response.pagination);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch freelancers');
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    useEffect(() => {
        fetchFreelancers();
    }, [fetchFreelancers]);

    return {
        freelancers,
        isLoading,
        error,
        pagination,
        refetch: fetchFreelancers,
    };
};

export const useFreelancerProfile = (freelancerId: number | null) => {
    const [freelancer, setFreelancer] = useState<FreelancerWithUser | null>(null);
    const [reviews, setReviews] = useState<Rating[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        if (!freelancerId) return;

        setIsLoading(true);
        setError(null);

        try {
            const [profileRes, reviewsRes] = await Promise.all([
                freelancersAPI.getById(freelancerId),
                freelancersAPI.getReviews(freelancerId),
            ]);

            setFreelancer(profileRes.data);
            setReviews(reviewsRes.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch freelancer profile');
        } finally {
            setIsLoading(false);
        }
    }, [freelancerId]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        freelancer,
        reviews,
        isLoading,
        error,
        refetch: fetchProfile,
    };
};

export const useMyFreelancerProfile = () => {
    const [profile, setProfile] = useState<FreelancerProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await freelancersAPI.getMyProfile();
            setProfile(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch your profile');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const updateProfile = useCallback(async (data: UpdateFreelancerProfileData) => {
        setIsSaving(true);
        setError(null);

        try {
            const response = await freelancersAPI.updateProfile(data);
            setProfile(response.data);
            return response.data;
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
            return null;
        } finally {
            setIsSaving(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        profile,
        isLoading,
        isSaving,
        error,
        updateProfile,
        refetch: fetchProfile,
    };
};
