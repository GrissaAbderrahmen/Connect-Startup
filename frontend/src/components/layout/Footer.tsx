// components/layout/Footer.tsx
import { Link } from 'react-router-dom';
import {
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Mail,
    MapPin,
    Phone
} from 'lucide-react';

export const Footer = () => {
    const currentYear = new Date().getFullYear();

    const footerLinks = {
        platform: [
            { label: 'How It Works', path: '/how-it-works' },
            { label: 'Browse Projects', path: '/projects' },
            { label: 'Find Freelancers', path: '/freelancers' },
            { label: 'Pricing', path: '/pricing' },
        ],
        company: [
            { label: 'About Us', path: '/about' },
            { label: 'Careers', path: '/careers' },
            { label: 'Blog', path: '/blog' },
            { label: 'Contact', path: '/contact' },
        ],
        support: [
            { label: 'Help Center', path: '/help' },
            { label: 'Trust & Safety', path: '/trust-safety' },
            { label: 'Terms of Service', path: '/terms' },
            { label: 'Privacy Policy', path: '/privacy' },
        ],
    };

    const socialLinks = [
        { icon: Facebook, href: 'https://facebook.com/connectplatform', label: 'Facebook' },
        { icon: Twitter, href: 'https://twitter.com/connectplatform', label: 'Twitter' },
        { icon: Instagram, href: 'https://instagram.com/connectplatform', label: 'Instagram' },
        { icon: Linkedin, href: 'https://linkedin.com/company/connect-platform', label: 'LinkedIn' },
    ];

    return (
        <footer className="bg-neutral-900 text-white">
            {/* Main Footer */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">C</span>
                            </div>
                            <span className="text-xl font-bold">Connect</span>
                        </Link>
                        <p className="text-neutral-400 text-sm mb-4 max-w-xs">
                            Tunisia's trusted freelance platform. Connect with verified freelancers
                            and pay securely with escrow protection.
                        </p>
                        <p className="text-primary-400 text-sm font-medium mb-6">
                            Built for Trust
                        </p>

                        {/* Contact Info */}
                        <div className="space-y-2 text-sm text-neutral-400">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary-500" />
                                <span>Tunis, Tunisia</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary-500" />
                                <a href="mailto:contact@connect-platform.com" className="hover:text-primary-400 transition-colors">
                                    contact@connect-platform.com
                                </a>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-primary-500" />
                                <span>+216 XX XXX XXX</span>
                            </div>
                        </div>
                    </div>

                    {/* Platform Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-4">
                            Platform
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.platform.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-4">
                            Company
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support Links */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 mb-4">
                            Support
                        </h4>
                        <ul className="space-y-2">
                            {footerLinks.support.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className="text-sm text-neutral-400 hover:text-primary-400 transition-colors"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-neutral-500">
                            © {currentYear} Connect. All rights reserved.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-neutral-400 hover:text-primary-400 hover:bg-neutral-800 rounded-lg transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
