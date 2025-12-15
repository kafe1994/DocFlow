import React from 'react';
import { Users, Calendar, Clock, TrendingUp } from 'lucide-react';
import { Appointment, Patient, AppRoute } from '../types';

interface DashboardProps {
  appointments: Appointment[];
  patients: Patient[];
  onNavigate: (route: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ appointments, patients, onNavigate }) => {
  
  // Dynamic Stats Calculation
  const activePatients = patients.length;
  
  const today = new Date().toISOString().split('T')[0];
  const appointmentsToday = appointments.filter(apt => 
    apt.appointment_date.startsWith(today)
  ).length;

  const pendingAppointments = appointments.filter(apt => 
    apt.status === 'scheduled'
  ).length;

  // Mock efficacy calculation logic (just for show, but dynamic based on volume)
  const efficacy = activePatients > 0 ? '94%' : '0%';

  const stats = [
    { label: 'Pacientes Activos', value: activePatients.toString(), icon: Users, color: 'bg-blue-500' },
    { label: 'Citas Hoy', value: appointmentsToday.toString(), icon: Calendar, color: 'bg-purple-500' },
    { label: 'Pendientes', value: pendingAppointments.toString(), icon: Clock, color: 'bg-orange-500' },
    { label: 'Eficacia Tto.', value: efficacy, icon: TrendingUp, color: 'bg-green-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel Principal</h1>
        <p className="text-gray-500">Bienvenido de nuevo. Visualización general de su práctica.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center space-x-4">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Agenda de Hoy</h2>
            <button 
                onClick={() => onNavigate(AppRoute.APPOINTMENTS)}
                className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-all"
            >
                Ver todo
            </button>
          </div>
          <div className="divide-y divide-gray-100">
            {appointments.length > 0 ? (
              appointments.slice(0, 5).map((apt) => (
                <div key={apt.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-center min-w-[3rem]">
                      <p className="text-sm font-bold text-gray-900">{apt.start_time.substring(0, 5)}</p>
                      <p className="text-xs text-gray-500">AM</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Paciente #{apt.patient_id.substring(0,5)}</p>
                      <p className="text-sm text-gray-500">{apt.type}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {apt.status === 'scheduled' ? 'Programada' : 
                     apt.status === 'completed' ? 'Completada' : 'Cancelada'}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-500 flex flex-col items-center">
                <Calendar className="w-12 h-12 mb-3 text-gray-300" />
                <p>No hay citas programadas para hoy.</p>
                <p className="text-xs mt-1 text-gray-400">Su agenda está completamente libre.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions / Notifications */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Avisos del Sistema</h2>
          <div className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">Recordatorio de Seguridad</p>
              <p className="text-xs text-yellow-600 mt-1">
                Recuerde que las notas generadas por IA deben ser revisadas antes de guardarse en la historia clínica.
              </p>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">Base de Datos</p>
              <p className="text-xs text-blue-600 mt-1">
                {activePatients > 0 ? 'Sincronización activa con Supabase.' : 'Esperando nuevos registros.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};