// pages/dashboard/ClientDashboard.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useContracts } from '@/hooks/useContracts';
import {
    Briefcase,
    FileText,
    CreditCard,
    Users,
    ArrowRight,
    Plus,
    Clock
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';

export const ClientDashboard = () => {
    const { user } = useAuth();
    const { projects, isLoading: projectsLoading } = useProjects({ limit: 5 });
    const { contracts, isLoading: contractsLoading } = useContracts();

    const activeProjects = projects.filter(p => p.status === 'open' || p.status === 'in_progress');
    const activeContracts = contracts.filter(c => c.status === 'active');

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
            open: 'primary',
            in_progress: 'warning',
            completed: 'success',
            cancelled: 'danger',
        };
        return (
            <Badge variant={variants[status] || 'default'}>
                {status.replace(/_/g, ' ')}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {/* Welcome Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">
                        Welcome back, {user?.name}! 👋
                    </h1>
                    <p className="text-neutral-600 mt-1">
                        Here's what's happening with your projects today.
                    </p>
                </div>
                <Link to="/projects/create">
                    <Button className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Post New Project
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Active Projects</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {projectsLoading ? '-' : activeProjects.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
                            <Briefcase className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Active Contracts</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {contractsLoading ? '-' : activeContracts.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-accent-100 text-accent-600">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Projects</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {projectsLoading ? '-' : projects.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary-100 text-secondary-600">
                            <Users className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Contracts</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {contractsLoading ? '-' : contracts.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
                            <CreditCard className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Recent Projects */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-neutral-900">Recent Projects</h2>
                            <Link
                                to="/my-projects"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {projectsLoading ? (
                        <div className="p-8 flex justify-center">
                            <Spinner />
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            No projects yet.
                            <Link to="/projects/create" className="text-primary-600 hover:underline ml-1">
                                Create your first project
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {projects.slice(0, 5).map((project) => (
                                <Link
                                    key={project.id}
                                    to={`/projects/${project.id}`}
                                    className="block p-6 hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-neutral-900 truncate">
                                                {project.title}
                                            </h3>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatRelativeTime(project.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(project.status)}
                                            <p className="text-sm font-medium text-neutral-900 mt-2">
                                                {formatCurrency(project.budget)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Recent Contracts */}
                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-100">
                        <h2 className="text-lg font-semibold text-neutral-900">Active Contracts</h2>
                    </div>

                    {contractsLoading ? (
                        <div className="p-8 flex justify-center">
                            <Spinner />
                        </div>
                    ) : activeContracts.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            No active contracts yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {activeContracts.slice(0, 5).map((contract) => (
                                <Link
                                    key={contract.id}
                                    to={`/contracts/${contract.id}`}
                                    className="block p-4 hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-neutral-900 truncate">
                                                {contract.project_title}
                                            </h3>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                With {contract.other_user_name}
                                            </p>
                                        </div>
                                        <p className="text-sm font-medium text-primary-600">
                                            {formatCurrency(contract.amount)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold">Need to hire quickly?</h3>
                        <p className="text-primary-100 text-sm mt-1">
                            Browse verified freelancers and send direct proposals.
                        </p>
                    </div>
                    <Link to="/freelancers">
                        <Button className="bg-white text-primary-600 hover:bg-neutral-100">
                            <Users className="w-4 h-4 mr-2" />
                            Browse Freelancers
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
