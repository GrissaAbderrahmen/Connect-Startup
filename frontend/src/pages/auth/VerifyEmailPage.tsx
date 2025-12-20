import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authAPI } from '@/services/api/auth';

export const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');
    const token = searchParams.get('token');
    const hasAttemptedRef = useRef(false);

    useEffect(() => {
        const verifyEmail = async () => {
            // Prevent double calls from React StrictMode
            if (hasAttemptedRef.current) return;
            hasAttemptedRef.current = true;

            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const result = await authAPI.verifyEmail(token);
                setStatus('success');
                setMessage(result.message || 'Email verified successfully!');
            } catch (err: any) {
                // Only show error if it's actually an error (not already verified)
                const errorMessage = err.response?.data?.error || err.message || 'Verification failed.';
                setStatus('error');
                setMessage(errorMessage);
            }
        };

        verifyEmail();
    }, [token]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {status === 'loading' && (
                    <>
                        <Loader2 className="w-16 h-16 text-primary-500 animate-spin mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verifying your email...</h1>
                        <p className="text-neutral-600">Please wait while we confirm your email address.</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Email Verified! 🎉</h1>
                        <p className="text-neutral-600 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        >
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Verification Failed</h1>
                        <p className="text-neutral-600 mb-6">{message}</p>
                        <div className="space-y-3">
                            <Link
                                to="/login"
                                className="block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                            >
                                Try Login
                            </Link>
                            <p className="text-sm text-neutral-500">
                                Need a new link? Login and request a new verification email.
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
