
export interface ScheduleEvent {
  id: string;
  fecha: string;
  dia: string;
  hora: string;
  lugar: string;
  actividad: string;
  participan: string;
  observaciones: string;
  dateObject: Date;
}

// Raw event type before processing, to make dateObject optional
export type RawScheduleEvent = Omit<ScheduleEvent, 'id' | 'dateObject'>;

export interface User {
  username: string;
  password: string; // In a real-world app, this would be a hash
}
