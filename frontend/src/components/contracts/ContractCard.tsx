// components/contracts/ContractCard.tsx
import { Contract } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';

interface ContractCardProps {
  contract: Contract;
  onClick?: () => void;
}

export const ContractCard = ({ contract, onClick }: ContractCardProps) => {
  return (
    <Card hoverable onClick={onClick}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              {contract.project_title || 'Contract'}
            </h3>
            <p className="text-sm text-neutral-600">
              With: {contract.other_user_name}
            </p>
          </div>
          
          <div className="text-right ml-4">
            <div className="text-xl font-bold text-primary-600">
              {formatCurrency(contract.amount)}
            </div>
            <Badge 
              className={STATUS_COLORS[contract.status as keyof typeof STATUS_COLORS]}
            >
              {contract.status}
            </Badge>
          </div>
        </div>

        {/* Description */}
        {contract.job_description && (
          <p className="text-neutral-600 text-sm line-clamp-2">
            {contract.job_description}
          </p>
        )}

        {/* Dates */}
        <div className="flex gap-4 text-sm text-neutral-600">
          {contract.start_date && (
            <div>
              <span className="font-medium">Start:</span> {formatDate(contract.start_date)}
            </div>
          )}
          {contract.end_date && (
            <div>
              <span className="font-medium">End:</span> {formatDate(contract.end_date)}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-sm text-neutral-500 pt-3 border-t border-neutral-200">
          Created {formatDate(contract.created_at)}
        </div>
      </div>
    </Card>
  );
};