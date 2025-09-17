
import React from 'react';
import { ScheduleEvent } from '../types';
import { ClockIcon, LocationMarkerIcon, UserGroupIcon, InformationCircleIcon, SparklesIcon } from './Icons';

interface EventCardProps {
  event: ScheduleEvent;
}

const InfoRow: React.FC<{ icon: JSX.Element; label: string; value: string | undefined }> = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 text-blue-600 mt-1">{icon}</div>
      <div>
        <p className="font-semibold text-gray-600">{label}</p>
        <p className="text-gray-800">{value}</p>
      </div>
    </div>
  );
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  return (
    <div className="event-card-container bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-200 flex flex-col">
      <div className="p-5 bg-blue-600 text-white">
        <h3 className="text-xl font-bold flex items-center gap-2">
            <SparklesIcon className="w-6 h-6"/>
            {event.actividad}
        </h3>
      </div>
      <div className="p-5 space-y-4 flex-grow">
        <InfoRow icon={<ClockIcon className="w-5 h-5" />} label="Hora" value={event.hora} />
        <InfoRow icon={<LocationMarkerIcon className="w-5 h-5" />} label="Lugar" value={event.lugar} />
        <InfoRow icon={<UserGroupIcon className="w-5 h-5" />} label="Participan" value={event.participan} />
        <InfoRow icon={<InformationCircleIcon className="w-5 h-5" />} label="Observaciones" value={event.observaciones} />
      </div>
    </div>
  );
};

export default EventCard;