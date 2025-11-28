import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckIcon, CalendarIcon } from '../common/Icons';
import { generateICS } from '../../utils/ical';

interface BookingConfirmationProps {
    date: string;
    time: string;
    onClose: () => void;
    onNewBooking: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ date, time, onClose, onNewBooking }) => {
    const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const handleDownloadCalendar = () => {
        // Calculate end time (assuming 30 min slots)
        const startDate = new Date(`${date}T${time}:00`);
        const endDate = new Date(startDate.getTime() + 30 * 60000);

        generateICS({
            title: 'Presentatie Sectorwerkstuk',
            description: 'Presentatie van je sectorwerkstuk.',
            location: 'School',
            startTime: startDate.toISOString(),
            endTime: endDate.toISOString(),
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckIcon className="w-10 h-10 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Afspraak Bevestigd!</h2>
                    <p className="text-slate-600 mb-8">
                        Je afspraak is succesvol ingepland op <br />
                        <span className="font-semibold text-violet-700">{formattedDate}</span> om <span className="font-semibold text-violet-700">{time}</span>.
                    </p>

                    <div className="space-y-3">
                        <button
                            onClick={handleDownloadCalendar}
                            className="w-full btn btn-secondary flex items-center justify-center gap-2"
                        >
                            <CalendarIcon className="w-5 h-5" />
                            Toevoegen aan agenda
                        </button>

                        <button
                            onClick={() => window.print()}
                            className="w-full btn btn-secondary flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                            </svg>
                            Print Details
                        </button>

                        <button
                            onClick={onNewBooking}
                            className="w-full btn bg-violet-50 text-violet-700 hover:bg-violet-100"
                        >
                            Nieuwe afspraak maken
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full btn text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                        >
                            Sluiten
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingConfirmation;
