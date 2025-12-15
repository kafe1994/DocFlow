import React, { useState } from 'react';
import { Appointment, Patient, AppointmentStatus } from '../types';
import { MonthView, WeekView, AgendaView } from './calendar/CalendarViews';
import { AppointmentFormModal, AppointmentDetailsModal } from './calendar/AppointmentModals';
import { ChevronLeft, ChevronRight, Calendar as CalIcon, List, Grid, Plus } from 'lucide-react';

interface AppointmentsProps {
  appointments: Appointment[];
  patients: Patient[];
  onAddAppointment: (apt: Partial<Appointment>) => void;
  onEditAppointment: (apt: Partial<Appointment>) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
}

type ViewType = 'month' | 'week' | 'agenda';

export const Appointments: React.FC<AppointmentsProps> = ({ 
  appointments, patients, onAddAppointment, onEditAppointment, onDeleteAppointment, onUpdateStatus 
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('week');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  // State for editing or creating
  const [appointmentToEdit, setAppointmentToEdit] = useState<Appointment | undefined>(undefined);
  
  // Pre-fill data for new appointment (from click on calendar)
  const [prefillDate, setPrefillDate] = useState<string>('');
  const [prefillTime, setPrefillTime] = useState<string>('');

  const handleNavigate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (view === 'month') {
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    } else if (view === 'week') {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  const handleDateClick = (date: string, time?: string) => {
      setAppointmentToEdit(undefined);
      setPrefillDate(date);
      setPrefillTime(time || '09:00');
      setIsFormModalOpen(true);
  };

  const handleOpenCreate = () => {
      setAppointmentToEdit(undefined);
      setPrefillDate(new Date().toISOString().split('T')[0]);
      setPrefillTime('09:00');
      setIsFormModalOpen(true);
  };

  const handleEditClick = (apt: Appointment) => {
      setSelectedAppointment(null); // Close details modal
      setAppointmentToEdit(apt);
      setIsFormModalOpen(true); // Open form modal
  };

  const getTitle = () => {
    if (view === 'agenda') return 'Agenda Completa';
    return currentDate.toLocaleDateString('es-ES', { 
        month: 'long', 
        year: 'numeric',
        day: view === 'week' ? undefined : undefined
    }).replace(/^\w/, c => c.toUpperCase());
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm shrink-0">
        <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 min-w-[200px]">{getTitle()}</h1>
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button onClick={() => handleNavigate('prev')} className="p-1 hover:bg-white rounded-md transition-shadow">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-sm font-medium text-gray-600 hover:bg-white rounded-md transition-shadow">
                    Hoy
                </button>
                <button onClick={() => handleNavigate('next')} className="p-1 hover:bg-white rounded-md transition-shadow">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
            </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
            <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                    onClick={() => setView('month')}
                    className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'month' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <Grid className="w-4 h-4" /> <span className="hidden sm:inline">Mes</span>
                </button>
                <button 
                    onClick={() => setView('week')}
                    className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'week' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <CalIcon className="w-4 h-4" /> <span className="hidden sm:inline">Semana</span>
                </button>
                <button 
                    onClick={() => setView('agenda')}
                    className={`p-2 rounded-md flex items-center gap-2 text-sm font-medium transition-all ${view === 'agenda' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}
                >
                    <List className="w-4 h-4" /> <span className="hidden sm:inline">Agenda</span>
                </button>
            </div>
            
            <button 
                onClick={handleOpenCreate}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm ml-auto"
            >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Cita</span>
            </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 min-h-0">
        {view === 'month' && (
            <MonthView 
                currentDate={currentDate} 
                appointments={appointments} 
                onSelectAppointment={setSelectedAppointment}
                onDateClick={handleDateClick}
            />
        )}
        {view === 'week' && (
            <WeekView 
                currentDate={currentDate} 
                appointments={appointments} 
                onSelectAppointment={setSelectedAppointment}
                onDateClick={handleDateClick}
            />
        )}
        {view === 'agenda' && (
            <AgendaView 
                currentDate={currentDate} 
                appointments={appointments} 
                onSelectAppointment={setSelectedAppointment} 
            />
        )}
      </div>

      {/* Modals */}
      <AppointmentFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={onAddAppointment}
        onEdit={onEditAppointment}
        patients={patients}
        initialDate={prefillDate}
        initialTime={prefillTime}
        appointmentToEdit={appointmentToEdit}
      />

      <AppointmentDetailsModal
        isOpen={!!selectedAppointment}
        appointment={selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        onUpdateStatus={onUpdateStatus}
        onDelete={onDeleteAppointment}
        onEdit={handleEditClick}
      />
    </div>
  );
};