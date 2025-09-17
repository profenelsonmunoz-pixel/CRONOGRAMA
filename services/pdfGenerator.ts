// Fix(TS2339): Changed the named import to a default import for `jspdf`.
// The named import `{ jsPDF }` can sometimes resolve to an incomplete interface,
// which caused the type checker to not find methods like `.text()` and `.save()`.
// The default import `jsPDF` correctly provides the full class definition.
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ScheduleEvent } from '../types';

// Extend the jsPDF type to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

export const generatePdf = (title: string, events: ScheduleEvent[], selectedColumns: (keyof ScheduleEvent)[]) => {
  const doc = new jsPDF() as jsPDFWithAutoTable;

  doc.text(title, 14, 20);
  
  const columnLabels: { [key: string]: string } = {
    fecha: "Fecha",
    hora: "Hora",
    actividad: "Actividad",
    lugar: "Lugar",
    participan: "Participan",
    observaciones: "Observaciones",
  };

  const tableColumn = selectedColumns.map(key => columnLabels[key] || String(key));
  const tableRows: (string | null)[][] = [];

  events.forEach(event => {
    const eventData = selectedColumns.map(key => {
      if (key === 'fecha') {
        return `${event.dia}, ${event.fecha}`;
      }
      return event[key] as string | null;
    });
    tableRows.push(eventData);
  });
  
  if (tableRows.length === 0) {
      doc.text("No hay eventos para el período seleccionado.", 14, 30);
  } else {
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 25,
        theme: 'grid',
        styles: {
            fontSize: 8,
            cellPadding: 2,
        },
        headStyles: {
            fillColor: [41, 128, 185],
            textColor: 255,
            fontStyle: 'bold',
        }
      });
  }

  doc.save(`${title.replace(/ /g, '_')}.pdf`);
};
