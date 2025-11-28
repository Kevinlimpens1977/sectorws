import React, { useState, useEffect, useCallback } from 'react';
import { Teacher } from '../types';
import { signOutTeacher, onAuthStateChange } from '../services/supabaseClient';
import AdminLogin from '../components/admin/AdminLogin';
import AppointmentsOverviewTab from '../components/admin/AppointmentsOverviewTab';
import ManageSlotsTab from '../components/admin/ManageSlotsTab';

type AdminTab = 'overview' | 'manage-slots';
const SESSION_KEY = 'pws_admin_teacher';

const AdminPage: React.FC = () => {
    const [loggedInTeacher, setLoggedInTeacher] = useState<Teacher | null>(sessionStorage.getItem(SESSION_KEY) as Teacher | null);
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');

    const handleLogout = useCallback(async () => {
        await signOutTeacher();
        sessionStorage.removeItem(SESSION_KEY);
        setLoggedInTeacher(null);
    }, []);

    useEffect(() => {
        let subscription: any;

        const setupAuthListener = async () => {
            const { data } = await onAuthStateChange((event, session) => {
                if (event === 'SIGNED_OUT') {
                    handleLogout();
                }
            });
            subscription = data.subscription;
        };

        setupAuthListener();

        return () => {
            if (subscription) {
                subscription.unsubscribe();
            }
        };
    }, [handleLogout]);

    if (!loggedInTeacher) {
        return <AdminLogin onLogin={(teacher) => setLoggedInTeacher(teacher)} />;
    }

    const teacherName = loggedInTeacher === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina';

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Docenten Dashboard</h1>
                    <p className="text-slate-600 font-medium mt-1">Ingelogd als <span className="text-violet-700">{teacherName}</span></p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors border border-transparent hover:border-red-100"
                >
                    Uitloggen
                </button>
            </div>

            <div className="mb-8">
                <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <nav className="flex space-x-1">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-2 px-5 rounded-lg font-medium text-sm transition-all ${activeTab === 'overview'
                                    ? 'bg-white text-violet-700 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                        >
                            Overzicht Afspraken
                        </button>
                        <button
                            onClick={() => setActiveTab('manage-slots')}
                            className={`py-2 px-5 rounded-lg font-medium text-sm transition-all ${activeTab === 'manage-slots'
                                    ? 'bg-white text-violet-700 shadow-sm ring-1 ring-black/5'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                                }`}
                        >
                            Tijdsloten Beheren
                        </button>
                    </nav>
                </div>
            </div>

            <div className="animate-fade-in">
                {activeTab === 'overview' && <AppointmentsOverviewTab teacher={loggedInTeacher} />}
                {activeTab === 'manage-slots' && <ManageSlotsTab teacher={loggedInTeacher} />}
            </div>
        </div>
    );
};

export default AdminPage;