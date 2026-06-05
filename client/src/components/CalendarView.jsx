import { useState } from 'react';

export default function CalendarView({ events, onEventClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const numDays = daysInMonth(year, month);
  const startDay = firstDayOfMonth(year, month);

  const days = [];
  // Fill empty slots for previous month days
  for (let i = 0; i < startDay; i++) {
    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Fill days of the month
  for (let d = 1; d <= numDays; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const dayEvents = events.filter(e => {
        const eDate = new Date(e.scheduled_at);
        return eDate.getFullYear() === year && eDate.getMonth() === month && eDate.getDate() === d;
    });

    const isToday = new Date().toDateString() === new Date(year, month, d).toDateString();

    days.push(
      <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`}>
        <span className="day-number">{d}</span>
        <div className="day-events">
          {dayEvents.map(e => (
            <div 
                key={e.session_id} 
                className={`event-tag status-${e.status}`}
                onClick={() => onEventClick(e)}
                title={`${e.skill_title} with ${e.teacher_name}`}
            >
              <span className="event-time">{new Date(e.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              <span className="event-title">{e.skill_title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container glass-card-static fade-in">
      <div className="calendar-header">
        <h2 className="calendar-title">{monthName} {year}</h2>
        <div className="calendar-nav">
          <button className="btn btn-secondary btn-sm" onClick={prevMonth}>‹</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setCurrentDate(new Date())}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={nextMonth}>›</button>
        </div>
      </div>

      <div className="calendar-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="calendar-weekday">{day}</div>
        ))}
        {days}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .calendar-container {
          padding: 1.5rem;
          margin-top: 1rem;
        }
        .calendar-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .calendar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .calendar-nav {
          display: flex;
          gap: 0.5rem;
        }
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background: var(--border-color);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .calendar-weekday {
          background: var(--bg-secondary);
          padding: 0.75rem;
          text-align: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .calendar-day {
          background: var(--bg-primary);
          min-height: 120px;
          padding: 0.5rem;
          position: relative;
          transition: background 0.2s ease;
        }
        .calendar-day.empty {
          background: rgba(0,0,0,0.1);
        }
        .calendar-day.today {
          background: rgba(139, 92, 246, 0.03);
        }
        .calendar-day.today .day-number {
          background: var(--accent-primary);
          color: white;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
        .day-number {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .day-events {
          margin-top: 0.5rem;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .event-tag {
          font-size: 0.7rem;
          padding: 4px 6px;
          border-radius: 4px;
          cursor: pointer;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: transform 0.1s ease;
          display: flex;
          flex-direction: column;
        }
        .event-tag:hover {
          transform: scale(1.02);
          filter: brightness(1.2);
        }
        .event-time {
          font-weight: 700;
          font-size: 0.6rem;
          opacity: 0.8;
        }
        .status-pending { background: rgba(245, 158, 11, 0.2); color: #f59e0b; border-left: 2px solid #f59e0b; }
        .status-confirmed { background: rgba(59, 130, 246, 0.2); color: #3b82f6; border-left: 2px solid #3b82f6; }
        .status-completed { background: rgba(16, 185, 129, 0.2); color: #10b981; border-left: 2px solid #10b981; }
        .status-cancelled { background: rgba(239, 68, 68, 0.2); color: #ef4444; border-left: 2px solid #ef4444; }

        @media (max-width: 768px) {
          .calendar-day { min-height: 80px; }
          .event-title { display: none; }
          .event-tag { width: 8px; height: 8px; border-radius: 50%; padding: 0; }
        }
      `}} />
    </div>
  );
}
