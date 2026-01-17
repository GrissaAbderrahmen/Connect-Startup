// pages/HomePage.tsx
import { Link } from 'react-router-dom';
import {
    Shield,
    Users,
    Zap,
    MessageSquare,
    Star,
    CreditCard,
    CheckCircle,
    ArrowRight,
    Code,
    Palette,
    TrendingUp,
    PenTool,
    Video,
    Brain
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export const HomePage = () => {
    const features = [
        {
            icon: Shield,
            title: 'Verified Freelancers',
            description: 'Every freelancer is verified through GitHub, Behance, or LinkedIn. No fake profiles.',
        },
        {
            icon: Zap,
            title: 'AI Matching',
            description: 'Post your project and our AI suggests the best-matched freelancers for your needs.',
        },
        {
            icon: CreditCard,
            title: 'Secure Escrow',
            description: 'Pay safely with escrow protection. Money is released only when work is approved.',
        },
        {
            icon: MessageSquare,
            title: 'In-Platform Messaging',
            description: 'Communicate, share files, and manage projects all within the platform.',
        },
        {
            icon: Star,
            title: 'Ratings & Reviews',
            description: 'Transparent ratings help you make informed decisions about who to work with.',
        },
        {
            icon: Users,
            title: 'Tunisian Community',
            description: 'Built for Tunisia, supporting local talent and businesses to thrive together.',
        },
    ];

    const categories = [
        { icon: Code, name: 'Web Development', count: '150+ freelancers' },
        { icon: Palette, name: 'Design & Creative', count: '120+ freelancers' },
        { icon: TrendingUp, name: 'Digital Marketing', count: '80+ freelancers' },
        { icon: PenTool, name: 'Writing & Content', count: '90+ freelancers' },
        { icon: Video, name: 'Video & Animation', count: '60+ freelancers' },
        { icon: Brain, name: 'AI & Machine Learning', count: '40+ freelancers' },
    ];

    const howItWorksClient = [
        { step: '1', title: 'Post Your Project', description: 'Describe what you need and set your budget.' },
        { step: '2', title: 'Receive Proposals', description: 'Get offers from verified freelancers.' },
        { step: '3', title: 'Hire & Pay Securely', description: 'Choose the best fit and pay via escrow.' },
    ];

    const howItWorksFreelancer = [
        { step: '1', title: 'Create Your Profile', description: 'Showcase your skills and portfolio.' },
        { step: '2', title: 'Get Verified', description: 'Link GitHub, Behance, or portfolio.' },
        { step: '3', title: 'Start Earning', description: 'Find projects and get paid securely.' },
    ];

    const stats = [
        { value: '500+', label: 'Verified Freelancers' },
        { value: '1,000+', label: 'Projects Completed' },
        { value: '100%', label: 'Secure Payments' },
        { value: '4.9', label: 'Average Rating' },
    ];

    return (
        <div className="bg-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500 rounded-full blur-3xl"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="text-center">
                        {/* Trust Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-full mb-8">
                            <Shield className="w-4 h-4 text-primary-400" />
                            <span className="text-sm text-primary-400 font-medium">Built for Trust</span>
                        </div>

                        {/* Main Headline */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                            Tunisia's Trusted
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">
                                Freelance Platform
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10">
                            Connect with verified freelancers and pay securely with escrow protection.
                            No scams. No fake profiles. Just quality work, guaranteed.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/signup?role=client">
                                <Button size="lg" className="min-w-[180px] text-base">
                                    Find Talent
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/signup?role=freelancer">
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="min-w-[180px] text-base border-neutral-600 text-white hover:bg-neutral-800"
                                >
                                    Start Earning
                                </Button>
                            </Link>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                                        {stat.value}
                                    </div>
                                    <div className="text-sm text-neutral-400">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                    </svg>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            How It Works
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            Simple, secure, and straightforward. Get started in minutes.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
                        {/* For Clients */}
                        <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm">
                                    C
                                </span>
                                For Clients
                            </h3>
                            <div className="space-y-6">
                                {howItWorksClient.map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-primary-600 shadow-sm">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                                            <p className="text-neutral-600 text-sm">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* For Freelancers */}
                        <div className="bg-gradient-to-br from-accent-50 to-secondary-50 rounded-2xl p-8">
                            <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 bg-accent-500 text-white rounded-lg flex items-center justify-center text-sm">
                                    F
                                </span>
                                For Freelancers
                            </h3>
                            <div className="space-y-6">
                                {howItWorksFreelancer.map((item) => (
                                    <div key={item.step} className="flex gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-accent-600 shadow-sm">
                                            {item.step}
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-neutral-900">{item.title}</h4>
                                            <p className="text-neutral-600 text-sm">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Escrow Explanation */}
            <section className="py-20 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-100 rounded-full mb-6">
                            <CreditCard className="w-4 h-4 text-secondary-600" />
                            <span className="text-sm text-secondary-700 font-medium">Secure Payments</span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            Protected by Escrow
                        </h2>
                        <p className="text-lg text-neutral-600 mb-12">
                            Our escrow system protects both clients and freelancers. Money is held securely
                            until the work is completed and approved.
                        </p>

                        {/* Escrow Flow */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">💼</span>
                                    </div>
                                    <p className="font-medium text-neutral-900">Client Pays</p>
                                    <p className="text-sm text-neutral-500">Funds held safely</p>
                                </div>

                                <ArrowRight className="w-6 h-6 text-neutral-300 rotate-90 md:rotate-0" />

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                    <p className="font-medium text-neutral-900">Connect Holds</p>
                                    <p className="text-sm text-neutral-500">In escrow</p>
                                </div>

                                <ArrowRight className="w-6 h-6 text-neutral-300 rotate-90 md:rotate-0" />

                                <div className="text-center">
                                    <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-2xl">✅</span>
                                    </div>
                                    <p className="font-medium text-neutral-900">Work Approved</p>
                                    <p className="text-sm text-neutral-500">Funds released</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            Why Choose Connect?
                        </h2>
                        <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
                            We've built the platform that Tunisia's freelance market deserves.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="group p-6 bg-white border border-neutral-200 rounded-xl hover:border-primary-200 hover:shadow-teal transition-all duration-300"
                            >
                                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-500 transition-colors">
                                    <feature.icon className="w-6 h-6 text-primary-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-neutral-600 text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="py-20 bg-neutral-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
                            Browse by Category
                        </h2>
                        <p className="text-lg text-neutral-600">
                            Find the perfect freelancer for any type of project.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                        {categories.map((category) => (
                            <Link
                                key={category.name}
                                to={`/freelancers?category=${encodeURIComponent(category.name)}`}
                                className="group p-4 sm:p-6 min-h-[100px] bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-teal text-center transition-all duration-300 flex flex-col items-center justify-center"
                            >
                                <category.icon className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="font-medium text-neutral-900 text-xs sm:text-sm mb-0.5 sm:mb-1 leading-tight">
                                    {category.name}
                                </h3>
                                <p className="text-xs text-neutral-500 hidden sm:block">{category.count}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-primary-600 to-accent-600">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        Ready to Get Started?
                    </h2>
                    <p className="text-lg text-primary-100 mb-10 max-w-2xl mx-auto">
                        Join thousands of clients and freelancers already using Connect
                        to build great things together.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup?role=client">
                            <Button
                                size="lg"
                                className="min-w-[200px] bg-white text-primary-600 hover:bg-neutral-100"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Hire a Freelancer
                            </Button>
                        </Link>
                        <Link to="/signup?role=freelancer">
                            <Button
                                size="lg"
                                variant="outline"
                                className="min-w-[200px] border-white text-white hover:bg-white/10"
                            >
                                Become a Freelancer
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};
