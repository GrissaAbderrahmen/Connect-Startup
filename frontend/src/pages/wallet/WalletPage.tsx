// pages/wallet/WalletPage.tsx
import { useState, useEffect } from 'react';
import { walletAPI, Wallet, WalletTransaction, WithdrawalRequest } from '@/services/api/wallet';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatters';
import {
    Wallet as WalletIcon,
    TrendingUp,
    ArrowDownCircle,
    ArrowUpCircle,
    Clock,
    CheckCircle,
    XCircle,
    Building,
    CreditCard
} from 'lucide-react';

export const WalletPage = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState<Wallet | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'transactions' | 'withdrawals' | 'withdraw'>('transactions');

    // Withdrawal form state
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolderName, setAccountHolderName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            const [walletData, transactionsData, withdrawalsData] = await Promise.all([
                walletAPI.getWallet(),
                walletAPI.getTransactions(),
                walletAPI.getWithdrawals()
            ]);
            setWallet(walletData);
            setTransactions(transactionsData.data);
            setWithdrawals(withdrawalsData.data);
        } catch (err: any) {
            console.error('Failed to fetch wallet data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setIsSubmitting(true);

        try {
            await walletAPI.withdraw({
                amount: parseFloat(withdrawAmount),
                bank_name: bankName,
                account_number: accountNumber,
                account_holder_name: accountHolderName
            });
            setSuccess('Withdrawal request submitted successfully!');
            setWithdrawAmount('');
            setBankName('');
            setAccountNumber('');
            setAccountHolderName('');
            fetchWalletData();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit withdrawal request');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getWithdrawalStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
            case 'processing':
                return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>;
            case 'completed':
                return <Badge className="bg-green-100 text-green-700"><CheckCircle className="w-3 h-3 mr-1" /> Completed</Badge>;
            case 'rejected':
                return <Badge className="bg-red-100 text-red-700"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    if (user?.role !== 'freelancer') {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <Card className="text-center p-8">
                    <WalletIcon className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-neutral-900 mb-2">Wallet Not Available</h2>
                    <p className="text-neutral-600">Only freelancers have access to the wallet feature.</p>
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    const availableBalance = parseFloat(wallet?.available_balance || '0');
    const totalEarned = parseFloat(wallet?.total_earned || '0');

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">💰 My Wallet</h1>
                    <p className="text-neutral-600">Manage your earnings and withdrawals</p>
                </div>

                {/* Balance Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-primary-100">Available Balance</p>
                            <WalletIcon className="w-6 h-6 text-primary-200" />
                        </div>
                        <p className="text-4xl font-bold">{availableBalance.toFixed(2)} TND</p>
                        <p className="text-primary-200 text-sm mt-2">Ready to withdraw</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-green-100">Total Earned</p>
                            <TrendingUp className="w-6 h-6 text-green-200" />
                        </div>
                        <p className="text-4xl font-bold">{totalEarned.toFixed(2)} TND</p>
                        <p className="text-green-200 text-sm mt-2">Lifetime earnings</p>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => setActiveTab('withdraw')}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-amber-100">Withdraw</p>
                            <ArrowUpCircle className="w-6 h-6 text-amber-200" />
                        </div>
                        <p className="text-2xl font-bold">Request Payout</p>
                        <p className="text-amber-200 text-sm mt-2">Min: 10 TND</p>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-neutral-200 pb-2">
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'transactions'
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                    >
                        Transaction History
                    </button>
                    <button
                        onClick={() => setActiveTab('withdrawals')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'withdrawals'
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                    >
                        Withdrawal Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('withdraw')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'withdraw'
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                            }`}
                    >
                        Make Withdrawal
                    </button>
                </div>

                {/* Transaction History Tab */}
                {activeTab === 'transactions' && (
                    <Card>
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Recent Transactions</h2>
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No transactions yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {transactions.map((tx) => (
                                    <div key={tx.id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'credit'
                                                ? 'bg-green-100'
                                                : 'bg-red-100'
                                                }`}>
                                                {tx.type === 'credit'
                                                    ? <ArrowDownCircle className="w-5 h-5 text-green-600" />
                                                    : <ArrowUpCircle className="w-5 h-5 text-red-600" />
                                                }
                                            </div>
                                            <div>
                                                <p className="font-medium text-neutral-900">{tx.description}</p>
                                                <p className="text-sm text-neutral-500">{formatDate(tx.created_at)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {tx.type === 'credit' ? '+' : ''}{parseFloat(tx.amount).toFixed(2)} TND
                                            </p>
                                            <p className="text-xs text-neutral-400">
                                                Balance: {parseFloat(tx.balance_after).toFixed(2)} TND
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Withdrawals Tab */}
                {activeTab === 'withdrawals' && (
                    <Card>
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Withdrawal History</h2>
                        {withdrawals.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                <Building className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No withdrawal requests yet</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-neutral-100">
                                {withdrawals.map((wr) => (
                                    <div key={wr.id} className="py-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-neutral-900">
                                                    {parseFloat(wr.amount).toFixed(2)} TND
                                                </p>
                                                <p className="text-sm text-neutral-500">
                                                    {wr.bank_name} • ****{wr.account_number.slice(-4)}
                                                </p>
                                            </div>
                                            {getWithdrawalStatusBadge(wr.status)}
                                        </div>
                                        <p className="text-xs text-neutral-400">
                                            Requested: {formatDate(wr.created_at)}
                                            {wr.processed_at && ` • Processed: ${formatDate(wr.processed_at)}`}
                                        </p>
                                        {wr.admin_notes && (
                                            <p className="text-sm text-neutral-600 mt-2 bg-neutral-50 p-2 rounded">
                                                Note: {wr.admin_notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                )}

                {/* Withdraw Tab */}
                {activeTab === 'withdraw' && (
                    <Card>
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">Request Withdrawal</h2>

                        {availableBalance < 10 ? (
                            <div className="text-center py-8">
                                <WalletIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                                <p className="text-neutral-600 mb-2">Minimum withdrawal is 10 TND</p>
                                <p className="text-neutral-500 text-sm">
                                    Current balance: {availableBalance.toFixed(2)} TND
                                </p>
                            </div>
                        ) : (
                            <form onSubmit={handleWithdraw} className="space-y-4 max-w-md">
                                {error && (
                                    <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
                                )}
                                {success && (
                                    <div className="p-3 bg-green-50 text-green-600 rounded-lg text-sm">{success}</div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Amount (TND)
                                    </label>
                                    <input
                                        type="number"
                                        min="10"
                                        max={availableBalance}
                                        step="0.01"
                                        value={withdrawAmount}
                                        onChange={(e) => setWithdrawAmount(e.target.value)}
                                        placeholder="Enter amount"
                                        required
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                    <p className="text-xs text-neutral-400 mt-1">
                                        Available: {availableBalance.toFixed(2)} TND
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Bank Name
                                    </label>
                                    <select
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        required
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select bank</option>
                                        <option value="STB">STB - Société Tunisienne de Banque</option>
                                        <option value="BNA">BNA - Banque Nationale Agricole</option>
                                        <option value="BIAT">BIAT - Banque Internationale Arabe de Tunisie</option>
                                        <option value="Amen Bank">Amen Bank</option>
                                        <option value="Attijari Bank">Attijari Bank</option>
                                        <option value="BH Bank">BH Bank</option>
                                        <option value="UIB">UIB - Union Internationale de Banques</option>
                                        <option value="La Poste">La Poste Tunisienne</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Account Number / RIB
                                    </label>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        placeholder="Enter your account number"
                                        required
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Account Holder Name
                                    </label>
                                    <input
                                        type="text"
                                        value={accountHolderName}
                                        onChange={(e) => setAccountHolderName(e.target.value)}
                                        placeholder="Name as shown on bank account"
                                        required
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    isLoading={isSubmitting}
                                    className="w-full"
                                >
                                    Request Withdrawal
                                </Button>

                                <p className="text-xs text-neutral-400 text-center">
                                    Withdrawals are usually processed within 1-3 business days
                                </p>
                            </form>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
};
