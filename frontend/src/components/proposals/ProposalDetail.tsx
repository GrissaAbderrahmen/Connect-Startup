// components/proposals/ProposalDetail.tsx
import { Link } from 'react-router-dom';
import { Proposal } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';
import { ProposalActions } from './ProposalActions';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, FileText, User } from 'lucide-react';

interface ProposalDetailProps {
  proposal: Proposal;
  onUpdate?: () => void;
}

export const ProposalDetail = ({ proposal, onUpdate }: ProposalDetailProps) => {
  const { user } = useAuth();
  const isClient = user?.id === proposal.client_id;
  const isFreelancer = user?.id === proposal.freelancer_id;
  const canTakeAction = isClient && proposal.status === 'pending';

  // Determine who to message based on user role
  const getMessageRecipient = () => {
    if (isClient) return proposal.freelancer_id;
    if (isFreelancer) return proposal.client_id;
    return null;
  };

  const messageRecipientId = getMessageRecipient();

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Proposal from {proposal.freelancer_name || 'Freelancer'}
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

          {/* Action Section */}
          {canTakeAction ? (
            <div className="pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 mb-3">
                Review this proposal and take action:
              </p>
              <ProposalActions proposal={proposal} onSuccess={onUpdate} />
            </div>
          ) : (
            <div className="pt-4 border-t border-neutral-200">
              {proposal.status === 'pending' && !isClient && (
                <p className="text-sm text-neutral-500">Waiting for client decision...</p>
              )}

              {proposal.status === 'accepted' && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-green-600 font-medium">✅ This proposal has been accepted</p>
                  {messageRecipientId && (
                    <Link to={`/messages/${messageRecipientId}`}>
                      <Button className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Message {isClient ? 'Freelancer' : 'Client'}
                      </Button>
                    </Link>
                  )}
                </div>
              )}

              {proposal.status === 'rejected' && (
                <p className="text-sm text-red-600">❌ This proposal has been rejected</p>
              )}
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
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Freelancer</h3>
            {proposal.freelancer_id && (
              <Link to={`/freelancers/${proposal.freelancer_id}`}>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  View Profile
                </Button>
              </Link>
            )}
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-neutral-600">Name</p>
              <p className="text-lg font-semibold text-neutral-900">
                {proposal.freelancer_name || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-600">Email</p>
              <p className="text-neutral-900">{proposal.freelancer_email || 'N/A'}</p>
            </div>
            {/* Message button for accepted proposals */}
            {proposal.status === 'accepted' && isClient && proposal.freelancer_id && (
              <Link to={`/messages/${proposal.freelancer_id}`} className="block pt-2">
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Send Message
                </Button>
              </Link>
            )}
          </div>
        </Card>

        {/* Client Info (for freelancers) */}
        {isFreelancer && (
          <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Client</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-neutral-600">Name</p>
                <p className="text-lg font-semibold text-neutral-900">
                  {proposal.client_name || 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="text-neutral-900">{proposal.client_email || 'N/A'}</p>
              </div>
              {/* Message button for accepted proposals */}
              {proposal.status === 'accepted' && proposal.client_id && (
                <Link to={`/messages/${proposal.client_id}`} className="block pt-2">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Send Message
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        )}

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

      {/* View Contract button if accepted */}
      {proposal.status === 'accepted' && (
        <Card className="bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-green-800">Contract Created</h3>
              <p className="text-sm text-green-700">A contract has been created from this proposal.</p>
            </div>
            <Link to="/contracts">
              <Button className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <FileText className="w-4 h-4" />
                View Contracts
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};