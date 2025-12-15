import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Save, Trash2, CheckCircle, AlertCircle, Phone, FileText, Pencil } from 'lucide-react';
import { Appointment, Patient, AppointmentType, AppointmentStatus } from '../../types';

// --- APPOINTMENT FORM MODAL (CREATE OR EDIT) ---

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Appointment>) => void;
  onEdit?: (data: Partial<Appointment>) => void;
  patients: Patient[];
  initialDate?: string;
  initialTime?: string;
  appointmentToEdit?: Appointment;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen, onClose, onSubmit, onEdit, patients, initialDate, initialTime, appointmentToEdit
}) => {
  const [patientId, setPatientId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('50'); // minutes
  const [type, setType] = useState<AppointmentType>('consultation');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (appointmentToEdit) {
        // Edit Mode
        setPatientId(appointmentToEdit.patient_id);
        setDate(appointmentToEdit.appointment_date);
        setStartTime(appointmentToEdit.start_time);
        setType(appointmentToEdit.type);
        setNotes(appointmentToEdit.notes || '');
        
        // Calculate duration based on start and end time
        const start = new Date(`2000-01-01T${appointmentToEdit.start_time}`);
        const end = new Date(`2000-01-01T${appointmentToEdit.end_time}`);
        const diff = (end.getTime() - start.getTime()) / 60000;
        setDuration(diff.toString());

      } else {
        // Create Mode
        setDate(initialDate || new Date().toISOString().split('T')[0]);
        setStartTime(initialTime || '09:00');
        setPatientId('');
        setDuration('50');
        setType('consultation');
        setNotes('');
      }
    }
  }, [isOpen, initialDate, initialTime, appointmentToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const dateObj = new Date();
    dateObj.setHours(hours, minutes + parseInt(duration));
    const endTime = `${dateObj.getHours().toString().padStart(2, '0')}:${dateObj.getMinutes().toString().padStart(2, '0')}`;

    const appointmentData = {
      patient_id: patientId,
      appointment_date: date,
      start_time: startTime,
      end_time: endTime,
      type,
      notes
    };

    if (appointmentToEdit && onEdit) {
      onEdit({ ...appointmentData, id: appointmentToEdit.id, status: appointmentToEdit.status });
    } else {
      onSubmit({ ...appointmentData, status: 'scheduled' });
    }
    
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            {appointmentToEdit ? 'Editar Cita' : 'Nueva Cita'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Patient Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Paciente</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="">Seleccionar paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name} ({p.medical_record_number})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Hora Inicio</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duración</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="50">50 min</option>
                <option value="60">60 min</option>
              </select>
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tipo</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AppointmentType)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="consultation">Consulta</option>
                <option value="follow_up">Seguimiento</option>
                <option value="therapy">Psicoterapia</option>
                <option value="evaluation">Evaluación</option>
                <option value="emergency">Emergencia</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Notas (Opcional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-24 resize-none"
              placeholder="Motivo de consulta..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
             <button type="button" onClick={onClose} className="px-4 py-2 text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">Cancelar</button>
             <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-sm font-medium">
               {appointmentToEdit ? 'Guardar Cambios' : 'Crear Cita'}
             </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- APPOINTMENT DETAILS MODAL ---

interface AppointmentDetailsModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => void;
  onDelete?: (id: string) => void;
  onEdit?: (apt: Appointment) => void;
}

export const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  appointment, isOpen, onClose, onUpdateStatus, onDelete, onEdit
}) => {
  if (!isOpen || !appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-purple-100 text-purple-800 animate-pulse';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
      const labels: Record<string, string> = {
          'scheduled': 'Programada',
          'confirmed': 'Confirmada',
          'in_progress': 'En Curso',
          'completed': 'Completada',
          'cancelled': 'Cancelada',
          'no_show': 'No Asistió'
      };
      return labels[status] || status;
  }

  const handleDelete = () => {
    if (onDelete && appointment) {
        onDelete(appointment.id);
        onClose();
    }
  };

  const handleEdit = () => {
      if (onEdit && appointment) {
          onEdit(appointment);
      }
  };

  const changeStatus = (newStatus: AppointmentStatus) => {
      onUpdateStatus(appointment.id, newStatus);
      onClose(); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row h-[600px] md:h-auto">
        
        {/* Left: Appointment Info */}
        <div className="flex-1 p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div>
                <h2 className="text-2xl font-bold text-gray-900">{appointment.patient?.first_name} {appointment.patient?.last_name}</h2>
                <p className="text-gray-500 flex items-center gap-2 mt-1">
                    <User className="w-4 h-4" /> 
                    {appointment.patient?.medical_record_number}
                </p>
             </div>
             <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(appointment.status)}`}>
                {getStatusLabel(appointment.status)}
             </span>
          </div>

          <div className="space-y-6 flex-1">
             <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase">Fecha</span>
                    </div>
                    <p className="font-medium text-gray-900">{new Date(appointment.appointment_date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase">Horario</span>
                    </div>
                    <p className="font-medium text-gray-900">{appointment.start_time} - {appointment.end_time}</p>
                </div>
             </div>

             <div className="bg-white border border-gray-200 p-4 rounded-xl relative group">
                 <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-semibold text-gray-900">Notas de la Cita</h4>
                 </div>
                 <p className="text-gray-600 text-sm leading-relaxed min-h-[3rem]">
                     {appointment.notes || "Sin notas adicionales."}
                 </p>
             </div>
             
             {/* Clinical Actions */}
             <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
                {/* Main Action Button */}
                {appointment.status === 'scheduled' && (
                    <button 
                        onClick={() => changeStatus('in_progress')}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 shadow-sm flex items-center justify-center gap-2"
                    >
                        <CheckCircle className="w-4 h-4" /> Iniciar Consulta
                    </button>
                )}
                
                {appointment.status === 'in_progress' && (
                    <button 
                        onClick={() => changeStatus('completed')}
                        className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 shadow-sm flex items-center justify-center gap-2"
                    >
                        <FileText className="w-4 h-4" /> Completar y Crear Nota
                    </button>
                )}

                {/* Secondary Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* CONFIRM / CANCEL BUTTONS */}
                    {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                         <>
                            <button 
                                onClick={() => changeStatus('cancelled')}
                                className="py-2.5 bg-white border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> Cancelar
                            </button>
                            {appointment.status === 'scheduled' && (
                                <button 
                                    onClick={() => changeStatus('confirmed')}
                                    className="py-2.5 bg-white border border-green-200 text-green-700 rounded-xl font-medium hover:bg-green-50 flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Confirmar
                                </button>
                            )}
                         </>
                    )}
                </div>

                {/* Edit / Delete Row */}
                <div className="flex justify-between items-center pt-2">
                    <button 
                        onClick={handleEdit}
                        className="text-gray-500 hover:text-indigo-600 flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-lg hover:bg-gray-50"
                    >
                        <Pencil className="w-4 h-4" /> Editar Datos
                    </button>
                    
                    <button 
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-600 flex items-center gap-1.5 text-sm font-medium px-2 py-1 rounded-lg hover:bg-red-50"
                    >
                        <Trash2 className="w-4 h-4" /> Eliminar Cita
                    </button>
                </div>
             </div>
          </div>
        </div>

        {/* Right: Patient Context (Desktop) */}
        <div className="hidden md:flex w-72 bg-gray-50 border-l border-gray-200 p-6 flex-col">
           <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900">Contexto Clínico</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                </button>
           </div>

           <div className="space-y-6">
               <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Contacto</h4>
                   <div className="space-y-2 text-sm">
                       <div className="flex items-center gap-2 text-gray-600">
                           <Phone className="w-3 h-3" /> {appointment.patient?.phone || 'No registrado'}
                       </div>
                   </div>
               </div>

               <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Alertas</h4>
                   <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-3">
                       <div className="flex items-start gap-2">
                           <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                           <p className="text-xs text-yellow-800">
                               Revisar adherencia a medicación en esta sesión.
                           </p>
                       </div>
                   </div>
               </div>

               <div>
                   <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Historial Reciente</h4>
                   <div className="space-y-3">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                            <p className="text-xs text-gray-500 mb-1">12 Oct, 2023</p>
                            <p className="text-sm font-medium text-gray-800">Consulta de seguimiento</p>
                        </div>
                   </div>
               </div>
           </div>
        </div>
        
        {/* Mobile Close Button (Absolute) */}
        <button onClick={onClose} className="md:hidden absolute top-4 right-4 text-gray-400 p-2 bg-white rounded-full shadow-sm">
            <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};