// pages/admin/AdminDisputesPage.tsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { adminAPI, Dispute } from '@/services/api/admin';
import { formatCurrency, formatDate } from '@/utils/formatters';
import {
    AlertTriangle,
    User,
    Briefcase,
    CheckCircle,
    XCircle
} from 'lucide-react';

export const AdminDisputesPage = () => {
    const [disputes, setDisputes] = useState<Dispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchDisputes = async () => {
        try {
            setIsLoading(true);
            const data = await adminAPI.getDisputes();
            setDisputes(data.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load disputes');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDisputes();
    }, []);

    const handleResolve = async (id: number, refundToClient: boolean) => {
        const action = refundToClient ? 'refund to client' : 'release to freelancer';
        if (!confirm(`Are you sure you want to ${action}?`)) return;

        setProcessingId(id);
        try {
            await adminAPI.resolveDispute(id, refundToClient);
            fetchDisputes();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to resolve dispute');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">⚠️ Dispute Resolution</h1>
                    <p className="text-neutral-600">Manage escrow disputes between clients and freelancers</p>
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
                ) : disputes.length === 0 ? (
                    <Card className="text-center py-12">
                        <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
                        <p className="text-neutral-600 text-lg">No active disputes! 🎉</p>
                        <p className="text-neutral-500 text-sm mt-2">All escrow transactions are running smoothly.</p>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {disputes.map((dispute) => (
                            <Card key={dispute.id} className="border-red-200 bg-red-50/30">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Dispute Info */}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Badge className="bg-red-100 text-red-700">
                                                <AlertTriangle className="w-3 h-3 mr-1" />
                                                Disputed
                                            </Badge>
                                            <span className="text-lg font-semibold text-neutral-900">
                                                {formatCurrency(parseFloat(dispute.amount))}
                                            </span>
                                        </div>

                                        {/* Project */}
                                        <div className="flex items-center gap-2 text-neutral-700 mb-3">
                                            <Briefcase className="w-4 h-4" />
                                            <span className="font-medium">{dispute.project_title}</span>
                                        </div>

                                        {/* Parties */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <p className="text-xs text-blue-600 font-medium mb-1">CLIENT</p>
                                                <p className="font-medium text-neutral-900">{dispute.client_name}</p>
                                                <p className="text-sm text-neutral-500">{dispute.client_email}</p>
                                            </div>
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <p className="text-xs text-green-600 font-medium mb-1">FREELANCER</p>
                                                <p className="font-medium text-neutral-900">{dispute.freelancer_name}</p>
                                                <p className="text-sm text-neutral-500">{dispute.freelancer_email}</p>
                                            </div>
                                        </div>

                                        <p className="text-xs text-neutral-400">
                                            Escrow created: {formatDate(dispute.created_at)}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <Button
                                            onClick={() => handleResolve(dispute.id, false)}
                                            isLoading={processingId === dispute.id}
                                            className="bg-green-600 hover:bg-green-700 w-full"
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Release to Freelancer
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleResolve(dispute.id, true)}
                                            disabled={processingId === dispute.id}
                                            className="w-full"
                                        >
                                            <XCircle className="w-4 h-4 mr-2" />
                                            Refund to Client
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
