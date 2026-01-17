// pages/settings/SettingsPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/services/api/auth';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import {
    Globe,
    User,
    Bell,
    Shield,
    Check,
    X,
    AlertTriangle
} from 'lucide-react';

export const SettingsPage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [language, setLanguage] = useState('fr');
    const [notifications, setNotifications] = useState({
        email: true,
        proposals: true,
        messages: true,
        contracts: true,
    });
    const [saved, setSaved] = useState(false);

    // Change Password Modal State
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // Delete Account Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteError, setDeleteError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSave = () => {
        localStorage.setItem('language', language);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const handleChangePassword = async () => {
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 8) {
            setPasswordError('Password must be at least 8 characters');
            return;
        }

        setIsChangingPassword(true);
        try {
            await authAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordSuccess('Password changed successfully!');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => {
                setShowPasswordModal(false);
                setPasswordSuccess('');
            }, 2000);
        } catch (err: any) {
            setPasswordError(err.response?.data?.error || 'Failed to change password');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleDeleteAccount = async () => {
        setDeleteError('');

        if (!deletePassword) {
            setDeleteError('Please enter your password to confirm');
            return;
        }

        setIsDeleting(true);
        try {
            await authAPI.deleteAccount(deletePassword);
            logout();
            navigate('/');
        } catch (err: any) {
            setDeleteError(err.response?.data?.error || 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-2">⚙️ Settings</h1>
                    <p className="text-neutral-600">Manage your account settings and preferences</p>
                </div>

                {/* Account Section */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">Account</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-neutral-600 mb-1">Name</label>
                            <p className="text-neutral-900 font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-600 mb-1">Email</label>
                            <p className="text-neutral-900 font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-600 mb-1">Role</label>
                            <span className="inline-flex px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm capitalize">
                                {user?.role === 'freelancer' ? 'Freelancer' : 'Client'}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* Language Section */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-accent-100 rounded-lg">
                            <Globe className="w-5 h-5 text-accent-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">Language</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { code: 'fr', label: 'Français', flag: '🇫🇷' },
                            { code: 'ar', label: 'العربية', flag: '🇹🇳' },
                            { code: 'en', label: 'English', flag: '🇬🇧' },
                        ].map(({ code, label, flag }) => (
                            <button
                                key={code}
                                onClick={() => setLanguage(code)}
                                className={`p-4 rounded-lg border-2 transition-all ${language === code
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-neutral-200 hover:border-neutral-300'
                                    }`}
                            >
                                <span className="text-2xl block mb-1">{flag}</span>
                                <span className={`text-sm font-medium ${language === code ? 'text-primary-700' : 'text-neutral-700'}`}>
                                    {label}
                                </span>
                                {language === code && <Check className="w-4 h-4 text-primary-600 mx-auto mt-1" />}
                            </button>
                        ))}
                    </div>

                    <p className="text-xs text-neutral-500 mt-3">
                        * Full translation coming soon
                    </p>
                </Card>

                {/* Notifications Section */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-secondary-100 rounded-lg">
                            <Bell className="w-5 h-5 text-secondary-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">Notifications</h2>
                    </div>

                    <div className="space-y-4">
                        {[
                            { key: 'email', label: 'Email notifications' },
                            { key: 'proposals', label: 'New proposals' },
                            { key: 'messages', label: 'New messages' },
                            { key: 'contracts', label: 'Contract updates' },
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between cursor-pointer">
                                <span className="text-neutral-700">{label}</span>
                                <button
                                    onClick={() => setNotifications(prev => ({
                                        ...prev,
                                        [key]: !prev[key as keyof typeof notifications]
                                    }))}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${notifications[key as keyof typeof notifications]
                                        ? 'bg-primary-500'
                                        : 'bg-neutral-300'
                                        }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${notifications[key as keyof typeof notifications]
                                        ? 'translate-x-7'
                                        : 'translate-x-1'
                                        }`} />
                                </button>
                            </label>
                        ))}
                    </div>
                </Card>

                {/* Security Section */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">Security</h2>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => setShowPasswordModal(true)}
                        >
                            🔑 Change password
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            🗑️ Delete account
                        </Button>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4">
                    {saved && (
                        <span className="text-green-600 flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Settings saved
                        </span>
                    )}
                    <Button onClick={handleSave} className="px-8">
                        Save
                    </Button>
                </div>
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-neutral-900">Change Password</h3>
                            <button
                                onClick={() => setShowPasswordModal(false)}
                                className="p-2 hover:bg-neutral-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {passwordError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {passwordError}
                            </div>
                        )}

                        {passwordSuccess && (
                            <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm flex items-center gap-2">
                                <Check className="w-4 h-4" />
                                {passwordSuccess}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Input
                                label="Current Password"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="Enter current password"
                            />
                            <Input
                                label="New Password"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Enter new password (min 8 characters)"
                            />
                            <Input
                                label="Confirm New Password"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Confirm new password"
                            />
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowPasswordModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1"
                                onClick={handleChangePassword}
                                isLoading={isChangingPassword}
                            >
                                Change Password
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-semibold text-red-600 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6" />
                                Delete Account
                            </h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="p-2 hover:bg-neutral-100 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-800 text-sm">
                                <strong>Warning:</strong> This action is permanent and cannot be undone.
                                All your data, projects, contracts, and messages will be deleted.
                            </p>
                        </div>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                                {deleteError}
                            </div>
                        )}

                        <div className="mb-4">
                            <Input
                                label="Enter your password to confirm"
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Your password"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                className="flex-1 bg-red-600 hover:bg-red-700"
                                onClick={handleDeleteAccount}
                                isLoading={isDeleting}
                            >
                                Delete My Account
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
