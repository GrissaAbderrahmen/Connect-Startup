// components/escrow/EscrowActions.tsx
import { useState } from 'react';
import { EscrowTransaction } from '@/types';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { escrowAPI } from '@/services/api/escrow';
import { useAuth } from '@/context/AuthContext';
import {
    CreditCard,
    CheckCircle,
    Send,
    AlertTriangle,
    Info
} from 'lucide-react';

interface EscrowActionsProps {
    escrow: EscrowTransaction;
    contractId: number;
    onUpdate?: () => void;
}

export const EscrowActions = ({ escrow, contractId, onUpdate }: EscrowActionsProps) => {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isClient = user?.id === escrow.client_id;
    const isFreelancer = user?.id === escrow.freelancer_id;

    const handleAction = async (
        action: () => Promise<any>,
        confirmMessage: string,
        successMessage: string
    ) => {
        if (!confirm(confirmMessage)) return;

        setIsLoading(true);
        setError(null);

        try {
            await action();
            alert(successMessage);
            onUpdate?.();
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Action failed';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper to show what action is expected
    const getCurrentStepMessage = () => {
        if (escrow.status === 'pending_payment' && isClient) {
            return "Click 'Fund Escrow' to deposit the payment. The money will be held safely until the work is complete.";
        }
        if (escrow.status === 'pending_payment' && isFreelancer) {
            return "Waiting for client to fund the escrow. Once funded, you can start working.";
        }
        if (escrow.status === 'payment_received' && isFreelancer) {
            return "Client has funded the escrow! Complete the work and click 'Mark Work Completed'.";
        }
        if (escrow.status === 'payment_received' && isClient) {
            return "Payment received. Waiting for freelancer to complete the work.";
        }
        if (escrow.status === 'work_completed' && isClient) {
            return "Freelancer has completed the work. Review it and release the funds if satisfied.";
        }
        if (escrow.status === 'work_completed' && isFreelancer) {
            return "You've marked the work as complete. Waiting for client to release the funds.";
        }
        return null;
    };

    const stepMessage = getCurrentStepMessage();

    return (
        <Card>
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">🎯 Next Steps</h3>

            {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Current step guidance */}
            {stepMessage && (
                <div className="bg-blue-50 text-blue-700 p-3 rounded-lg mb-4 text-sm flex items-start gap-2">
                    <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {stepMessage}
                </div>
            )}

            <div className="space-y-3">
                {/* Client: Fund Escrow */}
                {isClient && escrow.status === 'pending_payment' && (
                    <Button
                        onClick={() => handleAction(
                            () => escrowAPI.confirmPayment(escrow.id),
                            'Fund the escrow? This will reserve the payment for the freelancer.',
                            'Escrow funded! The freelancer can now start working.'
                        )}
                        isLoading={isLoading}
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <CreditCard className="w-4 h-4" />
                        Fund Escrow ({escrow.amount} TND)
                    </Button>
                )}

                {/* Client: Release Funds */}
                {isClient && escrow.status === 'work_completed' && (
                    <Button
                        onClick={() => handleAction(
                            () => escrowAPI.releaseFunds(escrow.id),
                            'Release funds to freelancer? This cannot be undone.',
                            'Funds released! The freelancer will receive the payment.'
                        )}
                        isLoading={isLoading}
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700"
                    >
                        <Send className="w-4 h-4" />
                        Release Funds to Freelancer
                    </Button>
                )}

                {/* Freelancer: Mark Work Completed */}
                {isFreelancer && escrow.status === 'payment_received' && (
                    <Button
                        onClick={() => handleAction(
                            () => escrowAPI.markWorkCompleted(escrow.id),
                            'Mark work as completed? The client will be asked to review and release funds.',
                            'Work marked as completed! Waiting for client approval.'
                        )}
                        isLoading={isLoading}
                        variant="secondary"
                        className="w-full flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" />
                        Mark Work as Completed
                    </Button>
                )}

                {/* Dispute (both can raise) */}
                {(isClient || isFreelancer) &&
                    !['funds_released', 'refunded', 'disputed'].includes(escrow.status) && (
                        <Button
                            onClick={() => handleAction(
                                () => escrowAPI.dispute(escrow.id),
                                'Raise a dispute? This will freeze the escrow until resolved.',
                                'Dispute raised. An admin will review this case.'
                            )}
                            isLoading={isLoading}
                            variant="danger"
                            className="w-full flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Raise Dispute
                        </Button>
                    )}

                {/* Status messages */}
                {escrow.status === 'funds_released' && (
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                        <p className="text-green-700 font-medium">✅ Transaction Complete!</p>
                        <p className="text-green-600 text-sm">Funds have been released to the freelancer</p>
                    </div>
                )}
                {escrow.status === 'disputed' && (
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                        <p className="text-red-700 font-medium">⚠️ Under Dispute</p>
                        <p className="text-red-600 text-sm">An admin will review and resolve this case</p>
                    </div>
                )}
            </div>
        </Card>
    );
};
