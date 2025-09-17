
import React from 'react';
import { CalendarIcon, CogIcon, SchoolIcon, LogoutIcon } from './Icons';

interface HeaderProps {
  currentView: 'schedule' | 'config';
  setView: (view: 'schedule' | 'config') => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView, isAuthenticated, onLogout }) => {
  const currentYear = new Date().getFullYear();

  const NavButton: React.FC<{
    view: 'schedule' | 'config';
    label: string;
    icon: JSX.Element;
  }> = ({ view, label, icon }) => {
    const isActive = currentView === view;
    const activeClasses = 'bg-blue-600 text-white';
    const inactiveClasses = 'bg-white text-gray-700 hover:bg-gray-200';
    return (
      <button
        onClick={() => setView(view)}
        className={`flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </button>
    );
  };

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-full text-white">
            <SchoolIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 uppercase">
            Cronograma IENSECAN {currentYear}
          </h1>
        </div>
        <nav className="flex items-center gap-2">
          <NavButton view="schedule" label="Cronograma" icon={<CalendarIcon className="w-5 h-5" />} />
          <NavButton view="config" label="Configuración" icon={<CogIcon className="w-5 h-5" />} />
          {isAuthenticated && currentView === 'config' && (
             <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-md shadow-sm transition-colors duration-200 bg-red-500 text-white hover:bg-red-600"
                aria-label="Cerrar sesión"
             >
                <LogoutIcon className="w-5 h-5" />
                <span className="hidden sm:inline">Salir</span>
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
