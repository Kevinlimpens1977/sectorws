import React, { useState, useEffect, useCallback } from 'react';
import { Slot, Teacher } from '../../types';
import api from '../../services/supabaseApi';
import AppointmentModal from './AppointmentModal';
import LoadingSpinner from '../common/LoadingSpinner';
import LoadingSkeleton from '../common/LoadingSkeleton';
import toast from 'react-hot-toast';

interface AppointmentsOverviewTabProps {
    teacher: Teacher;
}

const AppointmentsOverviewTab: React.FC<AppointmentsOverviewTabProps> = ({ teacher }) => {
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
        const result = await api.updateAppointment(slotId, details);
        if (result.success) {
            toast.success('Afspraak bijgewerkt');
            setEditingSlot(null);
            fetchAppointments();
        } else {
            toast.error('Kon afspraak niet bijwerken');
        }
    };

    const filteredAppointments = appointments
        .filter(app => !filterDate || app.date === filterDate)
        .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-xl font-bold text-slate-900">Overzicht Afspraken</h2>

                <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="input max-w-[200px]"
                    />
                    {filterDate && (
                        <button
                            onClick={() => setFilterDate('')}
                            className="text-sm text-violet-600 hover:text-violet-800 font-medium px-2"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="overflow-x-auto -mx-6 -mb-6 sm:mx-0 sm:mb-0 sm:rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left"><LoadingSkeleton className="h-4 w-20" /></th>
                                <th className="px-6 py-3 text-left"><LoadingSkeleton className="h-4 w-20" /></th>
                                <th className="px-6 py-3 text-left"><LoadingSkeleton className="h-4 w-20" /></th>
                                <th className="px-6 py-3 text-right"><LoadingSkeleton className="h-4 w-20 ml-auto" /></th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i}>
                                    <td className="px-6 py-4"><LoadingSkeleton className="h-10 w-32" /></td>
                                    <td className="px-6 py-4"><LoadingSkeleton className="h-10 w-40" /></td>
                                    <td className="px-6 py-4"><LoadingSkeleton className="h-6 w-24 rounded-full" /></td>
                                    <td className="px-6 py-4 text-right"><LoadingSkeleton className="h-4 w-16 ml-auto" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-slate-500 font-medium">Geen afspraken gevonden.</p>
                    {filterDate && <p className="text-sm text-slate-400 mt-1">Probeer een andere datum.</p>}
                </div>
            ) : (
                <div className="overflow-x-auto -mx-6 -mb-6 sm:mx-0 sm:mb-0 sm:rounded-xl border border-slate-200">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Datum & Tijd</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Leerling</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acties</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredAppointments.map((app) => (
                                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{app.date}</div>
                                        <div className="text-sm text-slate-500">{app.time}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-slate-900">{app.studentInfo?.name}</div>
                                        <div className="text-xs text-slate-500">{app.studentInfo?.class} • {app.studentInfo?.student_number}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {app.completed ? (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                                                Afgerond
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                                                Gepland
                                            </span>
                                        )}
                                        {app.present && (
                                            <span className="ml-2 px-2.5 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                Aanwezig
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => setEditingSlot(app)}
                                            className="text-violet-600 hover:text-violet-900 font-semibold hover:underline"
                                        >
                                            Beheren
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {editingSlot && (
                <AppointmentModal
                    slot={editingSlot}
                    onClose={() => setEditingSlot(null)}
                    onSave={handleUpdate}
                />
            )}
        </div>
    );
};

export default AppointmentsOverviewTab;
