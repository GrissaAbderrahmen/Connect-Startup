// components/contracts/LeaveReviewForm.tsx
import { useState } from 'react';
import { Star } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { ratingsAPI } from '@/services/api/ratings';

interface LeaveReviewFormProps {
    freelancerId: number;
    projectId: number;
    freelancerName: string;
    onSuccess?: () => void;
}

export const LeaveReviewForm = ({
    freelancerId,
    projectId,
    freelancerName,
    onSuccess
}: LeaveReviewFormProps) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (rating === 0) {
            setError('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await ratingsAPI.submit({
                freelancer_id: freelancerId,
                project_id: projectId,
                rating,
                review_text: reviewText.trim() || undefined,
            });
            setIsSubmitted(true);
            onSuccess?.();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit review');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <Card className="bg-green-50 border-green-200">
                <div className="text-center py-4">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-lg font-semibold text-green-800">Thank you for your review!</h3>
                    <p className="text-sm text-green-700 mt-1">
                        Your feedback helps other clients make better decisions.
                    </p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="bg-amber-50 border-amber-200">
            <h3 className="text-lg font-semibold text-amber-800 mb-4">
                ⭐ Leave a Review for {freelancerName}
            </h3>

            {/* Star Rating */}
            <div className="mb-4">
                <p className="text-sm text-amber-700 mb-2">How would you rate this freelancer?</p>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            onClick={() => setRating(star)}
                            className="p-1 transition-transform hover:scale-110"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= (hoverRating || rating)
                                    ? 'text-yellow-400 fill-yellow-400'
                                    : 'text-neutral-300'
                                    }`}
                            />
                        </button>
                    ))}
                </div>
                {rating > 0 && (
                    <p className="text-sm text-amber-600 mt-1">
                        {rating === 1 && 'Poor'}
                        {rating === 2 && 'Fair'}
                        {rating === 3 && 'Good'}
                        {rating === 4 && 'Very Good'}
                        {rating === 5 && 'Excellent'}
                    </p>
                )}
            </div>

            {/* Review Text */}
            <div className="mb-4">
                <label className="block text-sm text-amber-700 mb-2">
                    Write a review (optional)
                </label>
                <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Share your experience working with this freelancer..."
                    rows={4}
                    className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                />
            </div>

            {/* Error */}
            {error && (
                <p className="text-sm text-red-600 mb-4">{error}</p>
            )}

            {/* Submit Button */}
            <Button
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={rating === 0}
                className="w-full bg-amber-600 hover:bg-amber-700"
            >
                Submit Review
            </Button>
        </Card>
    );
};
