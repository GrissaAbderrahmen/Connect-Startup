// pages/freelancers/MyFreelancerProfilePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Save,
    Plus,
    X,
    Upload,
    CheckCircle,
    Github,
    Linkedin,
    Globe
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Avatar } from '@/components/common/Avatar';
import { Spinner } from '@/components/common/Spinner';
import { useAuth } from '@/context/AuthContext';
import { useMyFreelancerProfile } from '@/hooks/useFreelancers';
import { UpdateFreelancerProfileData } from '@/types/freelancer';

export const MyFreelancerProfilePage = () => {
    const { user } = useAuth();
    const { profile, isLoading, isSaving, error, updateProfile } = useMyFreelancerProfile();

    const [formData, setFormData] = useState<UpdateFreelancerProfileData>({
        bio: '',
        skills: [],
        hourly_rate: undefined,
        portfolio_url: '',
        social_links: {
            github: '',
            linkedin: '',
            website: '',
        },
    });

    const [newSkill, setNewSkill] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Populate form when profile loads
    useEffect(() => {
        if (profile) {
            setFormData({
                bio: profile.bio || '',
                skills: profile.skills || [],
                hourly_rate: profile.hourly_rate || undefined,
                portfolio_url: profile.portfolio_url || '',
                social_links: {
                    github: '',
                    linkedin: '',
                    website: '',
                },
            });
        }
    }, [profile]);

    const handleAddSkill = () => {
        if (newSkill.trim() && formData.skills && !formData.skills.includes(newSkill.trim())) {
            setFormData({
                ...formData,
                skills: [...formData.skills, newSkill.trim()]
            });
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setFormData({
            ...formData,
            skills: formData.skills?.filter(skill => skill !== skillToRemove)
        });
    };

    const handleSave = async () => {
        const result = await updateProfile(formData);
        if (result) {
            setSuccessMessage('Profile updated successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-3xl mx-auto py-12 flex justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Edit Profile</h1>
                    <p className="text-neutral-600 mt-1">
                        Update your profile to attract more clients.
                    </p>
                </div>
                <Link to={`/freelancers/${user?.id}`}>
                    <Button variant="outline">View Public Profile</Button>
                </Link>
            </div>

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    {successMessage}
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Profile Photo */}
            <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Profile Photo</h2>
                <div className="flex items-center gap-6">
                    <Avatar name={user?.name} size="xl" className="!w-24 !h-24" />
                    <div>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Upload className="w-4 h-4" />
                            Upload Photo
                        </Button>
                        <p className="text-sm text-neutral-500 mt-2">
                            JPG, PNG or GIF. Max 2MB.
                        </p>
                    </div>
                </div>
            </Card>

            {/* Basic Info */}
            <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Basic Information</h2>
                <div className="space-y-4">
                    <Textarea
                        label="Bio"
                        value={formData.bio || ''}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        rows={5}
                        placeholder="Tell clients about yourself, your experience, and what you specialize in..."
                    />
                    <p className="text-xs text-neutral-500 -mt-2">
                        {formData.bio?.length || 0}/1000 characters
                    </p>

                    <Input
                        label="Hourly Rate (TND)"
                        type="number"
                        value={formData.hourly_rate?.toString() || ''}
                        onChange={(e) => setFormData({ ...formData, hourly_rate: Number(e.target.value) || undefined })}
                        placeholder="e.g., 35"
                    />

                    <Input
                        label="Portfolio URL"
                        type="url"
                        value={formData.portfolio_url || ''}
                        onChange={(e) => setFormData({ ...formData, portfolio_url: e.target.value })}
                        placeholder="https://your-portfolio.com"
                    />
                </div>
            </Card>

            {/* Skills */}
            <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Skills</h2>

                <div className="flex flex-wrap gap-2 mb-4">
                    {formData.skills?.map((skill) => (
                        <Badge key={skill} variant="primary" className="flex items-center gap-1">
                            {skill}
                            <button
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-primary-900 transition-colors ml-1"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </Badge>
                    ))}
                    {(!formData.skills || formData.skills.length === 0) && (
                        <p className="text-neutral-500 text-sm">No skills added yet.</p>
                    )}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add a skill (e.g., React, Figma)"
                        className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <Button onClick={handleAddSkill} variant="outline">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                    Add skills that best represent your expertise. Press Enter to add.
                </p>
            </Card>

            {/* Social Links */}
            <Card>
                <h2 className="text-lg font-semibold text-neutral-900 mb-4">Social & Portfolio Links</h2>
                <div className="space-y-4">
                    <div className="relative">
                        <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="url"
                            value={formData.social_links?.github || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                social_links: { ...formData.social_links, github: e.target.value }
                            })}
                            placeholder="https://github.com/username"
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="url"
                            value={formData.social_links?.linkedin || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                social_links: { ...formData.social_links, linkedin: e.target.value }
                            })}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>

                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                            type="url"
                            value={formData.social_links?.website || ''}
                            onChange={(e) => setFormData({
                                ...formData,
                                social_links: { ...formData.social_links, website: e.target.value }
                            })}
                            placeholder="https://yourwebsite.com"
                            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </Card>

            {/* Verification */}
            <div className="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl border border-primary-200 p-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-neutral-900">Get Verified</h2>
                        <p className="text-neutral-600 mt-1">
                            Verified freelancers get 3x more visibility and trust from clients.
                        </p>
                        <div className="mt-4 flex items-center gap-3">
                            <Button size="sm">Start Verification</Button>
                            <span className="text-sm text-neutral-500">Takes ~2 minutes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-3 pt-4">
                <Link to="/dashboard">
                    <Button variant="outline">Cancel</Button>
                </Link>
                <Button onClick={handleSave} isLoading={isSaving} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>
        </div>
    );
};
