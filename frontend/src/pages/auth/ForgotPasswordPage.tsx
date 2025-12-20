import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { authAPI } from '@/services/api/auth';
import { Button } from '@/components/common/Button';

export const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'form' | 'loading' | 'success'>('form');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setStatus('loading');

        try {
            await authAPI.requestPasswordReset({ email });
            setStatus('success');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to send reset email');
            setStatus('form');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                {status === 'success' ? (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h1>
                        <p className="text-neutral-600 mb-6">
                            If an account exists for <strong>{email}</strong>, we've sent password reset instructions.
                        </p>
                        <p className="text-sm text-neutral-500 mb-4">
                            Didn't receive the email? Check your spam folder or try again.
                        </p>
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="w-8 h-8 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">Forgot Password?</h1>
                            <p className="text-neutral-600 mt-2">
                                Enter your email and we'll send you a reset link
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm">{error}</p>
                            )}

                            <Button
                                type="submit"
                                className="w-full py-3"
                                isLoading={status === 'loading'}
                            >
                                Send Reset Link
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
