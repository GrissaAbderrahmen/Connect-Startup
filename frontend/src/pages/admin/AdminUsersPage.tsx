// pages/admin/AdminUsersPage.tsx
import { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/common/Spinner';
import { Badge } from '@/components/common/Badge';
import { adminAPI, AdminUser } from '@/services/api/admin';
import { formatDate } from '@/utils/formatters';
import {
    Users,
    Search,
    Briefcase,
    User,
    CheckCircle,
    XCircle,
    FileText,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

export const AdminUsersPage = () => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState<any>(null);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const params: any = { page };
            if (filter !== 'all') params.role = filter;
            if (search) params.search = search;

            const data = await adminAPI.getUsers(params);
            setUsers(data.data);
            setPagination(data.pagination);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to load users');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [filter, search, page]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'client':
                return <Badge className="bg-blue-100 text-blue-700"><Briefcase className="w-3 h-3 mr-1" /> Client</Badge>;
            case 'freelancer':
                return <Badge className="bg-green-100 text-green-700"><User className="w-3 h-3 mr-1" /> Freelancer</Badge>;
            default:
                return <Badge>{role}</Badge>;
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">👥 User Management</h1>
                    <p className="text-neutral-600">View and manage platform users</p>
                </div>

                {/* Filters and Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Role Filter */}
                    <div className="flex gap-2">
                        {['all', 'client', 'freelancer'].map((role) => (
                            <button
                                key={role}
                                onClick={() => { setFilter(role); setPage(1); }}
                                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === role
                                    ? 'bg-primary-500 text-white'
                                    : 'bg-white text-neutral-600 hover:bg-neutral-100'
                                    }`}
                            >
                                {role === 'all' ? 'All Users' : role + 's'}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {/* Stats */}
                {pagination && (
                    <p className="text-sm text-neutral-600 mb-4">
                        Showing {users.length} of {pagination.total} users
                    </p>
                )}

                {/* Loading */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Spinner size="lg" />
                    </div>
                ) : error ? (
                    <Card className="text-center py-8">
                        <p className="text-red-600">{error}</p>
                    </Card>
                ) : users.length === 0 ? (
                    <Card className="text-center py-12">
                        <Users className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                        <p className="text-neutral-600">No users found</p>
                    </Card>
                ) : (
                    <>
                        {/* Users Table */}
                        <Card className="overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-neutral-50 border-b border-neutral-200">
                                        <tr>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">User</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Role</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Verified</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Projects</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Contracts</th>
                                            <th className="text-left px-4 py-3 text-sm font-medium text-neutral-600">Joined</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-neutral-100">
                                        {users.map((user) => (
                                            <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                                <td className="px-4 py-4">
                                                    <div>
                                                        <p className="font-medium text-neutral-900">{user.name}</p>
                                                        <p className="text-sm text-neutral-500">{user.email}</p>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {getRoleBadge(user.role)}
                                                </td>
                                                <td className="px-4 py-4">
                                                    {user.is_verified ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <XCircle className="w-5 h-5 text-red-400" />
                                                    )}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1 text-neutral-600">
                                                        <Briefcase className="w-4 h-4" />
                                                        {user.project_count}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-1 text-neutral-600">
                                                        <FileText className="w-4 h-4" />
                                                        {user.contract_count}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-sm text-neutral-500">
                                                    {formatDate(user.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <span className="text-neutral-600">
                                    Page {page} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                    disabled={page === pagination.totalPages}
                                    className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
