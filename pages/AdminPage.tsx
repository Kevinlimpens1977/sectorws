import React, { useState, useEffect, useCallback } from 'react';
import { Slot, Teacher, Teachers } from '../types';
import api from '../services/supabaseApi';
import { signInTeacher, signOutTeacher, onAuthStateChange } from '../services/supabaseClient';
import { supabase } from '../services/supabaseClient';

type AdminTab = 'overview' | 'manage-slots';

const SESSION_KEY = 'pws_admin_teacher';

// --- Helper Icon Components ---
const ArrowLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
);
const ArrowRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
);


// --- Helper Functions for Date Management ---
const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const toYYYYMMDD = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const getWeekNumber = (d: Date): [number, number] => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}


// --- Sub-component: Login Form ---
const AdminLogin: React.FC<{ onLogin: (teacher: Teacher) => void }> = ({ onLogin }) => {
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
            <div className="bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-2xl font-bold text-center mb-6 text-slate-900">Docent Login</h1>
                {error && <p className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 text-sm">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label htmlFor="teacher" className="block text-sm font-medium text-slate-700">Docent</label>
                        <select
                            id="teacher"
                            value={selectedTeacher}
                            onChange={(e) => setSelectedTeacher(e.target.value as Teacher)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                        >
                            {Teachers.map(t => <option key={t} value={t}>{t === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina'}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Wachtwoord</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                        />
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full mt-6 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 disabled:bg-violet-300">
                        {isLoading ? 'Inloggen...' : 'Inloggen'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// --- Sub-component: Manage Slots Tab ---
const ManageSlotsTab: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [slotsForWeek, setSlotsForWeek] = useState<Record<string, Slot[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const startOfWeek = getStartOfWeek(currentDate);
    const [year, weekNumber] = getWeekNumber(startOfWeek);

    const ALL_DAY_TIMES: string[] = [];
    for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            if (hour === 16 && minute === 30) continue;
            const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            ALL_DAY_TIMES.push(timeString);
        }
    }

    const weekDays: { label: string; date: Date }[] = Array.from({ length: 5 }).map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);
        return {
            label: date.toLocaleDateString('nl-NL', { weekday: 'short' }),
            date,
        };
    });

    const fetchSlotsForWeek = useCallback(async () => {
        setIsLoading(true);
        setMessage(null);

        const weekPromises = weekDays.map(day => {
            const dateStr = toYYYYMMDD(day.date);
            return api.getSlotsForDate(dateStr, teacher);
        });

        try {
            const weekResults = await Promise.all(weekPromises);
            const newSlotsForWeek: Record<string, Slot[]> = {};
            weekDays.forEach((day, index) => {
                const dateStr = toYYYYMMDD(day.date);
                newSlotsForWeek[dateStr] = weekResults[index];
            });
            setSlotsForWeek(newSlotsForWeek);
        } catch (error) {
            console.error("Failed to fetch slots for the week:", error);
            setMessage({ type: 'error', text: 'Kon de tijdsloten niet ophalen.' });
        } finally {
            setIsLoading(false);
        }
    }, [teacher, startOfWeek.getTime()]);

    useEffect(() => {
        fetchSlotsForWeek();
    }, [fetchSlotsForWeek]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + (direction === 'prev' ? -7 : 7));
        setCurrentDate(newDate);
    };

    const handleSlotClick = async (date: string, time: string) => {
        setMessage(null);
        const result = await api.toggleOrCreateSlot(date, time, teacher);

        if (result.success && result.updatedSlot) {
            const updatedSlot = result.updatedSlot;
            setSlotsForWeek(currentWeekSlots => {
                const newWeekSlots = { ...currentWeekSlots };
                const daySlots = [...(newWeekSlots[date] || [])];
                const existingSlotIndex = daySlots.findIndex(s => s.id === updatedSlot.id);

                if (existingSlotIndex > -1) {
                    daySlots[existingSlotIndex] = updatedSlot;
                } else {
                    daySlots.push(updatedSlot);
                }

                daySlots.sort((a, b) => a.time.localeCompare(b.time));
                newWeekSlots[date] = daySlots;
                return newWeekSlots;
            });
        } else {
            setMessage({ type: 'error', text: result.message });
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-slate-900">Tijdsloten Beheren</h2>
            <p className="text-slate-600 mb-6 text-sm">Klik op een tijdslot om deze te openen (groen) of te sluiten (paars). Rode sloten zijn al geboekt.</p>

            <div className="flex items-center justify-between mb-4 bg-violet-100/70 p-3 rounded-xl">
                <button
                    onClick={() => handleWeekChange('prev')}
                    className="p-2 bg-white border-2 border-violet-300 text-violet-500 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    aria-label="Vorige week"
                >
                    <ArrowLeftIcon />
                </button>
                <h3 className="text-lg font-semibold text-violet-900">Week {weekNumber}, {year}</h3>
                <button
                    onClick={() => handleWeekChange('next')}
                    className="p-2 bg-white border-2 border-violet-300 text-violet-500 rounded-lg hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
                    aria-label="Volgende week"
                >
                    <ArrowRightIcon />
                </button>
            </div>

            {message && (
                <p className={`mb-4 text-sm p-3 rounded-lg ${message.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                    {message.text}
                </p>
            )}

            {isLoading ? (
                <div className="text-center p-8 text-slate-500">Tijdsloten laden...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {weekDays.map(({ label, date }) => {
                        const dateStr = toYYYYMMDD(date);
                        const slotsForThisDay = slotsForWeek[dateStr] || [];
                        return (
                            <div key={dateStr} className="bg-slate-50 rounded-lg p-3">
                                <div className="p-2 mb-3 rounded-md text-center font-semibold bg-slate-100 text-slate-700 border border-green-800">
                                    <span className="block text-xs uppercase">{label}</span>
                                    <span className="block text-xl font-bold">{date.getDate()}</span>
                                </div>
                                <div className="space-y-2">
                                    {ALL_DAY_TIMES.map(time => {
                                        const slot = slotsForThisDay.find(s => s.time === time);
                                        const isBooked = !!slot?.student_number;
                                        const isAvailable = slot?.available ?? false;

                                        let buttonClass = '';
                                        if (isBooked) {
                                            buttonClass = 'bg-rose-200 text-rose-800 cursor-not-allowed';
                                        } else if (isAvailable) {
                                            buttonClass = 'bg-green-500 text-white hover:bg-green-600 shadow-sm';
                                        } else {
                                            buttonClass = 'bg-violet-100 text-violet-800 hover:bg-violet-200';
                                        }

                                        return (
                                            <button
                                                key={time}
                                                onClick={() => handleSlotClick(dateStr, time)}
                                                disabled={isBooked}
                                                className={`w-full p-2 rounded-md text-center text-sm font-semibold transition-colors ${buttonClass}`}
                                            >
                                                {time}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// --- Sub-component: Appointments Overview Tab ---
const AppointmentsOverviewTab: React.FC<{ teacher: Teacher }> = ({ teacher }) => {
    const [appointments, setAppointments] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterDate, setFilterDate] = useState('');
    const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

    const fetchAppointments = useCallback(async () => {
        setIsLoading(true);
        const data = await api.getAllAppointments(teacher);
        setAppointments(data);
        setIsLoading(false);
    }, [teacher]);

    useEffect(() => {
        fetchAppointments();
    }, [fetchAppointments]);

    const handleUpdate = async (slotId: number, details: { present: boolean, notes: string, completed: boolean }) => {
        await api.updateAppointment(slotId, details);
        setEditingSlot(null);
        fetchAppointments();
    };

    const filteredAppointments = appointments
        .filter(app => !filterDate || app.date === filterDate)
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-slate-900">Overzicht Afspraken</h2>
            <div className="mb-4">
                <label htmlFor="filterDate" className="block text-sm font-medium text-slate-700">Filter op datum</label>
                <input
                    type="date"
                    id="filterDate"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="mt-1 inline-block px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500"
                />
                <button onClick={() => setFilterDate('')} className="ml-2 text-sm text-violet-600 hover:underline">Reset</button>
            </div>

            {isLoading && <p>Afspraken laden...</p>}
            {!isLoading && filteredAppointments.length === 0 && <p className="text-slate-500 mt-4">Geen afspraken gevonden die voldoen aan het filter.</p>}

            {!isLoading && filteredAppointments.length > 0 && (
                <div className="overflow-x-auto -mx-6 -mb-6 rounded-b-2xl">
                    <table className="min-w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Datum & Tijd</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Leerling</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white">
                            {filteredAppointments.map((app, index) => (
                                <tr key={app.id} className={`border-t border-slate-200 ${index === filteredAppointments.length - 1 ? 'border-b-0' : ''}`}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{app.date} {app.time}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                        <div className="font-medium text-slate-800">{app.studentInfo?.name} ({app.studentInfo?.class})</div>
                                        <div className="text-xs text-slate-400">{app.studentInfo?.student_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {app.completed ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">Afgerond</span>
                                            : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">Gepland</span>}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => setEditingSlot(app)} className="text-violet-600 hover:text-violet-900">Beheren</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {editingSlot && <AppointmentModal slot={editingSlot} onClose={() => setEditingSlot(null)} onSave={handleUpdate} />}
        </div>
    );
};

// --- Modal for editing appointments ---
const AppointmentModal: React.FC<{ slot: Slot, onClose: () => void, onSave: (slotId: number, details: { present: boolean, notes: string, completed: boolean }) => void }> = ({ slot, onClose, onSave }) => {
    const [present, setPresent] = useState(slot.present);
    const [notes, setNotes] = useState(slot.notes || '');
    const [completed, setCompleted] = useState(slot.completed);

    const handleSave = () => {
        onSave(slot.id, { present, notes, completed });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-20 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-4 text-slate-900">Afspraak beheren: {slot.studentInfo?.name}</h3>
                <p className="text-sm text-slate-500 mb-2">Datum: {slot.date} om {slot.time}</p>
                <p className="text-sm text-slate-500 mb-4">Onderwerp: {slot.studentInfo?.topic}</p>

                <div className="space-y-4">
                    <div>
                        <label htmlFor="notes" className="block text-sm font-medium text-slate-700">Aantekeningen</label>
                        <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="mt-1 block w-full p-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:ring-violet-500 focus:border-violet-500"></textarea>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input id="present" type="checkbox" checked={present} onChange={e => setPresent(e.target.checked)} className="h-4 w-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500" />
                        <label htmlFor="present" className="text-sm font-medium text-slate-700">Leerling was aanwezig</label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input id="completed" type="checkbox" checked={completed} onChange={e => setCompleted(e.target.checked)} className="h-4 w-4 text-violet-600 border-slate-300 rounded focus:ring-violet-500" />
                        <label htmlFor="completed" className="text-sm font-medium text-slate-700">Gesprek afronden</label>
                    </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300">Annuleren</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 shadow-sm">Opslaan</button>
                </div>
            </div>
        </div>
    )
};


// --- Main Admin Page Component ---
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
        <div className="md:mt-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Docenten Dashboard</h1>
                    <p className="text-slate-600 font-semibold">{teacherName}</p>
                </div>
                <button onClick={handleLogout} className="text-sm text-slate-600 hover:text-red-500 font-medium">Uitloggen</button>
            </div>

            <div className="mb-6">
                <div className="inline-flex bg-violet-100/70 p-1.5 rounded-xl">
                    <nav className="flex space-x-2">
                        <button onClick={() => setActiveTab('overview')} className={`py-2 px-5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'overview' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}>
                            Overzicht Afspraken
                        </button>
                        <button onClick={() => setActiveTab('manage-slots')} className={`py-2 px-5 rounded-lg font-medium text-sm transition-colors ${activeTab === 'manage-slots' ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-600 hover:bg-white/60'}`}>
                            Tijdsloten Beheren
                        </button>
                    </nav>
                </div>
            </div>

            <div>
                {activeTab === 'overview' && <AppointmentsOverviewTab teacher={loggedInTeacher} />}
                {activeTab === 'manage-slots' && <ManageSlotsTab teacher={loggedInTeacher} />}
            </div>
        </div>
    );
};

export default AdminPage;