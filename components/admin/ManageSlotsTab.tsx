import React, { useState, useEffect, useCallback } from 'react';
import { Slot, Teacher } from '../../types';
import api from '../../services/supabaseApi';
import { ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';
import LoadingSpinner from '../common/LoadingSpinner';
import LoadingSkeleton from '../common/LoadingSkeleton';
import toast from 'react-hot-toast';

interface ManageSlotsTabProps {
    teacher: Teacher;
}

const getStartOfWeek = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
};

const toYYYYMMDD = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getWeekNumber = (d: Date): [number, number] => {
    d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    return [d.getUTCFullYear(), weekNo];
}

const ManageSlotsTab: React.FC<ManageSlotsTabProps> = ({ teacher }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [slotsForWeek, setSlotsForWeek] = useState<Record<string, Slot[]>>({});
    const [isLoading, setIsLoading] = useState(true);

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
            toast.error('Kon de tijdsloten niet ophalen.');
        } finally {
            setIsLoading(false);
        }
    }, [teacher, startOfWeek.getTime()]);

    useEffect(() => {
        fetchSlotsForWeek();
    }, [fetchSlotsForWeek]);

    const handleWeekChange = (direction: 'prev' | 'next') => {
        const newDate = new Date(startOfWeek);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        setCurrentDate(newDate);
    };

    const handleSlotClick = async (date: string, time: string) => {
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

            // Show toast based on action
            if (updatedSlot.available) {
                toast.success('Slot geopend');
            } else {
                toast.success('Slot gesloten');
            }
        } else {
            toast.error(result.message);
        }
    };

    const formatTime = (time: string) => {
        return time.substring(0, 5);
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Tijdsloten Beheren</h2>
                    <p className="text-slate-500 text-sm">Klik op een tijdslot om deze te openen (groen) of te sluiten (paars).</p>
                </div>

                <div className="flex items-center bg-slate-50 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => handleWeekChange('prev')}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                        aria-label="Vorige week"
                    >
                        <ArrowLeftIcon className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-semibold text-slate-700 text-sm">Week {weekNumber}, {year}</span>
                    <button
                        onClick={() => handleWeekChange('next')}
                        className="p-2 hover:bg-white hover:shadow-sm rounded-md text-slate-600 transition-all"
                        aria-label="Volgende week"
                    >
                        <ArrowRightIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="rounded-xl overflow-hidden border border-slate-200 h-[400px]">
                            <div className="p-3 border-b border-slate-200 bg-slate-50">
                                <LoadingSkeleton className="h-4 w-12 mx-auto mb-1" />
                                <LoadingSkeleton className="h-6 w-8 mx-auto" />
                            </div>
                            <div className="p-2 space-y-2 bg-white">
                                {Array.from({ length: 8 }).map((_, j) => (
                                    <LoadingSkeleton key={j} className="h-8 w-full rounded-lg" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {weekDays.map(({ label, date }) => {
                        const dateStr = toYYYYMMDD(date);
                        const slotsForThisDay = slotsForWeek[dateStr] || [];
                        const isToday = new Date().toISOString().split('T')[0] === dateStr;

                        return (
                            <div key={dateStr} className={`rounded-xl overflow-hidden border ${isToday ? 'border-violet-300 ring-1 ring-violet-200' : 'border-slate-200'}`}>
                                <div className={`p-3 text-center font-semibold border-b ${isToday ? 'bg-violet-50 text-violet-800 border-violet-200' : 'bg-slate-50 text-slate-700 border-slate-200'}`}>
                                    <span className="block text-xs uppercase tracking-wider opacity-70">{label}</span>
                                    <span className="block text-xl">{date.getDate()}</span>
                                </div>
                                <div className="p-2 space-y-2 bg-white h-full min-h-[300px]">
                                    {(() => {
                                        // Combine predefined times with actual slot times to ensure custom slots are shown
                                        const existingTimes = slotsForThisDay.map(s => formatTime(s.time));
                                        const allTimes = Array.from(new Set([...ALL_DAY_TIMES, ...existingTimes])).sort();

                                        return allTimes.map(time => {
                                            const slot = slotsForThisDay.find(s => formatTime(s.time) === time);
                                            const isBooked = !!slot?.student_number;
                                            const isAvailable = slot?.available ?? false;

                                            let buttonClass = '';
                                            if (isBooked) {
                                                buttonClass = 'bg-rose-100 text-rose-800 border-rose-200 cursor-not-allowed opacity-60';
                                            } else if (isAvailable) {
                                                buttonClass = 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200';
                                            } else {
                                                // Only show unbooked/unavailable slots if they are in the standard list
                                                // Custom slots that are not available/booked shouldn't really exist (they are created as available)
                                                // But if they do, we show them.
                                                // However, we only want to show "empty" buttons for standard times.
                                                if (!ALL_DAY_TIMES.includes(time) && !slot) return null;

                                                buttonClass = 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-violet-50 hover:text-violet-600 hover:border-violet-200';
                                            }

                                            return (
                                                <button
                                                    key={time}
                                                    onClick={() => handleSlotClick(dateStr, time)}
                                                    disabled={isBooked}
                                                    className={`w-full p-2 rounded-lg text-center text-xs font-semibold transition-all border ${buttonClass}`}
                                                >
                                                    {time}
                                                    {isBooked && <span className="block text-[10px] font-normal">Geboekt</span>}
                                                </button>
                                            );
                                        });
                                    })()}

                                    {/* Custom Slot Input */}
                                    <div className="pt-2 mt-2 border-t border-slate-100">
                                        <form
                                            onSubmit={(e) => {
                                                e.preventDefault();
                                                const form = e.target as HTMLFormElement;
                                                const input = form.elements.namedItem('time') as HTMLInputElement;
                                                if (input.value) {
                                                    handleSlotClick(dateStr, input.value);
                                                    input.value = '';
                                                }
                                            }}
                                            className="flex gap-1"
                                        >
                                            <input
                                                type="time"
                                                name="time"
                                                className="input text-xs py-1 px-2 h-8"
                                                required
                                            />
                                            <button
                                                type="submit"
                                                className="bg-violet-600 text-white rounded-md px-2 hover:bg-violet-700 flex items-center justify-center h-8 w-8"
                                                title="Tijdslot toevoegen"
                                            >
                                                +
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default ManageSlotsTab;
