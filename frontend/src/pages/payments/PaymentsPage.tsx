// pages/payments/PaymentsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { escrowAPI } from '@/services/api/escrow';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
    CreditCard,
    CheckCircle,
    Clock,
    AlertTriangle,
    Wallet,
    ArrowRight
} from 'lucide-react';

interface EscrowPayment {
    id: number;
    contract_id: number;
    amount: number | string;
    status: string;
    created_at: string;
    freelancer_name?: string;
    project_title?: string;
}

// Helper to convert amount to number
const toNumber = (amount: number | string): number => {
    return typeof amount === 'string' ? parseFloat(amount) : amount;
};

const getStatusConfig = (status: string) => {
    switch (status) {
        case 'pending_payment':
            return { color: 'text-amber-600 bg-amber-100', icon: Clock, label: 'Awaiting Payment' };
        case 'payment_received':
            return { color: 'text-blue-600 bg-blue-100', icon: Wallet, label: 'Payment Received' };
        case 'work_completed':
            return { color: 'text-purple-600 bg-purple-100', icon: CheckCircle, label: 'Work Completed' };
        case 'funds_released':
            return { color: 'text-green-600 bg-green-100', icon: CheckCircle, label: 'Funds Released' };
        case 'disputed':
            return { color: 'text-red-600 bg-red-100', icon: AlertTriangle, label: 'Disputed' };
        case 'refunded':
            return { color: 'text-neutral-600 bg-neutral-100', icon: CreditCard, label: 'Refunded' };
        default:
            return { color: 'text-neutral-600 bg-neutral-100', icon: CreditCard, label: status };
    }
};

export const PaymentsPage = () => {
    const [payments, setPayments] = useState<EscrowPayment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Summary stats
    const totalPending = payments
        .filter(p => p.status === 'pending_payment')
        .reduce((sum, p) => sum + toNumber(p.amount), 0);

    const totalInEscrow = payments
        .filter(p => ['payment_received', 'work_completed'].includes(p.status))
        .reduce((sum, p) => sum + toNumber(p.amount), 0);

    const totalReleased = payments
        .filter(p => p.status === 'funds_released')
        .reduce((sum, p) => sum + toNumber(p.amount), 0);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                // This will fetch all escrow transactions for the client
                const response = await escrowAPI.getMyEscrows();
                setPayments(response.data || []);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load payments');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPayments();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">💳 Payments</h1>
                    <p className="text-neutral-600">Manage your escrow payments and transactions</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <Card className="bg-amber-50 border-amber-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-amber-100 rounded-lg">
                                <Clock className="w-6 h-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-600">Pending Payment</p>
                                <p className="text-2xl font-bold text-amber-700">{formatCurrency(totalPending)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Wallet className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-blue-600">In Escrow</p>
                                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalInEscrow)}</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-green-50 border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm text-green-600">Released</p>
                                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalReleased)}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Payments List */}
                <Card>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">Payment History</h2>

                    {payments.length === 0 ? (
                        <div className="text-center py-8">
                            <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                            <p className="text-neutral-600">No payments yet</p>
                            <p className="text-neutral-400 text-sm mt-1">
                                Payments will appear here when you accept proposals and fund escrows
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {payments.map((payment) => {
                                const config = getStatusConfig(payment.status);
                                const StatusIcon = config.icon;

                                return (
                                    <div key={payment.id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-2 rounded-lg ${config.color.split(' ')[1]}`}>
                                                <StatusIcon className={`w-5 h-5 ${config.color.split(' ')[0]}`} />
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">
                                                    Contract #{payment.contract_id}
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {formatDate(payment.created_at)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-semibold text-neutral-900">
                                                    {formatCurrency(toNumber(payment.amount))}
                                                </p>
                                                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <Link
                                                to={`/contracts/${payment.contract_id}`}
                                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                            >
                                                <ArrowRight className="w-5 h-5 text-neutral-400" />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
