import React, { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { ScheduleEvent, RawScheduleEvent } from '../types';
import { parseDate, formatToStandardDateString } from '../services/dateUtils';
import { UploadIcon, DownloadIcon, KeyIcon, UserAddIcon, EditIcon, DeleteIcon } from './Icons';
import { getLoggedInUser, changePassword, addUser } from '../services/authService';

interface ConfigurationViewProps {
  events: ScheduleEvent[];
  setEvents: (events: ScheduleEvent[]) => void;
}

// --- Event Form Modal Component ---
interface EventFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ScheduleEvent) => void;
  eventToEdit: ScheduleEvent | null;
}

const emptyEvent: Omit<ScheduleEvent, 'id' | 'dateObject'> = {
  fecha: '',
  dia: '',
  hora: '',
  lugar: '',
  actividad: '',
  participan: '',
  observaciones: '',
};

const EventFormModal: React.FC<EventFormModalProps> = ({ isOpen, onClose, onSave, eventToEdit }) => {
  const [formData, setFormData] = useState<Omit<ScheduleEvent, 'id' | 'dateObject'>>(emptyEvent);
  const [error, setError] = useState<string | null>(null);

  // FIX: Replaced buggy useState initializer with useEffect to correctly populate the form
  // when the modal opens or the event to edit changes.
  useEffect(() => {
    if (isOpen) {
      if (eventToEdit) {
        setFormData(eventToEdit);
      } else {
        setFormData(emptyEvent);
      }
      setError(null);
    }
  }, [isOpen, eventToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.actividad || !formData.fecha) {
      setError('La actividad y la fecha son campos obligatorios.');
      return;
    }
    
    const dateObject = parseDate(formData.fecha);
    if (!dateObject) {
      setError('El formato de la fecha es inválido. Use "DD Mes AAAA", por ejemplo: "01 Septiembre 2025".');
      return;
    }

    const eventToSave: ScheduleEvent = {
      ...formData,
      id: eventToEdit?.id || `${Date.now()}-${Math.random()}`,
      dateObject,
      fecha: formatToStandardDateString(dateObject),
    };

    onSave(eventToSave);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-full overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">{eventToEdit ? 'Editar Evento' : 'Crear Nuevo Evento'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="actividad" className="block text-sm font-medium text-gray-700">Actividad</label>
            <input type="text" name="actividad" id="actividad" value={formData.actividad} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fecha" className="block text-sm font-medium text-gray-700">Fecha</label>
              <input type="text" name="fecha" id="fecha" value={formData.fecha} onChange={handleChange} placeholder="Ej: 01 Septiembre 2025" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="dia" className="block text-sm font-medium text-gray-700">Día</label>
              <input type="text" name="dia" id="dia" value={formData.dia} onChange={handleChange} placeholder="Ej: Lunes" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="hora" className="block text-sm font-medium text-gray-700">Hora</label>
              <input type="text" name="hora" id="hora" value={formData.hora} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
            <div>
              <label htmlFor="lugar" className="block text-sm font-medium text-gray-700">Lugar</label>
              <input type="text" name="lugar" id="lugar" value={formData.lugar} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label htmlFor="participan" className="block text-sm font-medium text-gray-700">Participan</label>
            <textarea name="participan" id="participan" value={formData.participan} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
          </div>
          <div>
            <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700">Observaciones</label>
            <textarea name="observaciones" id="observaciones" value={formData.observaciones} onChange={handleChange} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"></textarea>
          </div>

          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 my-2 rounded" role="alert">
              <p className="text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Guardar Cambios</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// --- User Management Component ---
const UserManagement: React.FC = () => {
    const [currentUser] = useState(getLoggedInUser());
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [changePassMessage, setChangePassMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [newUsername, setNewUsername] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [addUserMessage, setAddUserMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setChangePassMessage(null);
        if (newPassword !== confirmNewPassword) {
            setChangePassMessage({ type: 'error', text: 'Las contraseñas nuevas no coinciden.' });
            return;
        }
        if (!currentUser) return;

        const result = changePassword(currentUser.username, oldPassword, newPassword);
        setChangePassMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if(result.success) {
            setOldPassword('');
            setNewPassword('');
            setConfirmNewPassword('');
        }
    };
    
    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setAddUserMessage(null);
        const result = addUser(newUsername, newUserPassword);
        setAddUserMessage({ type: result.success ? 'success' : 'error', text: result.message });
        if(result.success) {
            setNewUsername('');
            setNewUserPassword('');
        }
    };

    if (!currentUser) return null;

    return (
        <div className="bg-white p-6 rounded-lg shadow-md space-y-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Gestión de Usuarios</h2>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2"><KeyIcon className="w-5 h-5 text-blue-600"/>Cambiar mi Contraseña ({currentUser.username})</h3>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                    <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                    <input type="password" value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                 </div>
                 {changePassMessage && (
                     <div className={`${changePassMessage.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-3 my-2 rounded`} role="alert">
                         <p className="text-sm">{changePassMessage.text}</p>
                     </div>
                 )}
                 <button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Actualizar Contraseña</button>
            </form>

            <hr/>

            <form onSubmit={handleAddUser} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2"><UserAddIcon className="w-5 h-5 text-blue-600"/>Añadir Nuevo Usuario</h3>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nuevo Nombre de Usuario</label>
                    <input type="text" value={newUsername} onChange={e => setNewUsername(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700">Contraseña del Nuevo Usuario</label>
                    <input type="password" value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"/>
                </div>
                {addUserMessage && (
                     <div className={`${addUserMessage.type === 'success' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-3 my-2 rounded`} role="alert">
                         <p className="text-sm">{addUserMessage.text}</p>
                     </div>
                )}
                 <button type="submit" className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Crear Usuario</button>
            </form>
        </div>
    );
};


// --- Excel Utility Functions ---
const generateExcelTemplate = () => {
  const displayHeaders = ['Fecha (Ej: 01 Septiembre 2025)','Día (Ej: Lunes)','Hora','Lugar','Actividad','Participan','Observaciones'];
  const ws = XLSX.utils.aoa_to_sheet([displayHeaders]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
  XLSX.writeFile(wb, 'plantilla_cronograma.xlsx');
};
type ParsedEventResult = Partial<RawScheduleEvent> & { dateObject: Date | null };
const parseExcelFile = (file: File): Promise<ParsedEventResult[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        const workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (jsonData.length < 2) { resolve([]); return; }
        const rows = jsonData.slice(1);
        const events: ParsedEventResult[] = rows.map(row => {
          const rawDate = row[0];
          let dateObject: Date | null = null;
          let fechaString: string = '';
          if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
            dateObject = new Date(Date.UTC(rawDate.getFullYear(), rawDate.getMonth(), rawDate.getDate()));
            fechaString = formatToStandardDateString(dateObject);
          } else if (typeof rawDate === 'string' && rawDate.trim()) {
            fechaString = rawDate.trim();
            dateObject = parseDate(fechaString);
            if (dateObject) { fechaString = formatToStandardDateString(dateObject); }
          }
          return {
            fecha: fechaString,
            dia: String(row[1] || '').trim(),
            hora: String(row[2] || '').trim(),
            lugar: String(row[3] || '').trim(),
            actividad: String(row[4] || '').trim(),
            participan: String(row[5] || '').trim(),
            observaciones: String(row[6] || '').trim(),
            dateObject: dateObject,
          };
        });
        resolve(events);
      } catch (error) { reject(error); }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
};


const ConfigurationView: React.FC<ConfigurationViewProps> = ({ events, setEvents }) => {
  const [localEvents, setLocalEvents] = useState<ScheduleEvent[]>(events);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ScheduleEvent | null>(null);

  // FIX: Added useEffect to synchronize the local component state with the main application state (props).
  // This ensures that after saving, the configuration view accurately reflects the updated event list.
  useEffect(() => {
    setLocalEvents(events);
  }, [events]);

  const handleExcelUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(null);
    setFileName(file.name);

    try {
      const parsedData = await parseExcelFile(file);
      if (!Array.isArray(parsedData)) throw new Error("Formato inválido: El archivo no pudo ser procesado.");
      const validEvents: ScheduleEvent[] = [];
      let invalidDateCount = 0;
      parsedData.forEach((item, index) => {
        if (item.dateObject && item.fecha && item.actividad) {
          validEvents.push({
            id: `${Date.now()}-${index}`, fecha: item.fecha, dia: item.dia || '', hora: item.hora || '', lugar: item.lugar || '', actividad: item.actividad, participan: item.participan || '', observaciones: item.observaciones || '', dateObject: item.dateObject,
          });
        } else if(item.fecha || item.actividad) {
          invalidDateCount++;
        }
      });

      const existingEventKeys = new Set(localEvents.map(ev => `${ev.fecha}|${ev.hora}|${ev.actividad}`));
      const uniqueNewEvents = validEvents.filter(newEvent => !existingEventKeys.has(`${newEvent.fecha}|${newEvent.hora}|${newEvent.actividad}`));
      const addedCount = uniqueNewEvents.length;
      const duplicateCount = validEvents.length - addedCount;

      if (addedCount > 0) {
        setLocalEvents([...localEvents, ...uniqueNewEvents]);
        setHasChanges(true);
      }

      let successMessage = `Proceso completado. ${addedCount} evento(s) nuevo(s) listo(s) para guardar.`;
      if (duplicateCount > 0) successMessage += ` Se omitieron ${duplicateCount} evento(s) duplicado(s).`;
      if (invalidDateCount > 0) successMessage += ` Se omitieron ${invalidDateCount} evento(s) por formato de fecha inválido.`
      setSuccess(successMessage);

    } catch (err) {
      setError(err instanceof Error ? `Fallo al procesar el archivo: ${err.message}` : 'Ocurrió un error desconocido.');
      setFileName(null);
    } finally {
        e.target.value = '';
    }
  }, [localEvents]);

  const handleCreateEvent = () => { setEventToEdit(null); setIsModalOpen(true); };
  const handleEditEvent = (event: ScheduleEvent) => { setEventToEdit(event); setIsModalOpen(true); };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este evento?')) {
      setLocalEvents(localEvents.filter(event => event.id !== eventId));
      setHasChanges(true);
    }
  };

  const handleSaveEvent = (eventData: ScheduleEvent) => {
    const isEditing = localEvents.some(e => e.id === eventData.id);
    const updatedEvents = isEditing
      ? localEvents.map(event => event.id === eventData.id ? eventData : event)
      : [...localEvents, eventData];
    setLocalEvents(updatedEvents);
    setHasChanges(true);
    setIsModalOpen(false);
    setEventToEdit(null);
  };

  const handleExportToExcel = () => {
    const headers = ['Fecha', 'Día', 'Hora', 'Lugar', 'Actividad', 'Participan', 'Observaciones'];
    const data = [...localEvents].sort((a,b) => a.dateObject.getTime() - b.dateObject.getTime()).map(event => [ event.fecha, event.dia, event.hora, event.lugar, event.actividad, event.participan, event.observaciones]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');
    XLSX.writeFile(wb, 'cronograma_actual.xlsx');
  };
  
  const handleSaveChanges = () => {
    const sortedEvents = [...localEvents].sort((a, b) => a.dateObject.getTime() - b.dateObject.getTime());
    setEvents(sortedEvents);
    setHasChanges(false);
    setSuccess('¡Cambios guardados exitosamente! Puede verlos en la página del Cronograma.');
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleDiscardChanges = () => {
    if (window.confirm('¿Está seguro? Se perderán todos los cambios no guardados.')) {
        setLocalEvents(events);
        setHasChanges(false);
        setError(null);
        setSuccess(null);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">Configuración de Datos</h2>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert"><p>{error}</p></div>}
        {success && <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4" role="alert"><p>{success}</p></div>}
        
        <div className="space-y-4"><h3 className="text-lg font-semibold">1. Descargar Plantilla</h3><p className="text-gray-600">Descargue la plantilla de Excel para asegurarse de que los datos tengan el formato correcto.</p><button onClick={generateExcelTemplate} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"><DownloadIcon className="w-5 h-5"/>Descargar Plantilla Excel</button></div>
        <div className="space-y-4"><h3 className="text-lg font-semibold">2. Subir Cronograma</h3><p className="text-gray-600">Una vez que haya llenado la plantilla, súbala aquí para añadir los eventos al cronograma existente.</p><div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center"><label htmlFor="file-upload" className="cursor-pointer inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"><UploadIcon className="w-5 h-5"/>Seleccionar Archivo Excel</label><input id="file-upload" type="file" accept=".xlsx, .xls" onChange={handleExcelUpload} className="hidden" />{fileName && <p className="mt-2 text-sm text-gray-600">Archivo seleccionado: {fileName}</p>}</div></div>
        <div className="space-y-4"><h3 className="text-lg font-semibold">3. Exportar Cronograma Actual</h3><p className="text-gray-600">Exporte todos los eventos cargados actualmente (incluyendo cambios no guardados) a un archivo de Excel.</p><button onClick={handleExportToExcel} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700"><DownloadIcon className="w-5 h-5"/>Exportar a Excel</button></div>
        
        <div className="space-y-4 pt-4 border-t">
          <h3 className="text-lg font-semibold">4. Gestionar Eventos Individualmente</h3>
          <p className="text-gray-600">Añada, modifique o elimine eventos uno por uno. Recuerde guardar los cambios al final.</p>
          <button onClick={handleCreateEvent} className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Crear Nuevo Evento</button>
          
          <div className="mt-4"><h4 className="font-semibold text-gray-700 mb-2">Lista de Eventos ({localEvents.length})</h4><div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 bg-gray-50 p-2 rounded-lg">
              {localEvents.map(event => (<div key={event.id} className="p-3 border rounded-md flex justify-between items-center bg-white shadow-sm"><div className="flex-1 min-w-0"><p className="font-semibold text-gray-800 truncate" title={event.actividad}>{event.actividad}</p><p className="text-sm text-gray-500">{event.fecha} &bull; {event.hora}</p></div><div className="flex gap-2 flex-shrink-0 ml-4"><button onClick={() => handleEditEvent(event)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-full" aria-label="Editar"><EditIcon className="w-5 h-5" /></button><button onClick={() => handleDeleteEvent(event.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full" aria-label="Eliminar"><DeleteIcon className="w-5 h-5" /></button></div></div>))}
          </div></div>
        </div>
      </div>

      <UserManagement />

      {hasChanges && (
         <div className="fixed bottom-0 left-0 right-0 bg-gray-800 bg-opacity-95 p-4 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 md:px-8">
                <p className="font-semibold text-white">Tiene cambios pendientes de guardar.</p>
                <div>
                    <button onClick={handleDiscardChanges} className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 mr-4 transition-colors">Descartar</button>
                    <button onClick={handleSaveChanges} className="px-6 py-2 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors">Guardar Cambios</button>
                </div>
            </div>
        </div>
      )}

      <EventFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} eventToEdit={eventToEdit} />
    </>
  );
};

export default ConfigurationView;
