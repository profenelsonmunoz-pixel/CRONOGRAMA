import React, { useState } from 'react';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  eventDates: Set<number>;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, eventDates }) => {
  const [displayDate, setDisplayDate] = useState(new Date(selectedDate));

  const spanishMonths = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = getTodayUTC().getTime();

  function getTodayUTC() {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }

  const changeMonth = (offset: number) => {
    setDisplayDate(prev => new Date(prev.getUTCFullYear(), prev.getUTCMonth() + offset, 1));
  };
  
  const renderHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <button onClick={() => changeMonth(-1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">&lt;</button>
      <div className="font-bold text-lg text-gray-800">
        {spanishMonths[displayDate.getUTCMonth()]} {displayDate.getUTCFullYear()}
      </div>
      <button onClick={() => changeMonth(1)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">&gt;</button>
    </div>
  );

  const renderDays = () => {
    const year = displayDate.getUTCFullYear();
    const month = displayDate.getUTCMonth();

    const firstDayOfMonth = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    
    const blanks = Array(firstDayOfMonth).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return [...blanks, ...days].map((day, index) => {
      if (!day) return <div key={`blank-${index}`} className="w-10 h-10"></div>;

      const date = new Date(Date.UTC(year, month, day));
      const time = date.getTime();
      
      const isSelected = time === selectedDate.getTime();
      const isToday = time === todayTime;
      const hasEvent = eventDates.has(time);
      
      let classNames = 'w-10 h-10 flex items-center justify-center rounded-full transition-colors cursor-pointer relative ';
      
      if (isSelected) {
        classNames += 'bg-blue-600 text-white font-bold ';
      } else if (isToday) {
        classNames += 'bg-blue-100 text-blue-700 font-semibold ';
      } else {
        classNames += 'hover:bg-gray-200 text-gray-700 ';
      }

      return (
        <div key={day} className="flex justify-center items-center">
          <button onClick={() => onDateSelect(date)} className={classNames}>
            {day}
            {hasEvent && !isSelected && <span className="absolute bottom-1 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>}
          </button>
        </div>
      );
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {renderHeader()}
      <div className="grid grid-cols-7 gap-y-2 text-center text-sm text-gray-500 font-medium mb-2">
        {weekDays.map(day => <div key={day}>{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-y-2">
        {renderDays()}
      </div>
    </div>
  );
};

export default Calendar;
