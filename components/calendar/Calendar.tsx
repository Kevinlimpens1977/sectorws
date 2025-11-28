import React from 'react';
import { motion } from 'framer-motion';
import { Slot } from '../../types';
import { ArrowLeftIcon, ArrowRightIcon } from '../common/Icons';

interface CalendarProps {
    currentDate: Date;
    onMonthChange: (amount: number) => void;
    slots: Slot[];
    selectedDate: string | null;
    onDateSelect: (date: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({
    currentDate,
    onMonthChange,
    slots,
    selectedDate,
    onDateSelect
}) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Helper to get slots for a specific date
    const getSlotsForDate = (dateStr: string) => slots.filter(s => s.date === dateStr);

    const firstDayOfWeek = 1; // Start on Monday
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust so Monday is 0 and Sunday is 6
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const blanks = Array(firstDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    const weekDays = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onMonthChange(-1)}
                        className="p-2 rounded-full hover:bg-violet-50 text-violet-600 transition-colors"
                        aria-label="Vorige maand"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <h3 className="font-bold text-lg text-slate-800 capitalize min-w-[140px] text-center">
                        {currentDate.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                        onClick={() => onMonthChange(1)}
                        className="p-2 rounded-full hover:bg-violet-50 text-violet-600 transition-colors"
                        aria-label="Volgende maand"
                    >
                        <ArrowRightIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="date"
                        className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                        onChange={(e) => {
                            if (e.target.value) {
                                const newDate = new Date(e.target.value);
                                const diff = (newDate.getFullYear() - currentDate.getFullYear()) * 12 + (newDate.getMonth() - currentDate.getMonth());
                                onMonthChange(diff);
                                onDateSelect(e.target.value);
                            }
                        }}
                    />
                    <button
                        onClick={() => {
                            const today = new Date();
                            const diff = (today.getFullYear() - currentDate.getFullYear()) * 12 + (today.getMonth() - currentDate.getMonth());
                            onMonthChange(diff);
                            onDateSelect(today.toISOString().split('T')[0]);
                        }}
                        className="text-sm font-medium text-violet-600 hover:text-violet-800 hover:bg-violet-50 px-3 py-1.5 rounded-lg transition-colors"
                        aria-label="Ga naar vandaag"
                    >
                        Vandaag
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider py-2" aria-hidden="true">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2" role="grid">
                {blanks.map((_, i) => <div key={`blank-${i}`} className="aspect-square" role="gridcell"></div>)}

                {days.map(day => {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const daySlots = getSlotsForDate(dateStr);
                    const hasSlots = daySlots.length > 0;
                    const availableSlots = daySlots.filter(s => !s.student_number).length;
                    const isSelected = selectedDate === dateStr;
                    const isToday = new Date().toISOString().split('T')[0] === dateStr;

                    const fullDateLabel = new Date(dateStr).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' });
                    const availabilityLabel = hasSlots ? `${availableSlots} plekken beschikbaar` : 'Geen plekken beschikbaar';

                    return (
                        <motion.button
                            key={day}
                            whileHover={hasSlots ? { scale: 1.05 } : {}}
                            whileTap={hasSlots ? { scale: 0.95 } : {}}
                            onClick={() => hasSlots && onDateSelect(dateStr)}
                            disabled={!hasSlots}
                            aria-label={`${fullDateLabel}, ${availabilityLabel}`}
                            aria-selected={isSelected}
                            role="gridcell"
                            className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200
                ${!hasSlots ? 'text-slate-300 cursor-not-allowed bg-slate-50/50' : 'cursor-pointer'}
                ${hasSlots && !isSelected ? 'text-slate-700 hover:bg-violet-50 hover:text-violet-700 bg-white border border-slate-100 shadow-sm' : ''}
                ${isSelected ? 'bg-violet-600 text-white shadow-md ring-2 ring-violet-200 ring-offset-2' : ''}
                ${isToday && !isSelected ? 'ring-1 ring-violet-400' : ''}
              `}
                        >
                            <span className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                {day}
                            </span>

                            {hasSlots && (
                                <div className="mt-1 flex items-center gap-1">
                                    <span className={`text-[10px] font-medium px-1.5 rounded-full ${isSelected
                                        ? 'bg-white/20 text-white'
                                        : availableSlots > 0
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-red-100 text-red-700'
                                        }`}>
                                        {availableSlots}
                                    </span>
                                </div>
                            )}
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
