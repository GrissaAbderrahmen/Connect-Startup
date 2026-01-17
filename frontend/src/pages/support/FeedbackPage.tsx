// pages/support/FeedbackPage.tsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { MessageSquare, Check, AlertCircle } from 'lucide-react';
import apiClient from '@/services/api/client';

export const FeedbackPage = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await apiClient.post('/support/feedback', form);
            setSuccess(true);
            setForm({ ...form, subject: '', message: '' });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageSquare className="w-8 h-8 text-primary-600" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">
                        Feedback & Support
                    </h1>
                    <p className="text-neutral-600">
                        Have a question, suggestion, or found a bug? Let us know!
                    </p>
                </div>

                {success ? (
                    <Card className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                            Thank you for your feedback!
                        </h2>
                        <p className="text-neutral-600 mb-6">
                            We've received your message and will get back to you if needed.
                        </p>
                        <Button onClick={() => setSuccess(false)}>
                            Send Another Message
                        </Button>
                    </Card>
                ) : (
                    <Card>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-4">
                                <Input
                                    label="Your Name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="John Doe"
                                    required
                                />
                                <Input
                                    label="Your Email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="john@example.com"
                                    required
                                />
                            </div>

                            <Input
                                label="Subject"
                                value={form.subject}
                                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                placeholder="Bug report, Feature request, General feedback..."
                                required
                            />

                            <Textarea
                                label="Your Message"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Please describe your feedback in detail..."
                                rows={6}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                isLoading={isSubmitting}
                            >
                                Send Feedback
                            </Button>
                        </form>
                    </Card>
                )}

                <p className="text-center text-sm text-neutral-500 mt-6">
                    Your feedback helps us improve Connect for everyone.
                </p>
            </div>
        </div>
    );
};
