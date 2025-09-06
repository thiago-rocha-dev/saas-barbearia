import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import type { View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useAuth } from '../../hooks/useAuth';
import { useAppointments } from '../../hooks/useAppointments';
import type { CalendarEvent, CalendarView } from '../../types/appointments';
import type { UserRole } from '../../types/dashboard';

// Configure moment localizer
const localizer = momentLocalizer(moment);

interface AppointmentCalendarProps {
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void;
  onCreateAppointment?: () => void;
  className?: string;
  defaultView?: CalendarView;
  role?: UserRole;
}

const AppointmentCalendar: React.FC<AppointmentCalendarProps> = ({
  onSelectEvent,
  onSelectSlot,
  onCreateAppointment,
  className = '',
  defaultView = 'week',
  role
}) => {
  const { user } = useAuth();
  const { calendarEvents, loading } = useAppointments();
  const [currentView, setCurrentView] = useState<View>(defaultView as View);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Event style getter based on appointment status and role
  const eventStyleGetter = useCallback((event: CalendarEvent) => {
    const appointment = event.resource;
    let backgroundColor = '#6366f1'; // Default purple
    let borderColor = '#4f46e5';
    let color = '#ffffff';

    // Status-based colors
    switch (appointment.status) {
      case 'confirmed':
        backgroundColor = '#10b981'; // Green
        borderColor = '#059669';
        break;
      case 'cancelled':
        backgroundColor = '#ef4444'; // Red
        borderColor = '#dc2626';
        break;
      case 'completed':
        backgroundColor = '#8b5cf6'; // Purple
        borderColor = '#7c3aed';
        break;
      case 'no_show':
        backgroundColor = '#f59e0b'; // Amber
        borderColor = '#d97706';
        break;
    }

    // Role-based accent colors
    if (role === 'admin') {
      borderColor = '#f59e0b'; // Golden accent
    } else if (role === 'barber') {
      borderColor = '#06b6d4'; // Cyan accent
    } else if (role === 'customer') {
      borderColor = '#8b5cf6'; // Purple accent
    }

    return {
      style: {
        backgroundColor,
        borderColor,
        color,
        border: `2px solid ${borderColor}`,
        borderRadius: '8px',
        fontSize: '12px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(10px)',
        opacity: appointment.status === 'cancelled' ? 0.6 : 1
      }
    };
  }, [role]);

  // Custom event component
  const EventComponent = useCallback(({ event }: { event: CalendarEvent }) => {
    const appointment = event.resource;
    return (
      <div className="p-1 text-xs">
        <div className="font-semibold truncate">{appointment.service_name}</div>
        <div className="text-xs opacity-90 truncate">
          {appointment.client_id !== user?.id && appointment.client_id ? 'Cliente' : ''}
          {appointment.barber_id !== user?.id && appointment.barber_id ? 'Barbeiro' : ''}
        </div>
      </div>
    );
  }, [user?.id]);

  // Custom toolbar component
  const CustomToolbar = useCallback(({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('PREV')}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={() => onNavigate('TODAY')}
            className="px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200 text-white font-medium"
          >
            Hoje
          </button>
          
          <button
            onClick={() => onNavigate('NEXT')}
            className="p-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Current period label */}
        <div className="text-xl font-bold text-white">{label}</div>

        {/* View selector */}
        <div className="flex items-center gap-2">
          {['month', 'week', 'day', 'agenda'].map((view) => (
            <button
              key={view}
              onClick={() => onView(view)}
              className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                currentView === view
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/15'
              }`}
            >
              {view === 'month' ? 'Mês' : view === 'week' ? 'Semana' : view === 'day' ? 'Dia' : 'Lista'}
            </button>
          ))}
          
          {onCreateAppointment && (
            <button
              onClick={onCreateAppointment}
              className="ml-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg"
            >
              + Novo Agendamento
            </button>
          )}
        </div>
      </div>
    );
  }, [currentView, onCreateAppointment]);

  // Calendar messages in Portuguese
  const messages = useMemo(() => ({
    allDay: 'Dia todo',
    previous: 'Anterior',
    next: 'Próximo',
    today: 'Hoje',
    month: 'Mês',
    week: 'Semana',
    day: 'Dia',
    agenda: 'Lista',
    date: 'Data',
    time: 'Hora',
    event: 'Evento',
    noEventsInRange: 'Não há agendamentos neste período',
    showMore: (total: number) => `+ ${total} mais`
  }), []);

  // Calendar formats
  const formats = useMemo(() => ({
    timeGutterFormat: 'HH:mm',
    eventTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    },
    dayHeaderFormat: 'dddd, DD/MM',
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('DD/MM')} - ${moment(end).format('DD/MM/YYYY')}`;
    },
    monthHeaderFormat: 'MMMM YYYY',
    agendaDateFormat: 'DD/MM/YYYY',
    agendaTimeFormat: 'HH:mm',
    agendaTimeRangeFormat: ({ start, end }: { start: Date; end: Date }) => {
      return `${moment(start).format('HH:mm')} - ${moment(end).format('HH:mm')}`;
    }
  }), []);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center justify-center h-96 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 text-white">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="text-lg font-medium">Carregando agendamentos...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Calendar Container */}
      <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
        <Calendar
          localizer={localizer}
          events={calendarEvents}
          startAccessor="start"
          endAccessor="end"
          titleAccessor="title"
          resourceAccessor="resource"
          view={currentView}
          onView={setCurrentView}
          date={currentDate}
          onNavigate={setCurrentDate}
          onSelectEvent={onSelectEvent}
          onSelectSlot={onSelectSlot}
          selectable
          popup
          eventPropGetter={eventStyleGetter}
          components={{
            event: EventComponent,
            toolbar: CustomToolbar
          }}
          messages={messages}
          formats={formats}
          min={new Date(2024, 0, 1, 9, 0)} // 9:00 AM
          max={new Date(2024, 0, 1, 18, 0)} // 6:00 PM
          step={30}
          timeslots={2}
          className="appointment-calendar"
          style={{ height: 600 }}
        />
      </div>

      {/* Custom Calendar Styles */}
      <style>{`
        .appointment-calendar {
          color: white;
        }
        
        .appointment-calendar .rbc-header {
          background: rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          font-weight: 600;
          padding: 12px 8px;
        }
        
        .appointment-calendar .rbc-time-view {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-time-gutter {
          background: rgba(255, 255, 255, 0.05);
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-time-slot {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-timeslot-group {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-day-slot {
          border-left: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-current-time-indicator {
          background-color: #ef4444;
          height: 2px;
        }
        
        .appointment-calendar .rbc-today {
          background-color: rgba(139, 92, 246, 0.1);
        }
        
        .appointment-calendar .rbc-off-range-bg {
          background-color: rgba(255, 255, 255, 0.02);
        }
        
        .appointment-calendar .rbc-month-view {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-date-cell {
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px;
          min-height: 120px;
        }
        
        .appointment-calendar .rbc-button-link {
          color: white;
        }
        
        .appointment-calendar .rbc-show-more {
          background: rgba(139, 92, 246, 0.8);
          color: white;
          border-radius: 4px;
          padding: 2px 6px;
          font-size: 11px;
        }
        
        .appointment-calendar .rbc-agenda-view {
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .appointment-calendar .rbc-agenda-view table {
          color: white;
        }
        
        .appointment-calendar .rbc-agenda-date-cell,
        .appointment-calendar .rbc-agenda-time-cell,
        .appointment-calendar .rbc-agenda-event-cell {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding: 12px 8px;
        }
      `}</style>
    </div>
  );
};

export default AppointmentCalendar;