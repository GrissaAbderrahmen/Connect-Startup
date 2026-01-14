// components/escrow/EscrowStatus.tsx
import { EscrowTransaction } from '@/types';
import { Card } from '@/components/common/Card';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
    CreditCard,
    Clock,
    CheckCircle,
    AlertTriangle,
    Wallet,
    ArrowRight
} from 'lucide-react';

interface EscrowStatusProps {
    escrow: EscrowTransaction | null;
    isLoading: boolean;
}

// Define status workflow steps
const ESCROW_STEPS = [
    { key: 'pending_payment', label: 'Awaiting Payment', icon: CreditCard },
    { key: 'payment_received', label: 'Payment Received', icon: Wallet },
    { key: 'work_completed', label: 'Work Completed', icon: Clock },
    { key: 'funds_released', label: 'Funds Released', icon: CheckCircle },
];

const getStatusIndex = (status: string): number => {
    const index = ESCROW_STEPS.findIndex(s => s.key === status);
    return index >= 0 ? index : -1;
};

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'pending_payment': return 'text-amber-600 bg-amber-100';
        case 'payment_received': return 'text-blue-600 bg-blue-100';
        case 'work_completed': return 'text-purple-600 bg-purple-100';
        case 'funds_released': return 'text-green-600 bg-green-100';
        case 'disputed': return 'text-red-600 bg-red-100';
        case 'refunded': return 'text-neutral-600 bg-neutral-100';
        default: return 'text-neutral-600 bg-neutral-100';
    }
};

export const EscrowStatus = ({ escrow, isLoading }: EscrowStatusProps) => {
    // Feature flag: hide escrow status when payments are disabled
    const paymentsEnabled = import.meta.env.VITE_ENABLE_PAYMENTS === 'true';
    if (!paymentsEnabled) {
        return null;
    }

    if (isLoading) {
        return (
            <Card>
                <div className="animate-pulse">
                    <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
                    <div className="h-10 bg-neutral-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
                </div>
            </Card>
        );
    }

    if (!escrow) {
        return (
            <Card className="bg-neutral-50">
                <div className="text-center py-4">
                    <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-neutral-600">No escrow found for this contract</p>
                    <p className="text-neutral-400 text-sm mt-1">Escrow is created when a proposal is accepted</p>
                </div>
            </Card>
        );
    }

    const currentStepIndex = getStatusIndex(escrow.status);
    const isDisputed = escrow.status === 'disputed';
    const isRefunded = escrow.status === 'refunded';

    return (
        <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">💰 Escrow Status</h3>

            {/* Amount Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg">
                <p className="text-sm text-primary-600 mb-1">Escrow Amount</p>
                <p className="text-3xl font-bold text-primary-700">
                    {formatCurrency(escrow.amount)}
                </p>
            </div>

            {/* Status Badge */}
            <div className="mb-4">
                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(escrow.status)}`}>
                    {escrow.status === 'disputed' && <AlertTriangle className="w-4 h-4" />}
                    {escrow.status.replace(/_/g, ' ').toUpperCase()}
                </span>
            </div>

            {/* Progress Steps */}
            {!isDisputed && !isRefunded && (
                <div className="mb-4">
                    <p className="text-sm text-neutral-600 mb-3">Payment Progress:</p>
                    <div className="flex items-center justify-between">
                        {ESCROW_STEPS.map((step, index) => {
                            const StepIcon = step.icon;
                            const isCompleted = index <= currentStepIndex;
                            const isCurrent = index === currentStepIndex;

                            return (
                                <div key={step.key} className="flex items-center">
                                    <div className={`
                    flex flex-col items-center
                    ${isCompleted ? 'text-primary-600' : 'text-neutral-300'}
                  `}>
                                        <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      ${isCurrent ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                                                isCompleted ? 'bg-primary-100' : 'bg-neutral-100'}
                    `}>
                                            <StepIcon className="w-4 h-4" />
                                        </div>
                                        <span className="text-xs mt-1 text-center max-w-16 leading-tight">
                                            {step.label}
                                        </span>
                                    </div>
                                    {index < ESCROW_STEPS.length - 1 && (
                                        <ArrowRight className={`
                      w-4 h-4 mx-1 mt-[-16px]
                      ${index < currentStepIndex ? 'text-primary-400' : 'text-neutral-200'}
                    `} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Disputed/Refunded Message */}
            {isDisputed && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    ⚠️ This escrow is under dispute. An admin will review and resolve the issue.
                </div>
            )}
            {isRefunded && (
                <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-700">
                    💸 This escrow has been refunded to the client.
                </div>
            )}

            {/* Created Date */}
            <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="text-xs text-neutral-500">
                    Created: {formatDate(escrow.created_at)}
                </p>
            </div>
        </Card>
    );
};
