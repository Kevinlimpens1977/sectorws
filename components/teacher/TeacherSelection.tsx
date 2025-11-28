import React from 'react';
import { motion } from 'framer-motion';
import { Teacher, Teachers } from '../../types';
import { AgendaIcon } from '../common/Icons';

interface TeacherSelectionProps {
    onSelect: (teacher: Teacher) => void;
}

const TeacherSelection: React.FC<TeacherSelectionProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12 max-w-2xl"
            >
                <div className="flex justify-center mb-6">
                    <AgendaIcon className="w-20 h-20 text-violet-600" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                    Planning Sectorwerkstuk
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    Welkom bij de planningstool voor je sectorwerkstuk presentatie.
                    Kies hieronder je begeleider om de beschikbare tijden te bekijken en je presentatie in te plannen.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                {Teachers.map((teacher, index) => (
                    <motion.button
                        key={teacher}
                        initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                        onClick={() => onSelect(teacher)}
                        className="group relative overflow-hidden bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-100 text-left"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <AgendaIcon className="w-24 h-24 text-violet-600 transform rotate-12" />
                        </div>

                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-semibold mb-4">
                                Begeleider
                            </span>
                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                {teacher === 'Daemen' ? 'Mevrouw Daemen' : 'Meneer Martina'}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                Klik hier om de agenda te openen en een tijdslot te reserveren.
                            </p>
                            <div className="flex items-center text-violet-600 font-semibold group-hover:translate-x-1 transition-transform">
                                Bekijk agenda
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

export default TeacherSelection;
