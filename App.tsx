import React from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import StudentPage from './pages/StudentPage';
import AdminPage from './pages/AdminPage';

// New 3D Agenda Icon Component
const AgendaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
        className={className || "w-10 h-10"}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Shadow Layer for 3D effect */}
        <rect x="4" y="6" width="17" height="15" rx="2" className="text-black/20" transform="translate(1, 1)"/>
        
        {/* Main Body */}
        <rect x="3" y="5" width="18" height="16" rx="2" className="text-white" stroke="#4B5563" strokeWidth="1"/>

        {/* Top Bar / Binding */}
        <rect x="3" y="5" width="18" height="5" rx="2" ry="2" className="text-green-500"/>
        
        {/* Rings */}
        <circle cx="8" cy="5.5" r="1.5" className="text-slate-600"/>
        <circle cx="16" cy="5.5" r="1.5" className="text-slate-600"/>

        {/* Content placeholder */}
        <rect x="7" y="12" width="10" height="2" rx="1" className="text-slate-300"/>
        <rect x="7" y="16" width="7" height="2" rx="1" className="text-slate-300"/>
    </svg>
);


const AdminIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
      <path fillRule="evenodd" d="M18 8a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
    </svg>
);


const Header: React.FC = () => {
    const location = useLocation();
    const isAdminPage = location.pathname.startsWith('/admin');

    return (
        <header className="bg-gradient-to-r from-gray-100/80 to-green-100/80 backdrop-blur-lg shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-3">
                    <Link to="/" className="flex items-center gap-2 group">
                        <AgendaIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-3deg]" />
                        <span className="text-xl md:text-2xl font-bold text-slate-800" style={{ textShadow: '1px 2px 3px rgba(0,0,0,0.15)'}}>
                            Planning presentatie sectorwerkstuk
                        </span>
                    </Link>
                    <Link 
                        to="/admin" 
                        className={`inline-flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 shadow-sm ${
                            isAdminPage 
                            ? 'bg-violet-600 text-white' 
                            : 'text-violet-700 bg-white/80 border border-violet-200 hover:bg-violet-50'
                        }`}
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
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="container mx-auto flex-grow p-4 sm:p-6 lg:p-8">
                <Routes>
                    <Route path="/" element={<StudentPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                </Routes>
            </main>
            <footer className="bg-white mt-8 py-4 text-center text-xs text-slate-500 border-t border-slate-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <p>&copy; {new Date().getFullYear()} Planning presentatie sectorwerkstuk</p>
                </div>
            </footer>
        </div>
    </HashRouter>
  );
}

export default App;