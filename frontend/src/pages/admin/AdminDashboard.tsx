// pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { adminAPI, DashboardStats } from '@/services/api/admin';
import {
    Users,
    Briefcase,
    FileText,
    Wallet,
    AlertTriangle,
    TrendingUp,
    Clock,
    CheckCircle,
    ArrowRight
} from 'lucide-react';

export const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await adminAPI.getDashboard();
                setStats(data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load dashboard');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner size="lg" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="text-center p-8">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600">{error || 'Failed to load dashboard'}</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">🛡️ Admin Dashboard</h1>
                    <p className="text-neutral-600">Platform overview and management</p>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Users</p>
                                <p className="text-3xl font-bold">{stats.users.total}</p>
                                <p className="text-blue-200 text-xs mt-1">
                                    {stats.users.clients} clients • {stats.users.freelancers} freelancers
                                </p>
                            </div>
                            <Users className="w-10 h-10 text-blue-200" />
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Projects</p>
                                <p className="text-3xl font-bold">{stats.projects.total}</p>
                                <p className="text-purple-200 text-xs mt-1">
                                    {stats.projects.open} open • {stats.projects.active} active
                                </p>
                            </div>
                            <Briefcase className="w-10 h-10 text-purple-200" />
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Total Contracts</p>
                                <p className="text-3xl font-bold">{stats.contracts.total}</p>
                                <p className="text-green-200 text-xs mt-1">
                                    {stats.contracts.completed} completed
                                </p>
                            </div>
                            <FileText className="w-10 h-10 text-green-200" />
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-amber-100 text-sm">Total Released</p>
                                <p className="text-3xl font-bold">{stats.escrow.totalReleased.toFixed(0)} TND</p>
                                <p className="text-amber-200 text-xs mt-1">
                                    {stats.escrow.totalInEscrow.toFixed(0)} TND in escrow
                                </p>
                            </div>
                            <Wallet className="w-10 h-10 text-amber-200" />
                        </div>
                    </Card>
                </div>

                {/* Action Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Pending Withdrawals */}
                    <Link to="/admin/withdrawals">
                        <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${stats.withdrawals.pendingCount > 0 ? 'border-amber-300 bg-amber-50' : ''
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-neutral-900">Pending Withdrawals</h3>
                                <Clock className={`w-5 h-5 ${stats.withdrawals.pendingCount > 0 ? 'text-amber-500' : 'text-neutral-400'}`} />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900">{stats.withdrawals.pendingCount}</p>
                            <p className="text-sm text-neutral-600 mt-1">
                                {stats.withdrawals.pendingAmount.toFixed(2)} TND pending
                            </p>
                            <div className="flex items-center text-primary-600 text-sm mt-3">
                                Manage withdrawals <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </Card>
                    </Link>

                    {/* Active Disputes */}
                    <Link to="/admin/disputes">
                        <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${stats.escrow.activeDisputes > 0 ? 'border-red-300 bg-red-50' : ''
                            }`}>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-neutral-900">Active Disputes</h3>
                                <AlertTriangle className={`w-5 h-5 ${stats.escrow.activeDisputes > 0 ? 'text-red-500' : 'text-neutral-400'}`} />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900">{stats.escrow.activeDisputes}</p>
                            <p className="text-sm text-neutral-600 mt-1">
                                Requires resolution
                            </p>
                            <div className="flex items-center text-primary-600 text-sm mt-3">
                                View disputes <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </Card>
                    </Link>

                    {/* User Management */}
                    <Link to="/admin/users">
                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-neutral-900">User Management</h3>
                                <Users className="w-5 h-5 text-neutral-400" />
                            </div>
                            <p className="text-3xl font-bold text-neutral-900">{stats.users.total}</p>
                            <p className="text-sm text-neutral-600 mt-1">
                                Registered users
                            </p>
                            <div className="flex items-center text-primary-600 text-sm mt-3">
                                Manage users <ArrowRight className="w-4 h-4 ml-1" />
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Recent Activity */}
                <Card>
                    <h2 className="text-lg font-semibold text-neutral-900 mb-4">📈 Last 7 Days</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">+{stats.recent.newUsers}</p>
                                <p className="text-sm text-neutral-600">New users</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Briefcase className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">+{stats.recent.newProjects}</p>
                                <p className="text-sm text-neutral-600">New projects</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-neutral-900">+{stats.recent.newContracts}</p>
                                <p className="text-sm text-neutral-600">New contracts</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
