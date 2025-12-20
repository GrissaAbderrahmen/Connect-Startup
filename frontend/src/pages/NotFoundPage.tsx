// pages/NotFoundPage.tsx
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const NotFoundPage = () => {
    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="text-center">
                {/* 404 Illustration */}
                <div className="mb-8">
                    <div className="text-9xl font-bold text-primary-500 mb-4">404</div>
                    <div className="w-32 h-1 bg-gradient-to-r from-primary-500 to-accent-500 mx-auto rounded-full"></div>
                </div>

                {/* Message */}
                <h1 className="text-3xl font-bold text-neutral-900 mb-4">
                    Page Not Found
                </h1>
                <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                    Sorry, we couldn't find the page you're looking for.
                    Perhaps you've mistyped the URL or the page has been moved.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button
                        onClick={() => window.history.back()}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </Button>
                    <Link to="/">
                        <Button className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
};
