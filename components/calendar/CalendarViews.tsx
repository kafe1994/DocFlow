import React from 'react';
import { Appointment } from '../../types';
import { Clock, MapPin, User } from 'lucide-react';

interface ViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onSelectAppointment: (apt: Appointment) => void;
  onDateClick?: (date: string, time?: string) => void;
}

const getAppointmentStyle = (apt: Appointment) => {
    // Priority: Status Colors (User Request: Confirmed Green, Cancelled Red)
    if (apt.status === 'confirmed') return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (apt.status === 'cancelled') return 'bg-red-50 text-red-800 border-red-200 line-through opacity-75';

    // Fallback: Type Colors for 'scheduled' or other statuses
    switch (apt.type) {
        case 'consultation': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'follow_up': return 'bg-green-100 text-green-700 border-green-200';
        case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
        case 'evaluation': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'therapy': return 'bg-orange-100 text-orange-700 border-orange-200';
        default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
};

// --- MONTH VIEW ---
export const MonthView: React.FC<ViewProps> = ({ currentDate, appointments, onSelectAppointment, onDateClick }) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Adjust for Monday start
    let startDay = firstDay.getDay() - 1; 
    if (startDay === -1) startDay = 6;

    const days = [];
    
    // Previous month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
       days.push({ day: prevMonthLastDay - i, type: 'prev', date: new Date(year, month - 1, prevMonthLastDay - i) });
    }

    // Current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({ day: i, type: 'current', date: new Date(year, month, i) });
    }

    // Next month padding
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push({ day: i, type: 'next', date: new Date(year, month + 1, i) });
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map(d => (
            <div key={d} className="py-3 text-center text-sm font-semibold text-gray-600">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1 auto-rows-fr">
        {days.map((d, idx) => {
            const dateStr = d.date.toISOString().split('T')[0];
            const dayApts = appointments.filter(a => a.appointment_date === dateStr);
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            return (
                <div 
                    key={idx} 
                    onClick={() => onDateClick?.(dateStr)}
                    className={`min-h-[100px] border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${d.type !== 'current' ? 'bg-gray-50/50 text-gray-400' : ''}`}
                >
                    <div className="flex justify-between items-start mb-1">
                        <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-indigo-600 text-white' : ''}`}>
                            {d.day}
                        </span>
                        {dayApts.length > 0 && (
                            <span className="text-xs font-bold text-gray-400">{dayApts.length}</span>
                        )}
                    </div>
                    <div className="space-y-1">
                        {dayApts.slice(0, 3).map(apt => (
                            <div 
                                key={apt.id}
                                onClick={(e) => { e.stopPropagation(); onSelectAppointment(apt); }}
                                className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${getAppointmentStyle(apt)}`}
                            >
                                {apt.start_time} {apt.patient?.first_name}
                            </div>
                        ))}
                         {dayApts.length > 3 && (
                            <div className="text-[10px] text-gray-400 pl-1">+ {dayApts.length - 3} más</div>
                        )}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};

// --- WEEK VIEW ---
export const WeekView: React.FC<ViewProps> = ({ currentDate, appointments, onSelectAppointment, onDateClick }) => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay() || 7; 
    if (day !== 1) startOfWeek.setHours(-24 * (day - 1));

    const weekDates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        return d;
    });

    const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8:00 to 20:00

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
            {/* Header */}
            <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div className="py-4 border-r border-gray-200"></div> {/* Time col */}
                {weekDates.map((d, i) => {
                     const isToday = new Date().toISOString().split('T')[0] === d.toISOString().split('T')[0];
                     return (
                        <div key={i} className={`py-3 text-center border-r border-gray-200 last:border-0 ${isToday ? 'bg-indigo-50' : ''}`}>
                            <p className={`text-xs uppercase font-semibold ${isToday ? 'text-indigo-600' : 'text-gray-500'}`}>
                                {d.toLocaleDateString('es-ES', { weekday: 'short' })}
                            </p>
                            <p className={`text-lg font-bold ${isToday ? 'text-indigo-700' : 'text-gray-800'}`}>
                                {d.getDate()}
                            </p>
                        </div>
                     )
                })}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto relative">
                 {/* Hour Lines */}
                {hours.map((h, i) => (
                    <div key={h} className="grid grid-cols-8 h-20 border-b border-gray-100">
                        <div className="border-r border-gray-200 bg-gray-50 text-xs text-gray-500 text-right pr-2 pt-1 relative -top-2.5">
                            {h}:00
                        </div>
                        {weekDates.map((_, idx) => (
                             <div 
                                key={idx} 
                                onClick={() => {
                                    const dateStr = weekDates[idx].toISOString().split('T')[0];
                                    const timeStr = `${h.toString().padStart(2, '0')}:00`;
                                    onDateClick?.(dateStr, timeStr);
                                }}
                                className="border-r border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer"
                             ></div>
                        ))}
                    </div>
                ))}

                {/* Appointments Overlay */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none grid grid-cols-8">
                     <div className="w-full"></div> {/* Spacer for time col */}
                     {weekDates.map((d, i) => {
                         const dateStr = d.toISOString().split('T')[0];
                         const dayApts = appointments.filter(a => a.appointment_date === dateStr);
                         
                         return (
                             <div key={i} className="relative w-full h-full">
                                 {dayApts.map(apt => {
                                     const [h, m] = apt.start_time.split(':').map(Number);
                                     const [endH, endM] = apt.end_time.split(':').map(Number);
                                     
                                     // Calculate position relative to 8:00 start
                                     // 8:00 is 0px. Each hour is 80px (h-20 in tailwind).
                                     const startMinutes = (h - 8) * 60 + m;
                                     const durationMinutes = ((endH * 60) + endM) - ((h * 60) + m);
                                     
                                     // 60 minutes = 80px height
                                     const top = (startMinutes / 60) * 80;
                                     const height = (durationMinutes / 60) * 80;

                                     return (
                                         <div
                                            key={apt.id}
                                            onClick={(e) => {
                                                // Enable pointer events for the card specifically
                                                e.stopPropagation();
                                                onSelectAppointment(apt);
                                            }}
                                            style={{ top: `${top}px`, height: `${height}px` }}
                                            className={`absolute left-1 right-1 rounded-md border p-1 text-[10px] pointer-events-auto cursor-pointer shadow-sm hover:brightness-95 transition-all overflow-hidden flex flex-col ${getAppointmentStyle(apt)}`}
                                         >
                                             <span className="font-bold truncate">{apt.patient?.first_name} {apt.patient?.last_name?.[0]}.</span>
                                             <span className="truncate opacity-75">{apt.type}</span>
                                         </div>
                                     )
                                 })}
                             </div>
                         )
                     })}
                </div>
            </div>
        </div>
    )
}

// --- AGENDA VIEW ---
export const AgendaView: React.FC<ViewProps> = ({ appointments, onSelectAppointment }) => {
    // Sort appointments
    const sorted = [...appointments].sort((a, b) => {
        return new Date(`${a.appointment_date}T${a.start_time}`).getTime() - new Date(`${b.appointment_date}T${b.start_time}`).getTime();
    });

    // Group by date
    const grouped: Record<string, Appointment[]> = {};
    sorted.forEach(apt => {
        if (!grouped[apt.appointment_date]) grouped[apt.appointment_date] = [];
        grouped[apt.appointment_date].push(apt);
    });

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full overflow-y-auto">
            {Object.keys(grouped).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <Clock className="w-12 h-12 mb-3 opacity-20" />
                    <p>No hay citas programadas.</p>
                </div>
            ) : (
                Object.entries(grouped).map(([date, apts]) => (
                    <div key={date} className="border-b border-gray-100 last:border-0">
                        <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 sticky top-0 z-10">
                            <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                <CalendarIcon className="w-4 h-4 text-indigo-500" />
                                {new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {apts.map(apt => (
                                <div 
                                    key={apt.id} 
                                    onClick={() => onSelectAppointment(apt)}
                                    className="p-4 hover:bg-indigo-50/30 transition-colors cursor-pointer flex items-center gap-4"
                                >
                                    <div className="min-w-[80px] text-center">
                                        <p className="text-sm font-bold text-gray-900">{apt.start_time}</p>
                                        <p className="text-xs text-gray-500">{apt.end_time}</p>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between mb-1">
                                            <h4 className="font-semibold text-gray-900">{apt.patient?.first_name} {apt.patient?.last_name}</h4>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide border ${getAppointmentStyle(apt)}`}>
                                                {apt.type}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            <User className="w-3 h-3" />
                                            Historia: {apt.patient?.medical_record_number}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    )
}

const CalendarIcon = ({className}: {className?: string}) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
)