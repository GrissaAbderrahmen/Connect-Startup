// components/contracts/ContractList.tsx
import { Contract } from '@/types';
import { ContractCard } from './ContractCard';
import { Spinner } from '@/components/common/Spinner';

interface ContractListProps {
  contracts: Contract[];
  isLoading: boolean;
  error: string | null;
  onContractClick?: (contract: Contract) => void;
}

export const ContractList = ({ 
  contracts, 
  isLoading, 
  error, 
  onContractClick 
}: ContractListProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (contracts.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500 text-lg">No contracts found</p>
        <p className="text-neutral-400 text-sm mt-2">
          Contracts will appear here when proposals are accepted
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contracts.map((contract) => (
        <ContractCard
          key={contract.id}
          contract={contract}
          onClick={() => onContractClick?.(contract)}
        />
      ))}
    </div>
  );
};