import { useState, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Card from '../../componentes/ui/Card';
import Button from '../../componentes/ui/Button';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAY_OF_WEEK_JS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const MONTH_LABELS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function buildMonthGrid(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0 = domingo
  const gridStart = new Date(year, month, 1 - startOffset);

  const days = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

export default function CalendarView({ events, habits }) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const todayKey = toDateKey(new Date());
  const [selectedKey, setSelectedKey] = useState(todayKey);

  const days = useMemo(() => buildMonthGrid(month), [month]);

  const itemsByDay = useMemo(() => {
    const map = new Map();
    const ensure = (key) => {
      if (!map.has(key)) map.set(key, { events: [], habits: [] });
      return map.get(key);
    };

    events.forEach((ev) => {
      if (!ev.eventDateTime) return;
      ensure(ev.eventDateTime.slice(0, 10)).events.push(ev);
    });

    days.forEach((d) => {
      const key = toDateKey(d);
      const weekday = DAY_OF_WEEK_JS[d.getDay()];
      habits.forEach((h) => {
        if (!h.active) return;
        const occurs = h.recurrenceFrequency === 'DAILY'
          || (h.recurrenceFrequency === 'WEEKLY' && (h.daysOfWeek || []).includes(weekday));
        if (occurs) ensure(key).habits.push(h);
      });
    });

    return map;
  }, [events, habits, days]);

  const selectedItems = itemsByDay.get(selectedKey);

  const goPrevMonth = () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNextMonth = () => setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  const goToday = () => {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedKey(todayKey);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      <Card className="flex-1">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text">
            {MONTH_LABELS[month.getMonth()]} {month.getFullYear()}
          </h2>
          <div className="flex gap-1.5">
            <Button size="sm" variant="outline" onClick={goPrevMonth} title="Mês anterior"><FaChevronLeft /></Button>
            <Button size="sm" variant="outline" onClick={goToday}>Hoje</Button>
            <Button size="sm" variant="outline" onClick={goNextMonth} title="Próximo mês"><FaChevronRight /></Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted2">
          {WEEKDAY_LABELS.map((w) => <div key={w} className="py-1">{w}</div>)}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = toDateKey(d);
            const inMonth = d.getMonth() === month.getMonth();
            const dayItems = itemsByDay.get(key);
            const isToday = key === todayKey;
            const isSelected = key === selectedKey;

            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelectedKey(key)}
                className={[
                  'flex min-h-[4.5rem] flex-col items-start gap-1 rounded-md border p-1.5 text-left text-xs transition-colors',
                  inMonth ? 'bg-surface hover:bg-surface2' : 'bg-surface2/50 text-muted',
                  isSelected ? 'border-primary ring-1 ring-primary' : 'border-border',
                ].join(' ')}
              >
                <span className={isToday ? 'font-bold text-primary dark:text-info' : ''}>{d.getDate()}</span>
                {dayItems?.events.length > 0 && (
                  <span className="text-[10px] text-info">📅 {dayItems.events.length}</span>
                )}
                {dayItems?.habits.length > 0 && (
                  <span className="text-[10px] text-success">🔁 {dayItems.habits.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="w-full lg:w-80">
        <h3 className="mb-3 text-sm font-semibold text-text">
          {new Date(`${selectedKey}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
        </h3>

        {(!selectedItems || (selectedItems.events.length === 0 && selectedItems.habits.length === 0)) && (
          <p className="text-sm text-muted">Nada agendado nesse dia.</p>
        )}

        <div className="flex flex-col gap-2">
          {selectedItems?.events
            .slice()
            .sort((a, b) => a.eventDateTime.localeCompare(b.eventDateTime))
            .map((ev) => (
              <div key={`ev-${ev.id}`} className="rounded-md bg-info/10 px-2.5 py-1.5 text-sm text-text">
                📅 <span className="font-medium">{ev.title}</span>
                <div className="text-xs text-muted">às {ev.eventDateTime.slice(11, 16)}</div>
              </div>
            ))}
          {selectedItems?.habits
            .slice()
            .sort((a, b) => (a.timeOfDay || '').localeCompare(b.timeOfDay || ''))
            .map((h) => (
              <div key={`hb-${h.id}`} className="rounded-md bg-success/10 px-2.5 py-1.5 text-sm text-text">
                🔁 <span className="font-medium">{h.title}</span>
                <div className="text-xs text-muted">às {h.timeOfDay?.slice(0, 5)}</div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
}
