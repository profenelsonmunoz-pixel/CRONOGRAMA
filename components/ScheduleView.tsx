import React, { useMemo, useState, useRef, useEffect } from 'react';
import { ScheduleEvent } from '../types';
import { formatDate } from '../services/dateUtils';
import EventCard from './EventCard';
import Calendar from './Calendar';
import { CalendarIcon as DayHeaderIcon, ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface ScheduleViewProps {
  events: ScheduleEvent[];
}

const getTodayUTC = () => {
    const today = new Date();
    return new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
};

const ScheduleView: React.FC<ScheduleViewProps> = ({ events }) => {
  const [filter, setFilter] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState<Date>(getTodayUTC);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);
  const calendarButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCalendarOpen &&
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node) &&
        calendarButtonRef.current &&
        !calendarButtonRef.current.contains(event.target as Node)
      ) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCalendarOpen]);
  
  const eventDates = useMemo(() => 
    new Set(events.map(e => e.dateObject.getTime())),
    [events]
  );

  const { title, groupedEvents, totalEvents, allEventsInPeriod } = useMemo(() => {
    const groupEventsByDate = (eventList: ScheduleEvent[]) => {
      return eventList.reduce((acc, event) => {
        const dateKey = formatDate(event.dateObject);
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(event);
        return acc;
      }, {} as Record<string, ScheduleEvent[]>);
    };

    let periodEvents: ScheduleEvent[] = [];

    switch (filter) {
      case 'week': {
        const startOfWeek = new Date(selectedDate);
        const dayOfWeek = selectedDate.getUTCDay();
        const diff = selectedDate.getUTCDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setUTCDate(diff);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);

        periodEvents = events.filter(e => {
            const eventTime = e.dateObject.getTime();
            return eventTime >= startOfWeek.getTime() && eventTime <= endOfWeek.getTime();
        });
        
        return {
          title: `Semana del ${formatDate(startOfWeek)} al ${formatDate(endOfWeek)}`,
          groupedEvents: groupEventsByDate(periodEvents),
          totalEvents: periodEvents.length,
          allEventsInPeriod: periodEvents,
        };
      }
      case 'month': {
        periodEvents = events.filter(e => e.dateObject.getUTCMonth() === selectedDate.getUTCMonth() && e.dateObject.getUTCFullYear() === selectedDate.getUTCFullYear());
        return {
          title: `Eventos de ${selectedDate.toLocaleString('es-CO', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`,
          groupedEvents: groupEventsByDate(periodEvents),
          totalEvents: periodEvents.length,
          allEventsInPeriod: periodEvents,
        };
      }
      case 'day':
      default: {
        periodEvents = events.filter(e => e.dateObject.getTime() === selectedDate.getTime());
        return {
          title: formatDate(selectedDate),
          groupedEvents: groupEventsByDate(periodEvents),
          totalEvents: periodEvents.length,
          allEventsInPeriod: periodEvents,
        };
      }
    }
  }, [events, filter, selectedDate]);
  
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setFilter('day');
    setIsCalendarOpen(false); // Close calendar on selection
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    const offset = direction === 'next' ? 1 : -1;

    if (filter === 'day') {
      newDate.setUTCDate(newDate.getUTCDate() + offset);
    } else if (filter === 'week') {
      newDate.setUTCDate(newDate.getUTCDate() + (offset * 7));
    } else if (filter === 'month') {
      newDate.setUTCFullYear(newDate.getUTCFullYear() + offset);
    }
    setSelectedDate(newDate);
  };
  
  const FilterButton: React.FC<{
    label: string;
    view: 'day' | 'week' | 'month';
  }> = ({ label, view }) => {
    const isActive = filter === view;
    return (
      <button
        onClick={() => setFilter(view)}
        className={`px-4 py-2 text-sm sm:text-base rounded-lg font-semibold transition-all duration-200 ${
          isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {label}
      </button>
    );
  };
  
  return (
    <div className="space-y-6">
      <div className="relative">
        <div className="bg-white p-4 rounded-lg shadow-md space-y-4 printable-area">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-blue-700 capitalize">{title}</h2>
              <button
                ref={calendarButtonRef}
                onClick={() => setIsCalendarOpen(prev => !prev)}
                className="no-print p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                aria-label="Seleccionar fecha"
              >
                <DayHeaderIcon className="w-6 h-6 text-blue-700"/>
              </button>
            </div>
            <div className="flex flex-col items-end sm:flex-row sm:items-center gap-2 no-print">
                {(filter === 'day' || filter === 'week' || filter === 'month') && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleNavigation('prev')}
                      className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                      aria-label={filter === 'day' ? 'Día anterior' : filter === 'week' ? 'Semana anterior' : 'Año anterior'}
                    >
                      <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleNavigation('next')}
                      className="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                      aria-label={filter === 'day' ? 'Día siguiente' : filter === 'week' ? 'Semana siguiente' : 'Año siguiente'}
                    >
                      <ChevronRightIcon className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FilterButton label="Día" view="day" />
                  <FilterButton label="Semana" view="week" />
                  <FilterButton label="Mes" view="month" />
                </div>
            </div>
          </div>
          <p className="text-gray-600">
            {totalEvents > 0
              ? `Hay ${totalEvents} evento(s) en este período.`
              : 'No hay eventos programados para este período.'
            }
          </p>
        </div>

        {isCalendarOpen && (
          <div ref={calendarRef} className="absolute top-full right-0 mt-2 z-20 w-full max-w-sm no-print">
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              eventDates={eventDates}
            />
          </div>
        )}
      </div>

      {totalEvents > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedEvents).map(([date, dailyEvents]) => (
            <div key={date}>
              {filter !== 'day' && (
                <div className="flex items-center gap-4 p-3 bg-yellow-100 rounded-lg border-l-4 border-blue-800 mb-4">
                  <DayHeaderIcon className="w-8 h-8 text-blue-900"/>
                  <h3 className="text-xl font-semibold text-blue-900 capitalize">
                    {date}
                  </h3>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyEvents.map(event => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-gray-700">No hay eventos para mostrar.</h3>
          <p className="text-gray-500 mt-2">Puede seleccionar otra fecha usando el ícono de calendario o cargar un nuevo cronograma en la sección de configuración.</p>
        </div>
      )}
    </div>
  );
};

export default ScheduleView;