// components/escrow/EscrowStatus.tsx
import { EscrowTransaction } from '@/types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { STATUS_COLORS } from '@/utils/constants';

interface EscrowStatusProps {
  escrow: EscrowTransaction | null;
  isLoading: boolean;
}

export const EscrowStatus = ({ escrow, isLoading }: EscrowStatusProps) => {
  if (isLoading) {
    return <Card><p className="text-neutral-600">Loading escrow...</p></Card>;
  }

  if (!escrow) {
    return (
      <Card>
        <p className="text-neutral-600">No escrow found for this contract</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Escrow Status</h3>
      <div className="space-y-3">
        <div>
          <p className="text-sm text-neutral-600">Escrow Amount</p>
          <p className="text-2xl font-bold text-primary-600">
            {formatCurrency(escrow.amount)}
          </p>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Status</p>
          <Badge className={STATUS_COLORS[escrow.status as keyof typeof STATUS_COLORS]}>
            {escrow.status.replace(/_/g, ' ')}
          </Badge>
        </div>
        <div>
          <p className="text-sm text-neutral-600">Created</p>
          <p className="text-neutral-900">{formatDate(escrow.created_at)}</p>
        </div>
      </div>
    </Card>
  );
};
