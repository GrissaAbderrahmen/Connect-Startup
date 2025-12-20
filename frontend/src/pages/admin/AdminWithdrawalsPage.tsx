// pages/admin/AdminWithdrawalsPage.tsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { adminAPI, WithdrawalRequest } from '@/services/api/admin';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
    Clock,
    CheckCircle,
    XCircle,
    Building,
    User,
    AlertTriangle
} from 'lucide-react';

export const AdminWithdrawalsPage = () => {
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('pending');
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [rejectModal, setRejectModal] = useState<{ id: number; userName: string } | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    const fetchWithdrawals = async () => {
        try {
            setIsLoading(true);
            const data = await adminAPI.getWithdrawals(filter);
            setWithdrawals(data.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load withdrawals');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchWithdrawals();
    }, [filter]);

    const handleApprove = async (id: number) => {
        if (!confirm('Approve this withdrawal request?')) return;

        setProcessingId(id);
        try {
            await adminAPI.approveWithdrawal(id, 'Approved by admin');
            fetchWithdrawals();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to approve withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectModal || !rejectReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setProcessingId(rejectModal.id);
        try {
            await adminAPI.rejectWithdrawal(rejectModal.id, rejectReason);
            setRejectModal(null);
            setRejectReason('');
            fetchWithdrawals();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to reject withdrawal');
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">💸 Withdrawal Management</h1>
                    <p className="text-neutral-600">Approve or reject withdrawal requests (500+ TND)</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    {['pending', 'completed', 'rejected', 'all'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === status
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : withdrawals.length === 0 ? (
                    <Card className="text-center py-12">
                        <Building className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-600">No {filter !== 'all' ? filter : ''} withdrawal requests</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {withdrawals.map((wr) => (
                            <Card key={wr.id} className="hover:shadow-md transition-shadow">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <User className="w-5 h-5 text-neutral-400" />
                                            <span className="font-semibold text-neutral-900">{wr.user_name}</span>
                                            <span className="text-neutral-500 text-sm">{wr.user_email}</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-neutral-600">
                                            <span className="font-medium text-lg text-neutral-900">
                                                {formatCurrency(parseFloat(wr.amount))}
                                            </span>
                                            <span>•</span>
                                            <span>{wr.bank_name}</span>
                                            <span>•</span>
                                            <span>****{wr.account_number.slice(-4)}</span>
                                        </div>

                                        <p className="text-xs text-neutral-400 mt-2">
                                            Requested: {formatDate(wr.created_at)}
                                            {wr.processed_at && ` • Processed: ${formatDate(wr.processed_at)}`}
                                        </p>

                                        {wr.admin_notes && (
                                            <p className="text-sm text-neutral-600 mt-2 bg-neutral-50 p-2 rounded">
                                                Admin note: {wr.admin_notes}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(wr.status)}

                                        {wr.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => handleApprove(wr.id)}
                                                    isLoading={processingId === wr.id}
                                                    className="bg-green-600 hover:bg-green-700"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    onClick={() => setRejectModal({ id: wr.id, userName: wr.user_name })}
                                                    disabled={processingId === wr.id}
                                                >
                                                    <XCircle className="w-4 h-4 mr-1" />
                                                    Reject
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Reject Modal */}
                {rejectModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <Card className="w-full max-w-md mx-4">
                            <h3 className="text-lg font-semibold text-neutral-900 mb-4">
                                Reject Withdrawal for {rejectModal.userName}
                            </h3>
                            <p className="text-sm text-neutral-600 mb-4">
                                Please provide a reason for rejection. The amount will be refunded to the user's wallet.
                            </p>
                            <textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="Reason for rejection..."
                                rows={3}
                                className="w-full px-3 py-2 border border-neutral-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <div className="flex gap-3 justify-end">
                                <Button variant="outline" onClick={() => setRejectModal(null)}>
                                    Cancel
                                </Button>
                                <Button
                                    variant="danger"
                                    onClick={handleReject}
                                    isLoading={processingId === rejectModal.id}
                                >
                                    Reject & Refund
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};
