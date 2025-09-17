import React, { useState, useEffect } from 'react';
import { ScheduleEvent } from './types';
import { initialScheduleData } from './services/scheduleData';
import { parseDate } from './services/dateUtils';
import { initializeUsers, getLoggedInUser, logout } from './services/authService';
import Header from './components/Header';
import ScheduleView from './components/ScheduleView';
import ConfigurationView from './components/ConfigurationView';
import LoginView from './components/LoginView';
import { SchoolIcon } from './components/Icons';

const EVENTS_STORAGE_KEY = 'cronograma_iensecan_events';

const App: React.FC = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [view, setView] = useState<'schedule' | 'config'>('schedule');
  const [isAuthenticated, setIsAuthenticated] = useState(!!getLoggedInUser());

  useEffect(() => {
    // Initialize default admin user if not present
    initializeUsers();

    const storedEventsJson = localStorage.getItem(EVENTS_STORAGE_KEY);
    let loadedEvents: ScheduleEvent[] = [];

    if (storedEventsJson) {
      // If there's data in localStorage, parse it and recreate Date objects
      const parsedStoredEvents: ScheduleEvent[] = JSON.parse(storedEventsJson);
      loadedEvents = parsedStoredEvents.map(event => ({
        ...event,
        dateObject: new Date(event.dateObject), // The date was stringified, convert back to Date object
      }));
    } else {
      // If localStorage is empty, use initial data
      const processedEvents = initialScheduleData
        .map((event, index) => ({
          ...event,
          id: `${Date.now()}-${index}`, // Ensure unique ID
          dateObject: parseDate(event.fecha), // Updated to use new parseDate signature
        }))
        .filter(event => event.dateObject !== null) as ScheduleEvent[];
      
      loadedEvents = processedEvents;
      // Save initial data to localStorage
      localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(loadedEvents));
    }
    
    loadedEvents.sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());
    setEvents(loadedEvents);
  }, []);

  const handleEventsUpdate = (updatedEvents: ScheduleEvent[]) => {
    const sortedEvents = [...updatedEvents].sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());
    setEvents(sortedEvents);
    localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(sortedEvents));
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    setView('schedule'); // Redirect to schedule view on logout
  };
  
  const renderContent = () => {
    if (view === 'schedule') {
      return <ScheduleView events={events} />;
    }
    if (view === 'config') {
      if (isAuthenticated) {
        return <ConfigurationView events={events} setEvents={handleEventsUpdate} />;
      }
      return <LoginView onLoginSuccess={() => setIsAuthenticated(true)} />;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header 
        currentView={view} 
        setView={setView} 
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <main className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto">
        {renderContent()}
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm mt-8 border-t">
        <div className="flex items-center justify-center gap-2">
            <SchoolIcon className="w-6 h-6"/>
            <span>Institución Educativa Nuestra Señora de la Candelaria</span>
        </div>
        <p>Candelaria - Valle</p>
      </footer>
    </div>
  );
};

export default App;