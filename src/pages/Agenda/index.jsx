import { useEffect, useState, useCallback } from 'react';
import { FaTrash, FaCheckCircle, FaTimesCircle, FaPauseCircle, FaPlayCircle, FaEdit, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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

const DAY_TYPES = [
  { value: 'PLANTAO', label: '🌙 Plantão' },
  { value: 'FOLGA', label: '🏖️ Folga' },
  { value: 'ENTREGA', label: '🚚 Entrega' },
  { value: 'FIM_DE_SEMANA', label: '🎉 Fim de semana' },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

// Formata uma data local (nao UTC) como YYYY-MM-DD -- mesmo padrao usado em
// CalendarView.jsx (toDateKey), pra navegacao dia-a-dia da aba Eventos.
const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const shiftDateKey = (dateKey, deltaDays) => {
  const d = new Date(`${dateKey}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return toDateKey(d);
};

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

function DayTypePicker({ value = [], onChange }) {
  const toggle = (type) => {
    onChange(value.includes(type) ? value.filter((d) => d !== type) : [...value, type]);
  };
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text">Etiquetas de tipo de dia</span>
      <div className="flex flex-wrap gap-1.5">
        {DAY_TYPES.map((d) => (
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
      <span className="text-xs text-muted">Ocorre em todo dia que bater com qualquer uma das etiquetas escolhidas.</span>
    </div>
  );
}

// Alterna entre os dois jeitos de definir quando um habito ocorre --
// frequencia simples (Diario/Semanal) OU etiqueta de tipo de dia (Plantao/
// Folga/Entrega/Fim de semana), nunca os dois ao mesmo tempo.
function HabitScheduleModeToggle({ mode, onChange }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-text">Quando ocorre</span>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange('frequency')}
          className={[
            'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
            mode === 'frequency'
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-surface text-muted2 hover:bg-surface2',
          ].join(' ')}
        >
          Frequência simples
        </button>
        <button
          type="button"
          onClick={() => onChange('dayType')}
          className={[
            'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
            mode === 'dayType'
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-surface text-muted2 hover:bg-surface2',
          ].join(' ')}
        >
          Tipo de dia
        </button>
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
  // { kind: 'event' | 'habit', mode: 'create' | 'edit', item: objeto ou null } | null
  const [formModal, setFormModal] = useState(null);
  const [notifyLoading, setNotifyLoading] = useState(null); // 'today' | 'week' | 'open-bills' | null
  const [selectedEventDate, setSelectedEventDate] = useState(todayStr());

  // ===== Formulário: novo hábito =====
  const [hbTitle, setHbTitle] = useState('');
  const [hbDescription, setHbDescription] = useState('');
  const [hbMode, setHbMode] = useState('frequency'); // 'frequency' | 'dayType'
  const [hbFrequency, setHbFrequency] = useState('DAILY');
  const [hbDaysOfWeek, setHbDaysOfWeek] = useState([]);
  const [hbDayTypeTags, setHbDayTypeTags] = useState([]);
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

  const handleNotify = async (key, path) => {
    setNotifyLoading(key);
    try {
      const response = await api.post(path, {});
      if (!response.ok) throw new Error(await response.text() || 'Erro ao enviar.');
      showSuccess('Enviado! Confere o WhatsApp 📱');
    } catch (error) {
      console.error(error);
      showError(error.message);
    } finally {
      setNotifyLoading(null);
    }
  };

  const resetHabitForm = () => {
    setHbTitle('');
    setHbDescription('');
    setHbMode('frequency');
    setHbFrequency('DAILY');
    setHbDaysOfWeek([]);
    setHbDayTypeTags([]);
    setHbTime('');
  };

  // Usado pelo AgendaFormModal em modo 'create' (evento ou habito) -- payload
  // ja vem pronto do modal, so falta accountId/type e o POST.
  const handleCreateAgenda = async (payload, kind) => {
    try {
      const response = await api.post('/agenda', {
        ...payload,
        accountId: Number(accountId),
        type: kind === 'event' ? 'ONE_TIME' : 'HABIT',
      });
      if (!response.ok) throw new Error(await response.text() || 'Erro ao criar.');
      showSuccess(kind === 'event' ? 'Evento criado!' : 'Hábito criado!');
      setFormModal(null);
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
    if (hbMode === 'dayType' && hbDayTypeTags.length === 0) {
      showError('Selecione ao menos uma etiqueta de tipo de dia.');
      return;
    }
    if (hbMode === 'frequency' && hbFrequency === 'WEEKLY' && hbDaysOfWeek.length === 0) {
      showError('Selecione ao menos um dia da semana.');
      return;
    }
    try {
      const payload = {
        title: hbTitle,
        description: hbDescription || null,
        accountId: Number(accountId),
        type: 'HABIT',
        timeOfDay: hbTime,
        recurrenceFrequency: hbMode === 'frequency' ? hbFrequency : null,
        daysOfWeek: hbMode === 'frequency' && hbFrequency === 'WEEKLY' ? hbDaysOfWeek : null,
        dayTypeTags: hbMode === 'dayType' ? hbDayTypeTags : [],
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
      setFormModal(null);
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

  // Generico pra evento pontual e habito -- o backend (AgendaEventCompletion)
  // nao distingue tipo, so registra "feito/pulado numa data" pra qualquer
  // AgendaEvent.
  const handleMarkCompletion = async (agendaEventId, status) => {
    const current = completions.get(agendaEventId);
    try {
      if (current === status) {
        // clicar de novo no mesmo status desmarca (volta a pendente)
        const response = await api.delete(`/agenda/${agendaEventId}/completion/${todayStr()}`);
        if (!response.ok) throw new Error('Erro ao desmarcar.');
        setCompletions((prev) => {
          const next = new Map(prev);
          next.delete(agendaEventId);
          return next;
        });
      } else {
        const response = await api.post(`/agenda/${agendaEventId}/completion`, { eventDate: todayStr(), status });
        if (!response.ok) throw new Error('Erro ao marcar.');
        setCompletions((prev) => new Map(prev).set(agendaEventId, status));
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

  const habitColumns = [
    { header: 'Título', render: (item) => (
        <div>
          <div className={item.active ? 'text-text' : 'text-muted line-through'}>{item.title}</div>
          {item.description && <div className="text-xs text-muted">{item.description}</div>}
        </div>
      ) },
    {
      header: 'Frequência',
      render: (item) => (item.dayTypeTags || []).length > 0
        ? (
          <div className="flex flex-wrap gap-1">
            {item.dayTypeTags.map((t) => (
              <Badge key={t} variant="info">{DAY_TYPES.find((x) => x.value === t)?.label}</Badge>
            ))}
          </div>
        )
        : item.recurrenceFrequency === 'WEEKLY'
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
              onClick={() => handleMarkCompletion(item.id, 'DONE')}
            >
              <FaCheckCircle />
            </Button>
            <Button
              size="sm"
              variant={completions.get(item.id) === 'SKIPPED' ? 'danger' : 'outline'}
              title="Marcar como pulado hoje"
              onClick={() => handleMarkCompletion(item.id, 'SKIPPED')}
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
          {renderDeleteActions(item.id, () => setFormModal({ kind: 'habit', mode: 'edit', item }))}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          disabled={notifyLoading === 'today'}
          onClick={() => handleNotify('today', '/agenda/notify/today')}
        >
          {notifyLoading === 'today' ? 'Enviando...' : '📆 Resumo de hoje'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={notifyLoading === 'week'}
          onClick={() => handleNotify('week', '/agenda/notify/week')}
        >
          {notifyLoading === 'week' ? 'Enviando...' : '📅 Resumo da semana'}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={notifyLoading === 'open-bills'}
          onClick={() => handleNotify('open-bills', '/agenda/notify/open-bills')}
        >
          {notifyLoading === 'open-bills' ? 'Enviando...' : '💰 Tudo em aberto'}
        </Button>
      </div>

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
        <EventsDayView
          events={events}
          completions={completions}
          loading={loading}
          selectedDate={selectedEventDate}
          onShiftDate={(delta) => setSelectedEventDate(shiftDateKey(selectedEventDate, delta))}
          onGoToday={() => setSelectedEventDate(todayStr())}
          onMarkCompletion={handleMarkCompletion}
          onEdit={(item) => setFormModal({ kind: 'event', mode: 'edit', item })}
          deletingId={deletingId}
          onRequestDelete={setDeletingId}
          onDelete={handleDelete}
        />
      ) : (
        <>
          <Card>
            <h1 className="mb-4 text-2xl font-semibold text-text">Novo Hábito</h1>
            <form onSubmit={handleCreateHabit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label="Título" value={hbTitle} onChange={(e) => setHbTitle(e.target.value)} placeholder="Ex: Tomar remédio" />
                <Input label="Descrição (opcional)" value={hbDescription} onChange={(e) => setHbDescription(e.target.value)} placeholder="Detalhes" />
                <Input label="Horário do lembrete" type="time" value={hbTime} onChange={(e) => setHbTime(e.target.value)} />
              </div>
              <HabitScheduleModeToggle mode={hbMode} onChange={setHbMode} />
              {hbMode === 'frequency' ? (
                <>
                  <Select
                    label="Frequência"
                    value={hbFrequency}
                    onChange={(e) => setHbFrequency(e.target.value)}
                    options={[
                      { value: 'DAILY', label: 'Diário' },
                      { value: 'WEEKLY', label: 'Semanal' },
                    ]}
                  />
                  {hbFrequency === 'WEEKLY' && (
                    <DaysOfWeekPicker value={hbDaysOfWeek} onChange={setHbDaysOfWeek} />
                  )}
                </>
              ) : (
                <DayTypePicker value={hbDayTypeTags} onChange={setHbDayTypeTags} />
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

      {tab === 'events' && (
        <button
          type="button"
          onClick={() => setFormModal({ kind: 'event', mode: 'create', item: null })}
          title="Novo evento"
          aria-label="Novo evento"
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-colors hover:bg-primary-light"
        >
          <FaPlus size={20} />
        </button>
      )}

      {formModal && (
        <AgendaFormModal
          kind={formModal.kind}
          mode={formModal.mode}
          item={formModal.item}
          defaultDate={selectedEventDate}
          onClose={() => setFormModal(null)}
          onSave={(payload) => (formModal.mode === 'create'
            ? handleCreateAgenda(payload, formModal.kind)
            : handleUpdate(formModal.item.id, payload))}
        />
      )}
    </div>
  );
};

function EventsDayView({
  events, completions, loading, selectedDate, onShiftDate, onGoToday,
  onMarkCompletion, onEdit, deletingId, onRequestDelete, onDelete,
}) {
  const heroLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });
  const isToday = selectedDate === todayStr();

  const dayEvents = events
    .filter((ev) => ev.eventDateTime?.slice(0, 10) === selectedDate)
    .slice()
    .sort((a, b) => a.eventDateTime.localeCompare(b.eventDateTime));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-center justify-between">
          <Button size="sm" variant="outline" onClick={() => onShiftDate(-1)} title="Dia anterior">
            <FaChevronLeft />
          </Button>
          <div className="text-center">
            <div className="text-xl font-semibold capitalize text-text">{heroLabel}</div>
            {isToday ? (
              <Badge variant="info">Hoje</Badge>
            ) : (
              <button type="button" onClick={onGoToday} className="text-xs text-primary hover:underline dark:text-info">
                Voltar pra hoje
              </button>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => onShiftDate(1)} title="Próximo dia">
            <FaChevronRight />
          </Button>
        </div>
      </Card>

      {loading ? (
        <p className="text-sm text-muted2">Carregando...</p>
      ) : dayEvents.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted2">Nada agendado pra esse dia.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {dayEvents.map((item) => {
            const done = completions.get(item.id) === 'DONE';
            return (
              <Card key={item.id} className="flex items-center gap-3">
                <div className="w-14 shrink-0 text-sm font-medium text-muted2">
                  {item.eventDateTime.slice(11, 16)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={done ? 'truncate text-muted line-through' : 'truncate font-medium text-text'}>
                    {item.title}
                  </div>
                  {item.description && <div className="truncate text-xs text-muted">{item.description}</div>}
                </div>
                {done ? (
                  <Badge variant="success">Concluído</Badge>
                ) : (
                  <Button size="sm" variant="outline" title="Marcar como feito" onClick={() => onMarkCompletion(item.id, 'DONE')}>
                    <FaCheckCircle />
                  </Button>
                )}
                <Button size="sm" variant="outline" title="Editar" onClick={() => onEdit(item)}>
                  <FaEdit />
                </Button>
                {deletingId === item.id ? (
                  <>
                    <Button size="sm" variant="primary" title="Confirmar exclusão" onClick={() => onDelete(item.id)}>
                      <FaCheckCircle />
                    </Button>
                    <Button size="sm" variant="outline" title="Cancelar" onClick={() => onRequestDelete(null)}>
                      ✕
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="danger" title="Apagar" onClick={() => onRequestDelete(item.id)}>
                    <FaTrash />
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

function AgendaFormModal({ kind, mode, item, defaultDate, onClose, onSave }) {
  const isHabit = kind === 'habit';
  const isCreate = mode === 'create';
  const [title, setTitle] = useState(item?.title || '');
  const [description, setDescription] = useState(item?.description || '');
  const [date, setDate] = useState(!isHabit ? (item?.eventDateTime?.slice(0, 10) || defaultDate || '') : '');
  const [time, setTime] = useState(!isHabit ? (item?.eventDateTime?.slice(11, 16) || '') : (item?.timeOfDay?.slice(0, 5) || ''));
  const [habitMode, setHabitMode] = useState(item?.dayTypeTags?.length > 0 ? 'dayType' : 'frequency');
  const [frequency, setFrequency] = useState(item?.recurrenceFrequency || 'DAILY');
  const [daysOfWeek, setDaysOfWeek] = useState(item?.daysOfWeek || []);
  const [dayTypeTags, setDayTypeTags] = useState(item?.dayTypeTags || []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isHabit) {
      onSave({
        title,
        description: description || null,
        timeOfDay: time,
        recurrenceFrequency: habitMode === 'frequency' ? frequency : null,
        daysOfWeek: habitMode === 'frequency' && frequency === 'WEEKLY' ? daysOfWeek : null,
        dayTypeTags: habitMode === 'dayType' ? dayTypeTags : [],
      });
    } else {
      onSave({
        title,
        description: description || null,
        eventDateTime: `${date}T${time}`,
      });
    }
  };

  const titles = {
    event: isCreate ? 'Novo Evento' : 'Editar Evento',
    habit: isCreate ? 'Novo Hábito' : 'Editar Hábito',
  };

  return (
    <Modal isOpen onClose={onClose} title={titles[isHabit ? 'habit' : 'event']}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Título" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <Input label="Descrição (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        {isHabit ? (
          <>
            <HabitScheduleModeToggle mode={habitMode} onChange={setHabitMode} />
            {habitMode === 'dayType' && <DayTypePicker value={dayTypeTags} onChange={setDayTypeTags} />}
            {habitMode === 'frequency' && (
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
              </>
            )}
            <Input label="Horário do lembrete" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
          </>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            <Input label="Hora" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
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
