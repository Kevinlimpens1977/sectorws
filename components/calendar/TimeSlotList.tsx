import React from 'react';
import { motion } from 'framer-motion';
import { Slot } from '../../types';
import { ClockIcon } from '../common/Icons';

interface TimeSlotListProps {
    slots: Slot[];
    selectedDate: string | null;
    onSlotSelect: (slot: Slot) => void;
}

const TimeSlotList: React.FC<TimeSlotListProps> = ({ slots, selectedDate, onSlotSelect }) => {
    const [filter, setFilter] = React.useState<'all' | 'morning' | 'afternoon'>('all');

    if (!selectedDate) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 h-full flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <ClockIcon className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Kies een datum</h3>
                <p className="text-slate-500 text-sm max-w-[200px]">
                    Selecteer een datum in de kalender om de beschikbare tijden te zien.
                </p>
            </div>
        );
    }

    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('nl-NL', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const availableSlots = slots.filter(s => !s.student_number).sort((a, b) => a.time.localeCompare(b.time));

    const filteredSlots = availableSlots.filter(slot => {
        const hour = parseInt(slot.time.split(':')[0]);
        if (filter === 'morning') return hour < 12;
        if (filter === 'afternoon') return hour >= 12;
        return true;
    });

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 h-full">
            <div className="mb-6 border-b border-slate-100 pb-4">
                <h3 className="font-bold text-lg text-slate-800 mb-1">Beschikbare tijden</h3>
                <p className="text-sm text-slate-500 capitalize">{formattedDate}</p>
            </div>

            <div className="flex p-1 bg-slate-100 rounded-lg mb-4" role="group" aria-label="Filter tijdsloten">
                <button
                    onClick={() => setFilter('all')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    aria-pressed={filter === 'all'}
                >
                    Alles
                </button>
                <button
                    onClick={() => setFilter('morning')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'morning' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    aria-pressed={filter === 'morning'}
                >
                    Ochtend
                </button>
                <button
                    onClick={() => setFilter('afternoon')}
                    className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${filter === 'afternoon' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    aria-pressed={filter === 'afternoon'}
                >
                    Middag
                </button>
            </div>

            {filteredSlots.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" role="list">
                    {filteredSlots.map((slot, index) => (
                        <motion.button
                            key={slot.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-secondary-50)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onSlotSelect(slot)}
                            aria-label={`Boek tijdslot om ${slot.time}`}
                            role="listitem"
                            className="
                p-3 rounded-xl text-center font-semibold transition-colors
                bg-white border border-emerald-200 text-emerald-700
                hover:border-emerald-400 hover:shadow-md
                flex items-center justify-center gap-2
              "
                        >
                            <ClockIcon className="w-4 h-4" />
                            {slot.time}
                        </motion.button>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-slate-500">Geen tijden beschikbaar {filter !== 'all' ? 'in dit dagdeel' : 'op deze dag'}.</p>
                </div>
            )}
        </div>
    );
};

export default TimeSlotList;
