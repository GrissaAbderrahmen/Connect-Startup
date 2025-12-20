import { useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Lock, Eye, EyeOff } from 'lucide-react';
import { authAPI } from '@/services/api/auth';
import { Button } from '@/components/common/Button';

export const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState<'form' | 'loading' | 'success' | 'error'>('form');
    const [message, setMessage] = useState('');
    const hasSubmittedRef = useRef(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (hasSubmittedRef.current) return;

        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setMessage('Password must be at least 8 characters');
            return;
        }

        hasSubmittedRef.current = true;
        setStatus('loading');

        try {
            await authAPI.resetPassword({ token: token || '', new_password: password });
            setStatus('success');
            setMessage('Password updated successfully!');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            hasSubmittedRef.current = false;
            setStatus('error');
            setMessage(err.response?.data?.error || 'Failed to reset password. The link may be expired.');
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-2">Invalid Link</h1>
                    <p className="text-neutral-600 mb-6">No reset token provided. Please request a new password reset.</p>
                    <Link
                        to="/login"
                        className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                {status === 'form' && (
                    <>
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-primary-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-neutral-900">Reset Your Password</h1>
                            <p className="text-neutral-600 mt-2">Enter your new password below</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="Enter new password"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>

                            {message && (
                                <p className="text-red-500 text-sm">{message}</p>
                            )}

                            <Button type="submit" className="w-full py-3">
                                Reset Password
                            </Button>
                        </form>
                    </>
                )}

                {status === 'loading' && (
                    <div className="text-center py-8">
                        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-neutral-600">Updating your password...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-12 h-12 text-green-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Password Updated! 🎉</h1>
                        <p className="text-neutral-600 mb-6">{message}</p>
                        <p className="text-sm text-neutral-500">Redirecting to login...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <XCircle className="w-12 h-12 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Reset Failed</h1>
                        <p className="text-neutral-600 mb-6">{message}</p>
                        <Link
                            to="/login"
                            className="inline-block bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};
