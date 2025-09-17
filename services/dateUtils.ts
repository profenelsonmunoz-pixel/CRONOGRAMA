import { ScheduleEvent } from '../types';

// Raw event type before processing, to make dateObject optional
export type RawScheduleEvent = Omit<ScheduleEvent, 'id' | 'dateObject'>;

// Fix: Add missing date utility functions (parseDate, formatDate, formatToStandardDateString)
// to resolve import errors across the application.

const spanishMonths: { [key: string]: number } = {
  'enero': 0, 'febrero': 1, 'marzo': 2, 'abril': 3, 'mayo': 4, 'junio': 5,
  'julio': 6, 'agosto': 7, 'septiembre': 8, 'octubre': 9, 'noviembre': 10, 'diciembre': 11
};

/**
 * Parses a date string in Spanish format "DD Mes YYYY" into a Date object.
 * Returns null if the format is invalid.
 * It creates a UTC date to avoid timezone issues.
 * @param dateString - The date string to parse.
 */
export const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;

  // Normalize and split the string, handling "de" and multiple spaces
  const parts = dateString.trim().toLowerCase().replace(/\s+de\s+/g, ' ').split(/\s+/);
  
  if (parts.length < 3) {
      console.warn(`Invalid date format (not enough parts): "${dateString}"`);
      return null;
  }

  const day = parseInt(parts[0], 10);
  const monthName = parts[1];
  const year = parseInt(parts[parts.length - 1], 10); // Take last part as year

  const month = spanishMonths[monthName.replace(/,/g, '')]; // Remove commas from month name

  if (isNaN(day) || month === undefined || isNaN(year)) {
    console.warn(`Invalid date format (could not parse day, month, or year): "${dateString}"`);
    return null;
  }

  // Using UTC to prevent timezone shifts, as time of day is not specified and we want to treat dates consistently.
  return new Date(Date.UTC(year, month, day));
};

/**
 * Formats a Date object into a human-readable string for display.
 * Example: "lunes, 1 de septiembre de 2025"
 * @param date - The date object to format.
 */
export const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleDateString('es-CO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC', // Ensure consistency with UTC parsing
  });
};

const monthNamesSpanish = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Formats a Date object into the standard "DD Mes YYYY" string format.
 * Example: "01 Septiembre 2025"
 * @param date - The date object to format.
 */
export const formatToStandardDateString = (date: Date): string => {
    if (!date || isNaN(date.getTime())) return '';
    // Using UTC methods to be consistent with parseDate
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = monthNamesSpanish[date.getUTCMonth()];
    const year = date.getUTCFullYear();
    return `${day} ${month} ${year}`;
};
