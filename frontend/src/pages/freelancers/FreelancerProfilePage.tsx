// pages/freelancers/FreelancerProfilePage.tsx
import { useParams, Link } from 'react-router-dom';
import {
    Star,
    MapPin,
    Briefcase,
    CheckCircle,
    ExternalLink,
    MessageSquare,
    Calendar,
    Clock,
    Award,
    Github,
    Linkedin,
    Globe
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useFreelancerProfile } from '@/hooks/useFreelancers';
import { formatCurrency, formatDate } from '@/utils/formatters';

export const FreelancerProfilePage = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const freelancerId = id ? parseInt(id) : null;

    const { freelancer, reviews, isLoading, error } = useFreelancerProfile(freelancerId);

    const isOwnProfile = user?.id === freelancerId;

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-12 flex justify-center">
                <Spinner />
            </div>
        );
    }

    if (error || !freelancer) {
        return (
            <div className="max-w-5xl mx-auto py-12 text-center">
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Profile not found</h2>
                <p className="text-neutral-600">{error || 'This freelancer profile does not exist.'}</p>
                <Link to="/freelancers" className="text-primary-600 hover:text-primary-700 mt-4 inline-block">
                    ← Back to Freelancers
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Profile Header */}
            <Card className="!p-0 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-500 to-accent-500"></div>
                <div className="px-6 pb-6">
                    <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12">
                        <div className="relative flex-shrink-0">
                            <Avatar name={freelancer.name} size="xl" className="!w-24 !h-24 border-4 border-white shadow-lg" />
                            {freelancer.is_verified && (
                                <span className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white">
                                    <CheckCircle className="w-4 h-4 text-white" />
                                </span>
                            )}
                        </div>

                        <div className="flex-1 pt-4 md:pt-0">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold text-neutral-900">{freelancer.name}</h1>
                                        {freelancer.is_verified && (
                                            <Badge variant="primary">Verified</Badge>
                                        )}
                                    </div>
                                    <p className="text-neutral-600">{freelancer.bio?.slice(0, 60)}</p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-neutral-500">
                                        {freelancer.location && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                {freelancer.location}
                                            </span>
                                        )}
                                        {freelancer.member_since && (
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-4 h-4" />
                                                Member since {formatDate(freelancer.member_since)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    {!isOwnProfile && user?.role === 'client' && (
                                        <>
                                            <Link to={`/messages/${freelancer.id}`}>
                                                <Button variant="outline" className="flex items-center gap-2">
                                                    <MessageSquare className="w-4 h-4" />
                                                    Message
                                                </Button>
                                            </Link>
                                            <Button className="flex items-center gap-2">
                                                <Briefcase className="w-4 h-4" />
                                                Hire Me
                                            </Button>
                                        </>
                                    )}
                                    {isOwnProfile && (
                                        <Link to="/profile">
                                            <Button>Edit Profile</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* About */}
                    <Card>
                        <h2 className="text-lg font-semibold text-neutral-900 mb-4">About</h2>
                        <p className="text-neutral-600 whitespace-pre-line">{freelancer.bio || 'No bio provided.'}</p>
                    </Card>

                    {/* Skills */}
                    {freelancer.skills && freelancer.skills.length > 0 && (
                        <Card>
                            <h2 className="text-lg font-semibold text-neutral-900 mb-4">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {freelancer.skills.map((skill) => (
                                    <Badge key={skill} variant="primary">{skill}</Badge>
                                ))}
                            </div>
                        </Card>
                    )}

                    {/* Reviews */}
                    {reviews.length > 0 && (
                        <Card>
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-semibold text-neutral-900">Reviews</h2>
                                <div className="flex items-center gap-2">
                                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold text-neutral-900">{freelancer.average_rating || 'N/A'}</span>
                                    <span className="text-neutral-500">({freelancer.total_reviews || 0} reviews)</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {reviews.map((review) => (
                                    <div key={review.id} className="border-b border-neutral-100 pb-4 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Avatar name="Client" size="sm" />
                                                <span className="font-medium text-neutral-900">Client</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-200'}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        {review.review_text && (
                                            <p className="text-neutral-600 text-sm">{review.review_text}</p>
                                        )}
                                        <p className="text-xs text-neutral-400 mt-2">
                                            {formatDate(review.created_at)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stats Card */}
                    <Card>
                        {freelancer.hourly_rate && (
                            <div className="text-center mb-6">
                                <div className="text-3xl font-bold text-primary-600">{formatCurrency(freelancer.hourly_rate)}</div>
                                <p className="text-neutral-500 text-sm">per hour</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-600 flex items-center gap-2">
                                    <Star className="w-4 h-4" />
                                    Rating
                                </span>
                                <span className="font-semibold text-neutral-900">{freelancer.average_rating || 'N/A'}/5</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-600 flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    Projects
                                </span>
                                <span className="font-semibold text-neutral-900">{freelancer.completed_projects || 0}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                                <span className="text-neutral-600 flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    Response Time
                                </span>
                                <span className="font-semibold text-neutral-900">{freelancer.response_time || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-neutral-600 flex items-center gap-2">
                                    <Award className="w-4 h-4" />
                                    Reviews
                                </span>
                                <span className="font-semibold text-neutral-900">{freelancer.total_reviews || 0}</span>
                            </div>
                        </div>
                    </Card>

                    {/* Social Links */}
                    {freelancer.social_links && Object.keys(freelancer.social_links).length > 0 && (
                        <Card>
                            <h3 className="font-semibold text-neutral-900 mb-4">Connect</h3>
                            <div className="space-y-3">
                                {freelancer.social_links.github && (
                                    <a
                                        href={freelancer.social_links.github}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-neutral-600 hover:text-primary-600 transition-colors"
                                    >
                                        <Github className="w-5 h-5" />
                                        <span>GitHub</span>
                                        <ExternalLink className="w-4 h-4 ml-auto" />
                                    </a>
                                )}
                                {freelancer.social_links.linkedin && (
                                    <a
                                        href={freelancer.social_links.linkedin}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-neutral-600 hover:text-primary-600 transition-colors"
                                    >
                                        <Linkedin className="w-5 h-5" />
                                        <span>LinkedIn</span>
                                        <ExternalLink className="w-4 h-4 ml-auto" />
                                    </a>
                                )}
                                {freelancer.social_links.website && (
                                    <a
                                        href={freelancer.social_links.website}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-3 text-neutral-600 hover:text-primary-600 transition-colors"
                                    >
                                        <Globe className="w-5 h-5" />
                                        <span>Website</span>
                                        <ExternalLink className="w-4 h-4 ml-auto" />
                                    </a>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Verification Badge */}
                    {freelancer.is_verified && (
                        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-lg border border-primary-200 p-6">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-neutral-900">Verified Freelancer</h3>
                                    <p className="text-xs text-neutral-600">Identity & skills confirmed</p>
                                </div>
                            </div>
                            <p className="text-sm text-neutral-600">
                                This freelancer has been verified through Connect's verification process.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
