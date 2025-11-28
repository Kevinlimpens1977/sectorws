import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot, Teacher } from '../types';
import api from '../services/supabaseApi';
import { InfoIcon } from '../components/common/Icons';
import TeacherSelection from '../components/teacher/TeacherSelection';
import Calendar from '../components/calendar/Calendar';
import TimeSlotList from '../components/calendar/TimeSlotList';
import BookingModal from '../components/booking/BookingModal';
import BookingConfirmation from '../components/booking/BookingConfirmation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const StudentPage: React.FC = () => {
    const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
    const [slots, setSlots] = useState<Slot[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
    const [confirmation, setConfirmation] = useState<{ date: string; time: string } | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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

    const handleNewBooking = () => {
        setConfirmation(null);
        setSelectedSlot(null);
        setSelectedDate(null);
    };

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

    const slotsForSelectedDate = selectedDate ? (slotsByDate[selectedDate] || []) : [];

    if (confirmation) {
        return (
            <BookingConfirmation
                date={confirmation.date}
                time={confirmation.time}
                onClose={() => setConfirmation(null)}
                onNewBooking={handleNewBooking}
            />
        );
    }

    if (!selectedTeacher) {
        return <TeacherSelection onSelect={setSelectedTeacher} />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto"
        >
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start space-x-4">
                    <div className="bg-violet-100 p-3 rounded-xl">
                        <InfoIcon className="w-6 h-6 text-violet-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-lg">Welkom!</h2>
                        <p className="text-slate-600">
                            Je plant een afspraak bij <span className='font-semibold text-violet-700'>{selectedTeacher === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina'}</span>.
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setSelectedTeacher(null)}
                    className="text-sm font-medium text-slate-500 hover:text-violet-600 hover:bg-violet-50 px-4 py-2 rounded-lg transition-colors"
                >
                    ← Wissel docent
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[400px]">
                            <LoadingSkeleton className="h-8 w-48 mb-6" />
                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: 35 }).map((_, i) => (
                                    <LoadingSkeleton key={i} className="h-10 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[400px]">
                            <LoadingSkeleton className="h-8 w-32 mb-6" />
                            <div className="space-y-3">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <LoadingSkeleton key={i} className="h-12 w-full rounded-xl" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {slots.length === 0 ? (
                        <div className="text-center bg-white p-12 rounded-2xl shadow-sm border border-slate-100">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <InfoIcon className="w-8 h-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Geen tijden beschikbaar</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Er zijn momenteel geen beschikbare tijdsloten voor deze docent.
                                Kom later terug of neem contact op met je docent.
                            </p>
                            <button
                                onClick={fetchSlots}
                                className="mt-6 text-violet-600 hover:text-violet-800 font-medium text-sm"
                            >
                                Probeer opnieuw
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-7">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex bg-slate-100 p-1 rounded-lg">
                                        <button
                                            onClick={() => setViewMode('calendar')}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'calendar' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Kalender
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${viewMode === 'list' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                        >
                                            Lijst
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            const todayStr = now.toISOString().split('T')[0];

                                            // Find first slot that is available and in the future (or today later)
                                            const nextSlot = slots
                                                .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
                                                .find(s => {
                                                    if (s.student_number) return false; // Booked
                                                    if (s.date < todayStr) return false; // Past date
                                                    if (s.date === todayStr) {
                                                        const [hours, minutes] = s.time.split(':').map(Number);
                                                        if (now.getHours() > hours || (now.getHours() === hours && now.getMinutes() >= minutes)) {
                                                            return false; // Past time today
                                                        }
                                                    }
                                                    return true;
                                                });

                                            if (nextSlot) {
                                                // Calculate month diff to switch calendar view
                                                const slotDate = new Date(nextSlot.date);
                                                const diff = (slotDate.getFullYear() - currentDate.getFullYear()) * 12 + (slotDate.getMonth() - currentDate.getMonth());
                                                if (diff !== 0) changeMonth(diff);

                                                setSelectedDate(nextSlot.date);
                                                setSelectedSlot(nextSlot);
                                                setViewMode('calendar');
                                            } else {
                                                // Show toast or alert
                                                alert('Geen beschikbare sloten gevonden in de toekomst.');
                                            }
                                        }}
                                        className="text-sm font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                                        </svg>
                                        Eerstvolgende plek
                                    </button>
                                </div>

                                {viewMode === 'calendar' ? (
                                    <Calendar
                                        currentDate={currentDate}
                                        onMonthChange={changeMonth}
                                        slots={slots}
                                        selectedDate={selectedDate}
                                        onDateSelect={setSelectedDate}
                                    />
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="p-4 border-b border-slate-100 bg-slate-50">
                                            <h3 className="font-bold text-slate-800">Alle Beschikbare Sloten</h3>
                                        </div>
                                        <div className="max-h-[500px] overflow-y-auto p-4 space-y-4">
                                            {Object.entries(slotsByDate)
                                                .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
                                                .filter(([_, daySlots]) => (daySlots as Slot[]).some(s => !s.student_number))
                                                .map(([date, daySlots]) => (
                                                    <div key={date}>
                                                        <h4 className="text-sm font-semibold text-slate-500 mb-2 sticky top-0 bg-white py-1">
                                                            {new Date(date).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                        </h4>
                                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                                            {(daySlots as Slot[]).filter(s => !s.student_number).map(slot => (
                                                                <button
                                                                    key={slot.id}
                                                                    onClick={() => setSelectedSlot(slot)}
                                                                    className="px-3 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                                                                >
                                                                    {slot.time}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            {slots.filter(s => !s.student_number).length === 0 && (
                                                <p className="text-center text-slate-500 py-8">Geen beschikbare sloten gevonden.</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="lg:col-span-5">
                                <TimeSlotList
                                    slots={slotsForSelectedDate}
                                    selectedDate={selectedDate}
                                    onSlotSelect={setSelectedSlot}
                                />
                            </div>
                        </div>
                    )}
                </>
            )}

            <AnimatePresence>
                {selectedSlot && (
                    <BookingModal
                        slot={selectedSlot}
                        onClose={() => setSelectedSlot(null)}
                        onSuccess={handleBookingSuccess}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default StudentPage;