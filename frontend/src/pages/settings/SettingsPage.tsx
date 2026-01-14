// pages/settings/SettingsPage.tsx
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
    Globe,
    User,
    Bell,
    Shield,
    Check
} from 'lucide-react';

export const SettingsPage = () => {
    const { user } = useAuth();
    const [language, setLanguage] = useState('fr');
    const [notifications, setNotifications] = useState({
        email: true,
        proposals: true,
        messages: true,
        contracts: true,
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        // Save to localStorage for now
        localStorage.setItem('language', language);
        localStorage.setItem('notifications', JSON.stringify(notifications));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            <div className="max-w-3xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-2">⚙️ Paramètres</h1>
                    <p className="text-neutral-600">Gérez vos préférences et paramètres de compte</p>
                </div>

                {/* Account Section */}
                <Card className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-primary-100 rounded-lg">
                            <User className="w-5 h-5 text-primary-600" />
                        </div>
                        <h2 className="text-lg font-semibold text-neutral-900">Compte</h2>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-neutral-600 mb-1">Nom</label>
                            <p className="text-neutral-900 font-medium">{user?.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-600 mb-1">Email</label>
                            <p className="text-neutral-900 font-medium">{user?.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm text-neutral-600 mb-1">Rôle</label>
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
                        <h2 className="text-lg font-semibold text-neutral-900">Langue</h2>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                        <button
                            onClick={() => setLanguage('fr')}
                            className={`p-4 rounded-lg border-2 transition-all ${language === 'fr'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <span className="text-2xl block mb-1">🇫🇷</span>
                            <span className={`text-sm font-medium ${language === 'fr' ? 'text-primary-700' : 'text-neutral-700'}`}>
                                Français
                            </span>
                            {language === 'fr' && <Check className="w-4 h-4 text-primary-600 mx-auto mt-1" />}
                        </button>

                        <button
                            onClick={() => setLanguage('ar')}
                            className={`p-4 rounded-lg border-2 transition-all ${language === 'ar'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <span className="text-2xl block mb-1">🇹🇳</span>
                            <span className={`text-sm font-medium ${language === 'ar' ? 'text-primary-700' : 'text-neutral-700'}`}>
                                العربية
                            </span>
                            {language === 'ar' && <Check className="w-4 h-4 text-primary-600 mx-auto mt-1" />}
                        </button>

                        <button
                            onClick={() => setLanguage('en')}
                            className={`p-4 rounded-lg border-2 transition-all ${language === 'en'
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 hover:border-neutral-300'
                                }`}
                        >
                            <span className="text-2xl block mb-1">🇬🇧</span>
                            <span className={`text-sm font-medium ${language === 'en' ? 'text-primary-700' : 'text-neutral-700'}`}>
                                English
                            </span>
                            {language === 'en' && <Check className="w-4 h-4 text-primary-600 mx-auto mt-1" />}
                        </button>
                    </div>

                    <p className="text-xs text-neutral-500 mt-3">
                        * La traduction complète sera disponible prochainement
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
                            { key: 'email', label: 'Notifications par email' },
                            { key: 'proposals', label: 'Nouvelles propositions' },
                            { key: 'messages', label: 'Nouveaux messages' },
                            { key: 'contracts', label: 'Mises à jour des contrats' },
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
                        <h2 className="text-lg font-semibold text-neutral-900">Sécurité</h2>
                    </div>

                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                            🔑 Changer le mot de passe
                        </Button>
                        <Button variant="outline" className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50">
                            🗑️ Supprimer le compte
                        </Button>
                    </div>
                </Card>

                {/* Save Button */}
                <div className="flex items-center justify-end gap-4">
                    {saved && (
                        <span className="text-green-600 flex items-center gap-2">
                            <Check className="w-5 h-5" />
                            Paramètres sauvegardés
                        </span>
                    )}
                    <Button onClick={handleSave} className="px-8">
                        Sauvegarder
                    </Button>
                </div>
            </div>
        </div>
    );
};
