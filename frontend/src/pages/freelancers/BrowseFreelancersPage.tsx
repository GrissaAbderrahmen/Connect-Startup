// pages/freelancers/BrowseFreelancersPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Star,
    MapPin,
    Briefcase,
    Filter,
    ChevronDown,
    CheckCircle
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/common/Spinner';
import { Pagination } from '@/components/common/Pagination';
import { useFreelancers } from '@/hooks/useFreelancers';
import { FreelancerSearchFilters } from '@/types/freelancer';
import { formatCurrency } from '@/utils/formatters';

export const BrowseFreelancersPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FreelancerSearchFilters & { page?: number; limit?: number }>({
        page: 1,
        limit: 12,
    });

    const { freelancers, isLoading, error, pagination } = useFreelancers(filters);

    const categories = [
        'All Categories',
        'Web Development',
        'Mobile Development',
        'Design & Creative',
        'Digital Marketing',
        'Writing & Content',
        'AI & Machine Learning',
        'Video & Animation'
    ];

    const handleSearch = () => {
        setFilters({
            ...filters,
            query: searchQuery,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            page: 1,
        });
    };

    const handlePageChange = (page: number) => {
        setFilters({ ...filters, page });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-neutral-900">Find Freelancers</h1>
                <p className="text-neutral-600 mt-1">
                    Browse verified freelancers and find the perfect match for your project.
                </p>
            </div>

            {/* Search and Filters */}
            <Card className="!p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Search by name, skill, or title..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none pl-4 pr-10 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat.toLowerCase().replace(/ /g, '-')}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                    </div>
                    <Button onClick={handleSearch}>Search</Button>
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filters
                    </Button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-neutral-200 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-1 block">Hourly Rate</label>
                            <select
                                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (value === 'any') {
                                        setFilters({ ...filters, min_rate: undefined, max_rate: undefined });
                                    } else {
                                        const [min, max] = value.split('-').map(Number);
                                        setFilters({ ...filters, min_rate: min, max_rate: max || undefined });
                                    }
                                }}
                            >
                                <option value="any">Any rate</option>
                                <option value="0-20">Under 20 TND/hr</option>
                                <option value="20-40">20-40 TND/hr</option>
                                <option value="40-60">40-60 TND/hr</option>
                                <option value="60">60+ TND/hr</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-1 block">Rating</label>
                            <select
                                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilters({ ...filters, min_rating: value === 'any' ? undefined : Number(value) });
                                }}
                            >
                                <option value="any">Any rating</option>
                                <option value="4.5">4.5+ stars</option>
                                <option value="4.0">4.0+ stars</option>
                                <option value="3.5">3.5+ stars</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-1 block">Location</label>
                            <select
                                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilters({ ...filters, location: value === 'all' ? undefined : value });
                                }}
                            >
                                <option value="all">All Tunisia</option>
                                <option value="Tunis">Tunis</option>
                                <option value="Sfax">Sfax</option>
                                <option value="Sousse">Sousse</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-neutral-700 mb-1 block">Verification</label>
                            <select
                                className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFilters({ ...filters, is_verified: value === 'verified' ? true : undefined });
                                }}
                            >
                                <option value="all">All freelancers</option>
                                <option value="verified">Verified only</option>
                            </select>
                        </div>
                    </div>
                )}
            </Card>

            {/* Results */}
            {isLoading ? (
                <div className="py-12 flex justify-center">
                    <Spinner />
                </div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : freelancers.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Search className="w-8 h-8 text-neutral-400" />
                    </div>
                    <h3 className="text-lg font-medium text-neutral-900 mb-2">No freelancers found</h3>
                    <p className="text-neutral-600">
                        Try adjusting your search or filters.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {freelancers.map((freelancer) => (
                            <Link
                                key={freelancer.id}
                                to={`/freelancers/${freelancer.id}`}
                                className="block"
                            >
                                <Card hoverable className="h-full">
                                    <div className="flex items-start gap-4">
                                        <div className="relative flex-shrink-0">
                                            <Avatar name={freelancer.name} size="xl" />
                                            {freelancer.is_verified && (
                                                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white">
                                                    <CheckCircle className="w-3 h-3 text-white" />
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-neutral-900 truncate">
                                                {freelancer.name}
                                            </h3>
                                            <p className="text-sm text-neutral-600 truncate">{freelancer.bio?.slice(0, 50)}</p>
                                            {freelancer.average_rating && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-sm font-medium text-neutral-900">{freelancer.average_rating}</span>
                                                    <span className="text-sm text-neutral-500">({freelancer.total_reviews})</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {freelancer.bio && (
                                        <p className="text-sm text-neutral-600 mt-4 line-clamp-2">
                                            {freelancer.bio}
                                        </p>
                                    )}

                                    {freelancer.skills && freelancer.skills.length > 0 && (
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {freelancer.skills.slice(0, 3).map((skill) => (
                                                <Badge key={skill} variant="default">{skill}</Badge>
                                            ))}
                                            {freelancer.skills.length > 3 && (
                                                <Badge variant="default">+{freelancer.skills.length - 3}</Badge>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-neutral-100">
                                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                                            {freelancer.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="w-4 h-4" />
                                                    {freelancer.location.split(',')[0]}
                                                </span>
                                            )}
                                            {freelancer.completed_projects !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <Briefcase className="w-4 h-4" />
                                                    {freelancer.completed_projects}
                                                </span>
                                            )}
                                        </div>
                                        {freelancer.hourly_rate && (
                                            <span className="font-semibold text-primary-600">
                                                {formatCurrency(freelancer.hourly_rate)}/hr
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {pagination.totalPages > 1 && (
                        <Pagination
                            currentPage={pagination.page}
                            totalPages={pagination.totalPages}
                            onPageChange={handlePageChange}
                        />
                    )}
                </>
            )}
        </div>
    );
};
