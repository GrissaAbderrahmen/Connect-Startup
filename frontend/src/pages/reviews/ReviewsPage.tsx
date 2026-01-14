// pages/reviews/ReviewsPage.tsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { formatDate } from '@/utils/formatters';
import apiClient from '@/services/api/client';
import {
    Star,
    User,
    Briefcase,
    MessageSquare
} from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    review_text: string;
    created_at: string;
    client_name: string;
    project_title: string;
}

interface ReviewStats {
    totalReviews: number;
    averageRating: string;
    breakdown: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
}

export const ReviewsPage = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [stats, setStats] = useState<ReviewStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await apiClient.get('/ratings/my-reviews');
                setReviews(response.data.reviews);
                setStats(response.data.stats);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load reviews');
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, []);

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${star <= rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-neutral-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    const getBreakdownPercentage = (count: number) => {
        if (!stats || stats.totalReviews === 0) return 0;
        return (count / stats.totalReviews) * 100;
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8">
                    <p className="text-red-600">{error}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">⭐ My Reviews</h1>
                    <p className="text-neutral-600">See what clients are saying about your work</p>
                </div>

                {/* Stats Section */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {/* Average Rating Card */}
                        <Card className="bg-gradient-to-br from-yellow-400 to-orange-400 text-white">
                            <div className="text-center">
                                <p className="text-yellow-100 text-sm mb-1">Average Rating</p>
                                <p className="text-5xl font-bold mb-2">{parseFloat(stats.averageRating).toFixed(1)}</p>
                                <div className="flex justify-center gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <Star
                                            key={star}
                                            className={`w-5 h-5 ${star <= parseFloat(stats.averageRating)
                                                ? 'text-white fill-white'
                                                : 'text-yellow-200'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Total Reviews */}
                        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm">Total Reviews</p>
                                    <p className="text-4xl font-bold">{stats.totalReviews}</p>
                                    <p className="text-blue-200 text-sm mt-1">from clients</p>
                                </div>
                                <MessageSquare className="w-10 h-10 text-blue-200" />
                            </div>
                        </Card>

                        {/* Rating Breakdown */}
                        <Card>
                            <p className="text-sm font-medium text-neutral-600 mb-3">Rating Breakdown</p>
                            <div className="space-y-2">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-2">
                                        <span className="text-sm text-neutral-600 w-3">{rating}</span>
                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                        <div className="flex-1 bg-neutral-100 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full transition-all"
                                                style={{ width: `${getBreakdownPercentage(stats.breakdown[rating as keyof typeof stats.breakdown])}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-neutral-500 w-6">
                                            {stats.breakdown[rating as keyof typeof stats.breakdown]}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Reviews List */}
                <Card>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">All Reviews</h2>

                    {reviews.length === 0 ? (
                        <div className="text-center py-12">
                            <Star className="w-12 h-12 text-neutral-200 mx-auto mb-4" />
                            <p className="text-neutral-600 mb-2">No reviews yet</p>
                            <p className="text-sm text-neutral-500">
                                Complete projects to start receiving reviews from clients
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {reviews.map((review) => (
                                <div key={review.id} className="py-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                                <User className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{review.client_name}</p>
                                                <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                    <Briefcase className="w-3 h-3" />
                                                    <span>{review.project_title}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {renderStars(review.rating)}
                                            <p className="text-xs text-neutral-400 mt-1">
                                                {formatDate(review.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {review.review_text && (
                                        <p className="text-neutral-700 bg-neutral-50 p-3 rounded-lg ml-13">
                                            "{review.review_text}"
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
