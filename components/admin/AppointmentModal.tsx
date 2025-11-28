import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot } from '../../types';

interface AppointmentModalProps {
    slot: Slot;
    onClose: () => void;
    onSave: (slotId: number, details: { present: boolean, notes: string, completed: boolean }) => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ slot, onClose, onSave }) => {
    const [present, setPresent] = useState(slot.present);
    const [notes, setNotes] = useState(slot.notes || '');
    const [completed, setCompleted] = useState(slot.completed);

    const handleSave = () => {
        onSave(slot.id, { present, notes, completed });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
                >
                    <div className="bg-violet-600 px-6 py-4 text-white flex justify-between items-center">
                        <h3 className="text-lg font-bold">Afspraak beheren</h3>
                        <button onClick={onClose} className="text-white/80 hover:text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="p-6">
                        <div className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Leerling</span>
                                <span className="font-semibold text-slate-900">{slot.studentInfo?.name}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Klas</span>
                                <span className="font-semibold text-slate-900">{slot.studentInfo?.class}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm text-slate-500">Onderwerp</span>
                                <span className="font-semibold text-slate-900 text-right truncate max-w-[200px]">{slot.studentInfo?.topic}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-slate-500">Tijdstip</span>
                                <span className="font-semibold text-violet-600">{slot.date} om {slot.time}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">Aantekeningen</label>
                                <textarea
                                    id="notes"
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    rows={4}
                                    className="input"
                                    placeholder="Notities over het gesprek..."
                                ></textarea>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setPresent(!present)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${present ? 'bg-violet-600 border-violet-600' : 'border-slate-300 bg-white'}`}>
                                    {present && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                                <span className="text-sm font-medium text-slate-700">Leerling was aanwezig</span>
                            </div>

                            <div className="flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setCompleted(!completed)}>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center ${completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 bg-white'}`}>
                                    {completed && <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-white" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                                </div>
                                <span className="text-sm font-medium text-slate-700">Gesprek afronden</span>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                            <button onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium">Annuleren</button>
                            <button onClick={handleSave} className="btn btn-primary">Opslaan</button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
};

export default AppointmentModal;
