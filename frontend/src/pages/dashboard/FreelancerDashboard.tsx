// pages/dashboard/FreelancerDashboard.tsx
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { useProposals } from '@/hooks/useProposals';
import { useContracts } from '@/hooks/useContracts';
import {
    Briefcase,
    FileText,
    Send,
    ArrowRight,
    Clock,
    CheckCircle,
    Star,
    DollarSign
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Spinner } from '@/components/common/Spinner';
import { formatCurrency, formatRelativeTime } from '@/utils/formatters';

export const FreelancerDashboard = () => {
    const { user } = useAuth();
    const { projects, isLoading: projectsLoading } = useProjects({ limit: 5 });
    const { proposals, isLoading: proposalsLoading } = useProposals();
    const { contracts, isLoading: contractsLoading } = useContracts();

    const activeContracts = contracts.filter(c => c.status === 'active');
    const pendingProposals = proposals.filter(p => p.status === 'pending');

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'primary' | 'success' | 'warning' | 'danger'> = {
            pending: 'warning',
            accepted: 'success',
            rejected: 'danger',
            completed: 'success',
        };
        return (
            <Badge variant={variants[status] || 'default'}>
                {status}
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
                        Here's your freelance overview for today.
                    </p>
                </div>
                <Link to="/projects">
                    <Button className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Browse Projects
                    </Button>
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Active Contracts</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {contractsLoading ? '-' : activeContracts.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-primary-100 text-primary-600">
                            <FileText className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Pending Proposals</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {proposalsLoading ? '-' : pendingProposals.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-accent-100 text-accent-600">
                            <Send className="w-5 h-5" />
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-neutral-500">Total Proposals</p>
                            <p className="text-2xl font-bold text-neutral-900 mt-1">
                                {proposalsLoading ? '-' : proposals.length}
                            </p>
                        </div>
                        <div className="p-3 rounded-lg bg-secondary-100 text-secondary-600">
                            <Star className="w-5 h-5" />
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
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Available Projects */}
                <div className="lg:col-span-2 bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-neutral-900">Available Projects</h2>
                                <p className="text-sm text-neutral-500">Browse and submit proposals</p>
                            </div>
                            <Link
                                to="/projects"
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
                            No open projects available.
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
                                            <p className="text-sm text-neutral-500">{project.category}</p>
                                            <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    {formatRelativeTime(project.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-semibold text-neutral-900">
                                                {formatCurrency(project.budget)}
                                            </p>
                                            <p className="text-xs text-neutral-500">Budget</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* My Proposals */}
                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-neutral-900">My Proposals</h2>
                            <Link
                                to="/proposals/my-proposals"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                    {proposalsLoading ? (
                        <div className="p-8 flex justify-center">
                            <Spinner />
                        </div>
                    ) : proposals.length === 0 ? (
                        <div className="p-8 text-center text-neutral-500">
                            No proposals yet.
                            <Link to="/projects" className="text-primary-600 hover:underline ml-1">
                                Browse projects
                            </Link>
                        </div>
                    ) : (
                        <div className="divide-y divide-neutral-100">
                            {proposals.slice(0, 5).map((proposal) => (
                                <Link
                                    key={proposal.id}
                                    to={`/proposals/${proposal.id}`}
                                    className="block p-4 hover:bg-neutral-50 transition-colors"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-neutral-900 truncate">
                                                {proposal.project_title}
                                            </h3>
                                            <p className="text-xs text-neutral-500 mt-1">
                                                {formatRelativeTime(proposal.created_at)}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {getStatusBadge(proposal.status)}
                                            <p className="text-sm font-medium text-neutral-900 mt-1">
                                                {formatCurrency(proposal.proposed_price)}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Active Contracts */}
            {activeContracts.length > 0 && (
                <div className="bg-white rounded-xl border border-neutral-200">
                    <div className="p-6 border-b border-neutral-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-neutral-900">Active Contracts</h2>
                            <Link
                                to="/contracts"
                                className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                            >
                                View All
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            {activeContracts.slice(0, 4).map((contract) => (
                                <Link
                                    key={contract.id}
                                    to={`/contracts/${contract.id}`}
                                    className="block p-4 border border-neutral-200 rounded-xl hover:border-primary-200 hover:shadow-sm transition-all"
                                >
                                    <h3 className="font-medium text-neutral-900">{contract.project_title}</h3>
                                    <p className="text-sm text-neutral-500 mt-1">Client: {contract.other_user_name}</p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                                        <span className="text-sm text-neutral-500 flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {formatRelativeTime(contract.created_at)}
                                        </span>
                                        <span className="font-semibold text-neutral-900 flex items-center gap-1">
                                            <DollarSign className="w-4 h-4" />
                                            {formatCurrency(contract.amount)}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Completion Banner */}
            <div className="bg-gradient-to-r from-accent-500 to-secondary-500 rounded-xl p-6 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Complete your profile to get more visibility
                        </h3>
                        <p className="text-accent-100 text-sm mt-1">
                            Add your skills, portfolio, and verify your accounts to stand out.
                        </p>
                    </div>
                    <Link to="/profile">
                        <Button className="bg-white text-accent-600 hover:bg-neutral-100">
                            Update Profile
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
