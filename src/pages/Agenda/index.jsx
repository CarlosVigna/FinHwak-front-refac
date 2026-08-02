import { useEffect, useState, useCallback } from 'react';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaPauseCircle, FaPlayCircle, FaEdit } from 'react-icons/fa';
import { api } from '../../services/api';
import { useAccount } from '../../contexts/AccountContext';
import { translateError } from '../../utils/errorMessages';
import Input from '../../componentes/ui/Input';
import Select from '../../componentes/ui/Select';
import Button from '../../componentes/ui/Button';
import Card from '../../componentes/ui/Card';
import Badge from '../../componentes/ui/Badge';
import Table from '../../componentes/ui/Table';
import Modal from '../../componentes/ui/Modal';
import CalendarView from './CalendarView';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Seg' },
  { value: 'TUESDAY', label: 'Ter' },
  { value: 'WEDNESDAY', label: 'Qua' },
  { value: 'THURSDAY', label: 'Qui' },
  { value: 'FRIDAY', label: 'Sex' },
  { value: 'SATURDAY', label: 'Sáb' },
  { value: 'SUNDAY', label: 'Dom' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

function DaysOfWeekPicker({ value = [], onChange }) {
  const toggle = (day) => {
    onChange(value.includes(day) ? value.filter((d) => d !== day) : [...value, day]);
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text">Dias da semana</span>
      <div className="flex flex-wrap gap-1.5">
        {DAYS_OF_WEEK.map((d) => (
          <button
            key={d.value}
            type="button"
            onClick={() => toggle(d.value)}
            className={[
              'rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors',
              value.includes(d.value)
                ? 'border-primary bg-primary text-white'
                : 'border-border bg-surface text-muted2 hover:bg-surface2',
            ].join(' ')}
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const Agenda = () => {
  const { accountId } = useAccount();
  const [tab, setTab] = useState('events'); // 'events' | 'habits'
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [events, setEvents] = useState([]);
  const [habits, setHabits] = useState([]);
  const [completions, setCompletions] = useState(new Map()); // agendaEventId -> status
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // objeto do evento/habito em edição, ou null

  // ===== Formulário: novo evento pontual =====
  const [evTitle, setEvTitle] = useState('');
  const [evDescription, setEvDescription] = useState('');
  const [evDate, setEvDate] = useState('');
  const [evTime, setEvTime] = useState('');

  // ===== Formulário: novo hábito =====
  const [hbTitle, setHbTitle] = useState('');
  const [hbDescription, setHbDescription] = useState('');
  const [hbFrequency, setHbFrequency] = useState('DAILY');
  const [hbDaysOfWeek, setHbDaysOfWeek] = useState([]);
  const [hbTime, setHbTime] = useState('');

  const showError = (message) => setErro(translateError(message));
  const showSuccess = (message) => {
    setSucesso(message);
    setTimeout(() => setSucesso(''), 3000);
  };

  const fetchAll = useCallback(async () => {
    if (!accountId || accountId === 'null') return;
    try {
      setLoading(true);
      const [evRes, hbRes, compRes] = await Promise.all([
        api.get(`/agenda/account/${accountId}?type=ONE_TIME`),
        api.get(`/agenda/account/${accountId}?type=HABIT`),
        api.get(`/agenda/account/${accountId}/completions?date=${todayStr()}`),
      ]);
      if (!evRes.ok || !hbRes.ok || !compRes.ok) throw new Error('Erro ao carregar a agenda.');
      const [evData, hbData, compData] = await Promise.all([evRes.json(), hbRes.json(), compRes.json()]);
      setEvents(evData);
      setHabits(hbData);
      setCompletions(new Map(compData.map((c) => [c.agendaEventId, c.status])));
      setErro('');
    } catch (error) {
      console.error(error);
      showError(error.message);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const resetEventForm = () => {
    setEvTitle('');
    setEvDescription('');
    setEvDate('');
    setEvTime('');
  };

  const resetHabitForm = () => {
    setHbTitle('');
    setHbDescription('');
    setHbFrequency('DAILY');
    setHbDaysOfWeek([]);
    setHbTime('');
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!evTitle || !evDate || !evTime) {
      showError('Preencha título, data e hora.');
      return;
    }
    try {
      const payload = {
        title: evTitle,
        description: evDescription || null,
        accountId: Number(accountId),
        type: 'ONE_TIME',
        eventDateTime: `${evDate}T${evTime}`,
      };
      const response = await api.post('/agenda', payload);
      if (!response.ok) throw new Error(await response.text() || 'Erro ao criar evento.');
      resetEventForm();
      showSuccess('Evento criado!');
      fetchAll();
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  };

  const handleCreateHabit = async (e) => {
    e.preventDefault();
    if (!hbTitle || !hbTime) {
      showError('Preencha título e horário.');
      return;
    }
    if (hbFrequency === 'WEEKLY' && hbDaysOfWeek.length === 0) {
      showError('Selecione ao menos um dia da semana.');
      return;
    }
    try {
      const payload = {
        title: hbTitle,
        description: hbDescription || null,
        accountId: Number(accountId),
        type: 'HABIT',
        recurrenceFrequency: hbFrequency,
        daysOfWeek: hbFrequency === 'WEEKLY' ? hbDaysOfWeek : null,
        timeOfDay: hbTime,
      };
      const response = await api.post('/agenda', payload);
      if (!response.ok) throw new Error(await response.text() || 'Erro ao criar hábito.');
      resetHabitForm();
      showSuccess('Hábito criado!');
      fetchAll();
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  };

  const handleUpdate = async (id, payload) => {
    try {
      const response = await api.put(`/agenda/${id}`, payload);
      if (!response.ok) throw new Error(await response.text() || 'Erro ao atualizar.');
      showSuccess('Atualizado!');
      setEditingEvent(null);
      fetchAll();
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  };

  const handleToggleActive = async (item) => {
    await handleUpdate(item.id, { active: !item.active });
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/agenda/${id}`);
      if (!response.ok) throw new Error('Erro ao apagar.');
      setDeletingId(null);
      showSuccess('Apagado!');
      fetchAll();
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  };

  const handleMarkHabit = async (habitId, status) => {
    const current = completions.get(habitId);
    try {
      if (current === status) {
        // clicar de novo no mesmo status desmarca (volta a pendente)
        const response = await api.delete(`/agenda/${habitId}/completion/${todayStr()}`);
        if (!response.ok) throw new Error('Erro ao desmarcar hábito.');
        setCompletions((prev) => {
          const next = new Map(prev);
          next.delete(habitId);
          return next;
        });
      } else {
        const response = await api.post(`/agenda/${habitId}/completion`, { eventDate: todayStr(), status });
        if (!response.ok) throw new Error('Erro ao marcar hábito.');
        setCompletions((prev) => new Map(prev).set(habitId, status));
      }
      setErro('');
    } catch (error) {
      console.error(error);
      showError(error.message);
    }
  };

  const renderDeleteActions = (id, onEdit) => (
    <div className="flex gap-2">
      {onEdit && (
        <Button size="sm" variant="outline" title="Editar" onClick={onEdit}>
          <FaEdit />
        </Button>
      )}
      {deletingId === id ? (
        <>
          <Button size="sm" variant="primary" title="Confirmar exclusão" onClick={() => handleDelete(id)}>
            <FaCheckCircle />
          </Button>
          <Button size="sm" variant="outline" title="Cancelar" onClick={() => setDeletingId(null)}>
            ✕
          </Button>
        </>
      ) : (
        <Button size="sm" variant="danger" title="Apagar" onClick={() => setDeletingId(id)}>
          <FaTrash />
        </Button>
      )}
    </div>
  );

  const eventColumns = [
    { header: 'Título', render: (item) => (
        <div>
          <div className="text-text">{item.title}</div>
          {item.description && <div className="text-xs text-muted">{item.description}</div>}
        </div>
      ) },
    {
      header: 'Data e hora',
      render: (item) => {
        const dt = new Date(item.eventDateTime);
        return `${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
      },
    },
    {
      header: 'Ações',
      render: (item) => renderDeleteActions(item.id, () => setEditingEvent({ ...item, kind: 'event' })),
    },
  ];

  const habitColumns = [
    { header: 'Título', render: (item) => (
        <div>
          <div className={item.active ? 'text-text' : 'text-muted line-through'}>{item.title}</div>
          {item.description && <div className="text-xs text-muted">{item.description}</div>}
        </div>
      ) },
    {
      header: 'Frequência',
      render: (item) => item.recurrenceFrequency === 'WEEKLY'
        ? (item.daysOfWeek || []).map((d) => DAYS_OF_WEEK.find((x) => x.value === d)?.label).join(', ')
        : 'Diário',
    },
    { header: 'Horário', render: (item) => item.timeOfDay?.slice(0, 5) },
    {
      header: 'Status',
      render: (item) => !item.active
        ? <Badge variant="neutral">Pausado</Badge>
        : (
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant={completions.get(item.id) === 'DONE' ? 'primary' : 'outline'}
              title="Marcar como feito hoje"
              onClick={() => handleMarkHabit(item.id, 'DONE')}
            >
              <FaCheckCircle />
            </Button>
            <Button
              size="sm"
              variant={completions.get(item.id) === 'SKIPPED' ? 'danger' : 'outline'}
              title="Marcar como pulado hoje"
              onClick={() => handleMarkHabit(item.id, 'SKIPPED')}
            >
              <FaTimesCircle />
            </Button>
          </div>
        ),
    },
    {
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            title={item.active ? 'Pausar hábito' : 'Reativar hábito'}
            onClick={() => handleToggleActive(item)}
          >
            {item.active ? <FaPauseCircle /> : <FaPlayCircle />}
          </Button>
          {renderDeleteActions(item.id, () => setEditingEvent({ ...item, kind: 'habit' }))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setTab('events')}
          className={[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            tab === 'events' ? 'border-primary text-primary dark:text-info' : 'border-transparent text-muted2 hover:text-text',
          ].join(' ')}
        >
          Eventos
        </button>
        <button
          type="button"
          onClick={() => setTab('habits')}
          className={[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            tab === 'habits' ? 'border-primary text-primary dark:text-info' : 'border-transparent text-muted2 hover:text-text',
          ].join(' ')}
        >
          Hábitos
        </button>
        <button
          type="button"
          onClick={() => setTab('calendar')}
          className={[
            'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
            tab === 'calendar' ? 'border-primary text-primary dark:text-info' : 'border-transparent text-muted2 hover:text-text',
          ].join(' ')}
        >
          Calendário
        </button>
      </div>

      {erro && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>}
      {sucesso && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>}

      {tab === 'calendar' ? (
        <CalendarView events={events} habits={habits} />
      ) : tab === 'events' ? (
        <>
          <Card>
            <h1 className="mb-4 text-2xl font-semibold text-text">Novo Evento Pontual</h1>
            <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Título" value={evTitle} onChange={(e) => setEvTitle(e.target.value)} placeholder="Ex: Consulta médica" />
                <Input label="Descrição (opcional)" value={evDescription} onChange={(e) => setEvDescription(e.target.value)} placeholder="Detalhes" />
                <Input label="Data" type="date" value={evDate} onChange={(e) => setEvDate(e.target.value)} />
                <Input label="Hora" type="time" value={evTime} onChange={(e) => setEvTime(e.target.value)} />
              </div>
              <div>
                <Button type="submit">Adicionar Evento</Button>
              </div>
            </form>
          </Card>

          {loading ? (
            <p className="text-sm text-muted2">Carregando...</p>
          ) : (
            <Table columns={eventColumns} data={events} rowKey={(i) => i.id} emptyMessage="Nenhum evento pontual cadastrado." />
          )}
        </>
      ) : (
        <>
          <Card>
            <h1 className="mb-4 text-2xl font-semibold text-text">Novo Hábito</h1>
            <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Título" value={hbTitle} onChange={(e) => setHbTitle(e.target.value)} placeholder="Ex: Tomar remédio" />
                <Input label="Descrição (opcional)" value={hbDescription} onChange={(e) => setHbDescription(e.target.value)} placeholder="Detalhes" />
                <Select
                  label="Frequência"
                  value={hbFrequency}
                  onChange={(e) => setHbFrequency(e.target.value)}
                  options={[
                    { value: 'DAILY', label: 'Diário' },
                    { value: 'WEEKLY', label: 'Semanal' },
                  ]}
                />
                <Input label="Horário do lembrete" type="time" value={hbTime} onChange={(e) => setHbTime(e.target.value)} />
              </div>
              {hbFrequency === 'WEEKLY' && (
                <DaysOfWeekPicker value={hbDaysOfWeek} onChange={setHbDaysOfWeek} />
              )}
              <div>
                <Button type="submit">Adicionar Hábito</Button>
              </div>
            </form>
          </Card>

          {loading ? (
            <p className="text-sm text-muted2">Carregando...</p>
          ) : (
            <Table columns={habitColumns} data={habits} rowKey={(i) => i.id} emptyMessage="Nenhum hábito cadastrado." />
          )}
        </>
      )}

      {editingEvent && (
        <EditModal
          item={editingEvent}
          onClose={() => setEditingEvent(null)}
          onSave={(payload) => handleUpdate(editingEvent.id, payload)}
        />
      )}
    </div>
  );
};

function EditModal({ item, onClose, onSave }) {
  const isHabit = item.kind === 'habit';
  const [title, setTitle] = useState(item.title);
  const [description, setDescription] = useState(item.description || '');
  const [date, setDate] = useState(!isHabit ? item.eventDateTime?.slice(0, 10) : '');
  const [time, setTime] = useState(!isHabit ? item.eventDateTime?.slice(11, 16) : (item.timeOfDay?.slice(0, 5) || ''));
  const [frequency, setFrequency] = useState(item.recurrenceFrequency || 'DAILY');
  const [daysOfWeek, setDaysOfWeek] = useState(item.daysOfWeek || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isHabit) {
      onSave({
        title,
        description: description || null,
        recurrenceFrequency: frequency,
        daysOfWeek: frequency === 'WEEKLY' ? daysOfWeek : null,
        timeOfDay: time,
      });
    } else {
      onSave({
        title,
        description: description || null,
        eventDateTime: `${date}T${time}`,
      });
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={isHabit ? 'Editar Hábito' : 'Editar Evento'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        {isHabit ? (
          <>
            <Select
              label="Frequência"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              options={[
                { value: 'DAILY', label: 'Diário' },
                { value: 'WEEKLY', label: 'Semanal' },
              ]}
            />
            {frequency === 'WEEKLY' && <DaysOfWeekPicker value={daysOfWeek} onChange={setDaysOfWeek} />}
            <Input label="Horário do lembrete" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Salvar</Button>
        </div>
      </form>
    </Modal>
  );
}

export default Agenda;
