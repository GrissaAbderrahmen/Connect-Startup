// components/contracts/ContractStatus.tsx
import { Badge } from '@/components/common/Badge';
import { STATUS_COLORS } from '@/utils/constants';
import { ContractStatus as Status } from '@/types';

interface ContractStatusProps {
  status: Status;
}

export const ContractStatus = ({ status }: ContractStatusProps) => {
  return (
    <Badge className={STATUS_COLORS[status as keyof typeof STATUS_COLORS]}>
      {status}
    </Badge>
  );
};