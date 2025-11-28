import React, { useState } from 'react';
import { Teacher, Teachers } from '../../types';
import { signInTeacher } from '../../services/supabaseClient';
import { AdminIcon } from '../common/Icons';
import LoadingSpinner from '../common/LoadingSpinner';

interface AdminLoginProps {
    onLogin: (teacher: Teacher) => void;
}

const SESSION_KEY = 'pws_admin_teacher';

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin }) => {
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher>(Teachers[0]);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const { data, error } = await signInTeacher(selectedTeacher, password);

            if (error) {
                setError('Ongeldig wachtwoord voor de geselecteerde docent.');
                return;
            }

            if (data.user) {
                sessionStorage.setItem(SESSION_KEY, selectedTeacher);
                onLogin(selectedTeacher);
            }
        } catch (err) {
            setError('Er is een fout opgetreden bij het inloggen.');
            console.error('Login error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 md:mt-16 lg:mt-20">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
                <div className="flex justify-center mb-6">
                    <div className="bg-violet-100 p-4 rounded-full">
                        <AdminIcon className="w-8 h-8 text-violet-600" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">Docent Login</h1>
                <p className="text-center text-slate-500 mb-8">Log in om je afspraken te beheren</p>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-6 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-slate-700 mb-1">Docent</label>
                        <select
                            id="teacher"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value as Teacher)}
                            className="input"
                        >
                            {Teachers.map(t => <option key={t} value={t}>{t === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina'}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">Wachtwoord</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input"
                            placeholder="••••••••"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full btn btn-primary py-3"
                    >
                        {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : 'Inloggen'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
