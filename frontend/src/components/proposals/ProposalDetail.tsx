// components/proposals/ProposalDetail.tsx
import { Proposal } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import { ProposalActions } from './ProposalActions';
import { useAuth } from '@/context/AuthContext';

interface ProposalDetailProps {
  proposal: Proposal;
  onUpdate?: () => void;
}

export const ProposalDetail = ({ proposal, onUpdate }: ProposalDetailProps) => {
  const { user } = useAuth();
  const isClient = user?.id === proposal.client_id;
  const canTakeAction = isClient && proposal.status === 'pending';

  console.log('ProposalDetail Debug:', {
    userId: user?.id,
    clientId: proposal.client_id,
    isClient,
    status: proposal.status,
    canTakeAction
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Proposal from {proposal.freelancer_name}
              </h1>
              {proposal.project_title && (
                <p className="text-neutral-600">
                  For project: <span className="font-medium">{proposal.project_title}</span>
                </p>
              )}
              <p className="text-neutral-500 text-sm mt-1">
                Submitted on {formatDate(proposal.created_at)}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary-600">
                {formatCurrency(proposal.proposed_price)}
              </div>
              <Badge 
                className={`mt-2 ${STATUS_COLORS[proposal.status as keyof typeof STATUS_COLORS]}`}
              >
                {proposal.status}
              </Badge>
            </div>
          </div>

          {/* IMPORTANT: Accept/Reject Buttons */}
          {canTakeAction ? (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-3">
                Review this proposal and take action:
              </p>
              <ProposalActions proposal={proposal} onSuccess={onUpdate} />
            </div>
          ) : (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-500">
                {proposal.status === 'pending' && !isClient && 'Waiting for client decision...'}
                {proposal.status === 'accepted' && '✅ This proposal has been accepted'}
                {proposal.status === 'rejected' && '❌ This proposal has been rejected'}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Proposal Details */}
      <Card>
        <h2 className="text-xl font-semibold text-neutral-900 mb-4">Proposal Details</h2>
        <p className="text-neutral-700 whitespace-pre-wrap leading-relaxed">
          {proposal.proposal_text}
        </p>
      </Card>

      {/* Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Freelancer Info */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Freelancer</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Name</p>
              <p className="text-lg font-semibold text-neutral-900">
                {proposal.freelancer_name}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="text-neutral-900">{proposal.freelancer_email}</p>
            </div>
          </div>
        </Card>

        {/* Proposal Info */}
        <Card>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Proposal Information</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Bid Amount</p>
              <p className="text-lg font-semibold text-neutral-900">
                {formatCurrency(proposal.proposed_price)}
              </p>
            </div>
            {proposal.delivery_time && (
              <div>
                <p className="text-sm text-neutral-600">Delivery Time</p>
                <p className="text-neutral-900">{proposal.delivery_time}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-neutral-600">Type</p>
              <Badge variant="default">
                {proposal.proposal_type === 'public' ? 'Public Proposal' : 'Direct Offer'}
              </Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};