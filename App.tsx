import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import StudentPage from './pages/StudentPage';
import AdminPage from './pages/AdminPage';
import { AgendaIcon, AdminIcon } from './components/common/Icons';

const Header: React.FC = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="bg-violet-600 rounded-lg p-1.5 transition-transform group-hover:scale-105 group-hover:rotate-3 shadow-sm">
                            <AgendaIcon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                            Planning Sectorwerkstuk
                        </span>
                    </Link>
                    <Link
                        to="/admin"
                        className={`
                            inline-flex items-center text-sm font-medium px-4 py-2 rounded-full transition-all duration-200
                            ${isAdminPage
                                ? 'bg-violet-100 text-violet-700 ring-1 ring-violet-200'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }
                        `}
                    >
                        <AdminIcon className="w-4 h-4 mr-2" />
                        Docent Login
                    </Link>
                </div>
            </div>
        </header>
    );
};

const App: React.FC = () => {
    return (
        <HashRouter>
            <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
                <Toaster position="top-center" toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#333',
                        color: '#fff',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    success: {
                        style: {
                            background: '#10B981',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#10B981',
                        },
                    },
                    error: {
                        style: {
                            background: '#EF4444',
                        },
                        iconTheme: {
                            primary: '#fff',
                            secondary: '#EF4444',
                        },
                    },
                }} />

                <Header />

                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
                    <Routes>
                        <Route path="/" element={<StudentPage />} />
                        <Route path="/admin" element={<AdminPage />} />
                    </Routes>
                </main>

                <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <p className="text-sm text-slate-500">
                            &copy; {new Date().getFullYear()} Planning presentatie sectorwerkstuk. Alle rechten voorbehouden.
                        </p>
                    </div>
                </footer>
            </div>
        </HashRouter>
    );
}

export default App;