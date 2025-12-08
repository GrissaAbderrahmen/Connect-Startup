// components/proposals/ProposalCard.tsx
import { Proposal } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: () => void;
  showProject?: boolean; // Show project info (for freelancer view)
  showFreelancer?: boolean; // Show freelancer info (for client view)
}

export const ProposalCard = ({ 
  proposal, 
  onClick, 
  showProject = false,
  showFreelancer = false 
}: ProposalCardProps) => {
  return (
    <Card hoverable onClick={onClick}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {showProject && proposal.project_title && (
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {proposal.project_title}
              </h3>
            )}
            {showFreelancer && (
              <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                {proposal.freelancer_name}
              </h3>
            )}
            <p className="text-sm text-neutral-600">
              {showProject && `To: ${proposal.client_name || 'Client'}`}
              {showFreelancer && proposal.freelancer_email}
            </p>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-primary-600">
              {formatCurrency(proposal.proposed_price)}
            </div>
            <Badge 
              className={STATUS_COLORS[proposal.status as keyof typeof STATUS_COLORS]}
            >
              {proposal.status}
            </Badge>
          </div>
        </div>

        {/* Proposal Text */}
        <p className="text-neutral-700 text-sm line-clamp-3">
          {proposal.proposal_text}
        </p>

        {/* Delivery Time */}
        {proposal.delivery_time && (
          <div className="text-sm text-neutral-600">
            <span className="font-medium">Delivery:</span> {proposal.delivery_time}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center text-sm text-neutral-500 pt-3 border-t border-neutral-200">
          <span>
            {proposal.proposal_type === 'public' ? 'Public Proposal' : 'Direct Offer'}
          </span>
          <span>{formatRelativeTime(proposal.created_at)}</span>
        </div>
      </div>
    </Card>
  );
};