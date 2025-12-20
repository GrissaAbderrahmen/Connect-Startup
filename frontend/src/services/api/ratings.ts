// services/api/ratings.ts
import apiClient from './client';

interface SubmitRatingData {
    freelancer_id: number;
    project_id: number;
    rating: number;
    review_text?: string;
}

export const ratingsAPI = {
    // POST /api/ratings - Submit a rating/review
    submit: async (data: SubmitRatingData): Promise<{ message: string }> => {
        const response = await apiClient.post<{ message: string }>('/ratings', data);
        return response.data;
    },
};
