// components/proposals/PublicProposalForm.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { proposalsAPI } from '@/services/api/proposals';
import { CreatePublicProposalData } from '@/types';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Button } from '@/components/common/Button';

interface PublicProposalFormProps {
  projectId: number;
  onSuccess?: () => void;
}

export const PublicProposalForm = ({ projectId, onSuccess }: PublicProposalFormProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<CreatePublicProposalData>({
    project_id: projectId,
    proposal_text: '',
    proposed_price: 0,
    delivery_time: '',
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.proposal_text.trim()) {
      newErrors.proposal_text = 'Proposal text is required';
    } else if (formData.proposal_text.length < 50) {
      newErrors.proposal_text = 'Proposal must be at least 50 characters';
    }

    if (formData.proposed_price <= 0) {
      newErrors.proposed_price = 'Price must be greater than 0';
    }

    if (!formData.delivery_time?.trim()) {
      newErrors.delivery_time = 'Delivery time is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await proposalsAPI.createPublic(formData);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/proposals/my-proposals');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to submit proposal';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">
          {errors.general}
        </div>
      )}

      <Textarea
        label="Your Proposal"
        placeholder="Explain why you're the best fit for this project. Include your experience, approach, and what makes you stand out..."
        value={formData.proposal_text}
        onChange={(e) => setFormData({ ...formData, proposal_text: e.target.value })}
        error={errors.proposal_text}
        required
        rows={8}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Your Bid (USD)"
          type="number"
          placeholder="5000"
          value={formData.proposed_price || ''}
          onChange={(e) => setFormData({ ...formData, proposed_price: Number(e.target.value) })}
          error={errors.proposed_price}
          required
        />

        <Input
          label="Delivery Time"
          type="text"
          placeholder="e.g., 2 weeks, 30 days"
          value={formData.delivery_time}
          onChange={(e) => setFormData({ ...formData, delivery_time: e.target.value })}
          error={errors.delivery_time}
          required
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" isLoading={isLoading} className="flex-1">
          Submit Proposal
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </div>
    </form>
  );
};