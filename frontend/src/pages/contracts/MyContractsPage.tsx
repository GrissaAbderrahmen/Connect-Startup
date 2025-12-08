// pages/contracts/MyContractsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContracts } from '@/hooks/useContracts';
import { ContractList } from '@/components/contracts/ContractList';
import { Pagination } from '@/components/common/Pagination';
import { Contract } from '@/types';

export const MyContractsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const { contracts, isLoading, error, pagination } = useContracts({ page, limit: 10 });

  const handleContractClick = (contract: Contract) => {
    navigate(`/contracts/${contract.id}`);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">My Contracts</h1>
          <p className="text-neutral-600 mt-2">
            View and manage your contracts ({pagination.total} total)
          </p>
        </div>

        {/* Contracts List */}
        <ContractList
          contracts={contracts}
          isLoading={isLoading}
          error={error}
          onContractClick={handleContractClick}
        />

        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};