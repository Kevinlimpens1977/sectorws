import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slot, ClassOptions } from '../../types';
import api from '../../services/supabaseApi';
import { bookingSchema, BookingFormData } from '../../utils/validation';
import { z } from 'zod';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

interface BookingModalProps {
    slot: Slot;
    onClose: () => void;
    onSuccess: (confirmation: { date: string; time: string }) => void;
}

const BookingModal: React.FC<BookingModalProps> = ({ slot, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<BookingFormData>({
        name: '',
        studentNumber: '',
        studentClass: ClassOptions[0],
        topic: '',
    });
    const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [generalError, setGeneralError] = useState('');

    const formattedDate = new Date(slot.date + 'T00:00:00').toLocaleDateString('nl-NL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const validateField = (field: keyof BookingFormData, value: string) => {
        try {
            if (field === 'studentNumber') {
                z.string()
                    .min(5, 'Leerlingnummer moet minimaal 5 cijfers bevatten')
                    .max(8, 'Leerlingnummer mag maximaal 8 cijfers bevatten')
                    .regex(/^\d+$/, 'Leerlingnummer mag alleen cijfers bevatten')
                    .parse(value);
            } else {
                bookingSchema.shape[field].parse(value);
            }

            setErrors(prev => ({ ...prev, [field]: undefined }));
        } catch (error) {
            if (error instanceof z.ZodError) {
                setErrors(prev => ({ ...prev, [field]: error.issues[0].message }));
            }
        }
    };

    const handleChange = (field: keyof BookingFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Removed immediate validation to prevent freezing/re-renders on every keystroke
        // validateField(field, value); 
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setGeneralError('');

        try {
            // Define a local schema that includes the specific student number validation
            // This overrides the general bookingSchema for this specific form submission
            const extendedSchema = bookingSchema.extend({
                studentNumber: z.string()
                    .min(5, 'Leerlingnummer moet minimaal 5 cijfers bevatten')
                    .max(8, 'Leerlingnummer mag maximaal 8 cijfers bevatten')
                    .regex(/^\d+$/, 'Leerlingnummer mag alleen cijfers bevatten')
            });

            // Validate all fields
            extendedSchema.parse(formData);

            setIsLoading(true);
            const result = await api.bookSlot(slot.id, {
                name: formData.name,
                class: formData.studentClass,
                student_number: formData.studentNumber,
                topic: formData.topic
            });

            if (result.success) {
                toast.success('Afspraak succesvol ingepland!');
                onSuccess({ date: slot.date, time: slot.time });
            } else {
                setGeneralError(result.message || 'Er is iets misgegaan. Probeer het opnieuw.');
                toast.error(result.message || 'Er is iets misgegaan.');
            }
        } catch (error) {
            if (error instanceof z.ZodError) {
                const newErrors: Partial<Record<keyof BookingFormData, string>> = {};
                error.issues.forEach(err => {
                    if (err.path[0]) {
                        newErrors[err.path[0] as keyof BookingFormData] = err.message;
                    }
                });
                setErrors(newErrors);
            } else {
                console.error('Booking error:', error);
                setGeneralError('Er is een onverwachte fout opgetreden. Probeer het later opnieuw.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
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
                    <div className="bg-violet-600 px-6 py-4 text-white">
                        <h2 className="text-xl font-bold">Afspraak Inplannen</h2>
                        <p className="text-violet-100 text-sm mt-1">
                            {formattedDate} om {slot.time}
                        </p>
                    </div>

                    <div className="p-6">
                        {generalError && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                {generalError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Volledige Naam</label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className={`input ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                        placeholder="Bijv. Jan Jansen"
                                    />
                                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="studentNumber" className="block text-sm font-medium text-slate-700 mb-1">Leerlingnummer</label>
                                    <input
                                        type="text"
                                        id="studentNumber"
                                        value={formData.studentNumber}
                                        onChange={(e) => handleChange('studentNumber', e.target.value)}
                                        className={`input ${errors.studentNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                        placeholder="12345"
                                    />
                                    {errors.studentNumber && <p className="mt-1 text-xs text-red-600">{errors.studentNumber}</p>}
                                </div>

                                <div>
                                    <label htmlFor="studentClass" className="block text-sm font-medium text-slate-700 mb-1">Klas</label>
                                    <select
                                        id="studentClass"
                                        value={formData.studentClass}
                                        onChange={(e) => handleChange('studentClass', e.target.value)}
                                        className="input"
                                    >
                                        {ClassOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
                                        Onderwerp Sectorwerkstuk
                                        <span className="ml-2 text-xs text-slate-400 font-normal">({formData.topic.length}/100)</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="topic"
                                        value={formData.topic}
                                        onChange={(e) => handleChange('topic', e.target.value)}
                                        className={`input ${errors.topic ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : ''}`}
                                        placeholder="Waar gaat je presentatie over?"
                                        maxLength={100}
                                    />
                                    {errors.topic && <p className="mt-1 text-xs text-red-600">{errors.topic}</p>}
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end space-x-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors font-medium"
                                >
                                    Annuleren
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn btn-primary min-w-[120px]"
                                >
                                    {isLoading ? <LoadingSpinner size="sm" className="text-white" /> : 'Bevestigen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BookingModal;
