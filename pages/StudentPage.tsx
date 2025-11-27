import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Slot, ClassOptions, Teacher, Teachers } from '../types';
import api from '../services/supabaseApi';

const InfoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
        <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" />
    </svg>
);

interface BookingModalProps {
    slot: Slot;
    onClose: () => void;
    onSuccess: (confirmation: { date: string; time: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ slot, onClose, onSuccess }) => {
    const [name, setName] = useState('');
    const [studentClass, setStudentClass] = useState(ClassOptions[0]);
    const [studentNumber, setStudentNumber] = useState('');
    const [topic, setTopic] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !studentClass || !studentNumber || !topic) {
            setError('Alle velden zijn verplicht.');
            return;
        }
        setError('');
        setIsLoading(true);

        const result = await api.bookSlot(slot.id, { name, class: studentClass, student_number: studentNumber, topic });

        setIsLoading(false);
        if (result.success) {
            onSuccess({ date: slot.date, time: slot.time });
        } else {
            setError(result.message);
        }
    };

    const formattedDate = new Date(slot.date + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-20 p-4" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Afspraak Inplannen</h2>
                <p className="text-slate-600 mb-6">Je plant een afspraak op <span className="font-semibold text-violet-600">{formattedDate} om {slot.time}</span>.</p>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-slate-700">Volledige Naam</label>
                            <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                        <div>
                            <label htmlFor="studentNumber" className="block text-sm font-medium text-slate-700">Leerlingnummer</label>
                            <input type="text" id="studentNumber" value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                        <div>
                            <label htmlFor="studentClass" className="block text-sm font-medium text-slate-700">Klas</label>
                            <select id="studentClass" value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500">
                                {ClassOptions.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="topic" className="block text-sm font-medium text-slate-700">Onderwerp Sectorwerkstuk</label>
                            <input type="text" id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-violet-500 focus:border-violet-500" />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg hover:bg-slate-300 transition">Annuleren</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition disabled:bg-violet-300 disabled:cursor-not-allowed shadow-sm">
                            {isLoading ? 'Bezig...' : 'Bevestigen'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TeacherSelection: React.FC<{ onSelect: (teacher: Teacher) => void }> = ({ onSelect }) => (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg text-center md:mt-16 lg:mt-20">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Kies je begeleider</h1>
        <p className="text-slate-600 mb-6">Selecteer je docent om de beschikbare tijden te zien.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {Teachers.map(teacher => (
                <button
                    key={teacher}
                    onClick={() => onSelect(teacher)}
                    className="w-full px-5 py-3 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-all transform hover:scale-105 shadow-md"
                >
                    {teacher === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina'}
                </button>
            ))}
        </div>
    </div>
);


const StudentPage: React.FC = () => {
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [confirmation, setConfirmation] = useState<{ date: string; time: string } | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const fetchSlots = useCallback(async () => {
        if (!selectedTeacher) return;
        setIsLoading(true);
        const availableSlots = await api.getAvailableSlots(selectedTeacher);
        setSlots(availableSlots);
        setIsLoading(false);
    }, [selectedTeacher]);

    useEffect(() => {
        fetchSlots();
    }, [fetchSlots]);

    const handleBookingSuccess = (conf: { date: string; time: string }) => {
        setSelectedSlot(null);
        setConfirmation(conf);
        fetchSlots();
    };

    const resetView = () => {
        setConfirmation(null);
        setSelectedTeacher(null);
        setSlots([]);
        setSelectedDate(null);
    }

    const slotsByDate = useMemo(() => {
        return slots.reduce<Record<string, Slot[]>>((acc, slot) => {
            const date = slot.date;
            if (!acc[date]) acc[date] = [];
            acc[date].push(slot);
            return acc;
        }, {});
    }, [slots]);

    const changeMonth = (amount: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setMonth(newDate.getMonth() + amount);
            return newDate;
        });
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDayOfWeek = 1; // Start on Monday
        let firstDay = new Date(year, month, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday is 0 and Sunday is 6
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const blanks = Array(firstDay).fill(null);
        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

        return (
            <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                <div className="flex justify-between items-center mb-4">
                    <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-violet-100">&larr;</button>
                    <h3 className="font-bold text-lg text-slate-800">
                        {currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-violet-100">&rarr;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-slate-500 font-semibold">
                    {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => <div key={day} className="py-2">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {blanks.map((_, i) => <div key={`blank-${i}`}></div>)}
                    {days.map(day => {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const hasSlots = !!slotsByDate[dateStr];
                        const isSelected = selectedDate === dateStr;

                        return (
                            <button
                                key={day}
                                onClick={() => hasSlots && setSelectedDate(dateStr)}
                                disabled={!hasSlots}
                                className={`relative h-10 w-10 rounded-full transition-colors text-sm font-semibold flex items-center justify-center
                                    ${!hasSlots ? 'text-slate-300 cursor-not-allowed' : ''}
                                    ${hasSlots && !isSelected ? 'text-slate-700 hover:bg-violet-100' : ''}
                                    ${isSelected ? 'bg-violet-600 text-white shadow-md' : ''}
                                `}
                            >
                                {day}
                                {hasSlots && <span className={`absolute bottom-1.5 h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    const slotsForSelectedDate = selectedDate ? (slotsByDate[selectedDate] || []) : [];

    if (confirmation) {
        const formattedDate = new Date(confirmation.date + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        return (
            <div className="text-center max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg md:mt-16 lg:mt-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Afspraak Bevestigd!</h1>
                <p className="text-slate-600">Je afspraak is succesvol ingepland op <span className="font-semibold text-violet-700">{formattedDate}</span> om <span className="font-semibold text-violet-700">{confirmation.time}</span>.</p>
                <button onClick={() => window.close()} className="mt-6 px-5 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-semibold shadow-md">Sluit venster</button>
            </div>
        );
    }

    if (!selectedTeacher) {
        return <TeacherSelection onSelect={setSelectedTeacher} />;
    }

    return (
        <div className="md:mt-8">
            <div className="bg-violet-100/60 border-l-4 border-violet-500 text-violet-900 p-4 rounded-lg mb-8 flex items-start justify-between shadow-sm">
                <div className="flex items-start space-x-3">
                    <InfoIcon className="w-6 h-6 flex-shrink-0 mt-0.5" />
                    <div>
                        <h2 className="font-bold">Welkom!</h2>
                        <p className="text-sm">Kies een geschikte datum en tijd voor je gesprek bij <span className='font-semibold'>{selectedTeacher === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina'}</span>.</p>
                    </div>
                </div>
                <button onClick={() => setSelectedTeacher(null)} className="text-sm text-violet-700 hover:underline font-semibold flex-shrink-0 ml-4">Wissel docent</button>
            </div>

            {isLoading && <div className="text-center text-slate-500">Beschikbare tijden laden...</div>}

            {!isLoading && slots.length === 0 && (
                <div className="text-center text-slate-500 bg-white p-8 rounded-2xl shadow-lg">
                    <p className="font-semibold">Er zijn momenteel geen beschikbare tijdsloten voor deze docent.</p>
                    <p className="text-sm mt-2">Kom later terug of neem contact op met je docent.</p>
                </div>
            )}

            {!isLoading && slots.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        {renderCalendar()}
                    </div>
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg">
                        <h3 className="font-bold text-lg text-slate-800 mb-4 border-b pb-3">
                            {selectedDate
                                ? `Tijden voor ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}`
                                : 'Selecteer een datum'
                            }
                        </h3>
                        {selectedDate ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {slotsForSelectedDate.length > 0 ? slotsForSelectedDate.slice().sort((a, b) => a.time.localeCompare(b.time)).map(slot => (
                                    <button
                                        key={slot.id}
                                        onClick={() => setSelectedSlot(slot)}
                                        className="p-3 rounded-lg text-center font-semibold transition-transform transform hover:scale-105 bg-emerald-400/20 text-emerald-800 hover:bg-emerald-400/40 cursor-pointer shadow-sm"
                                    >
                                        {slot.time}
                                    </button>
                                )) : <p className="text-sm text-slate-500 col-span-full">Geen tijden beschikbaar op deze dag.</p>}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500">Selecteer een gemarkeerde datum in de kalender om de beschikbare tijden te zien.</p>
                        )}
                    </div>
                </div>
            )}


            {selectedSlot && <BookingModal slot={selectedSlot} onClose={() => setSelectedSlot(null)} onSuccess={handleBookingSuccess} />}
        </div>
    );
};

export default StudentPage;