// Espelha com.carlos.finhawk_refac.service.DayTypeService (backend) --
// mesma anchor date, mesma logica -- pra calcular tipo de dia no cliente sem
// round-trip por dia renderizado (ex: grade de calendario com 42 celulas).
// Se a anchor date do backend mudar, muda aqui tambem.
const PLANTAO_ANCHOR = new Date(2026, 7, 15); // mes 0-indexed: 7 = agosto

const DAY_OF_WEEK_JS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

function daysBetween(a, b) {
  const msPerDay = 24 * 60 * 60 * 1000;
  const aUtc = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bUtc = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bUtc - aUtc) / msPerDay);
}

// Mesmo que Math.floorMod do Java -- resultado sempre nao-negativo, mesmo
// pra diferenca negativa (data anterior ao anchor).
function floorMod(n, m) {
  return ((n % m) + m) % m;
}

// date: objeto Date (hora do dia ignorada, so a data importa).
// overrideDayType: 'PLANTAO' | 'FOLGA' (opcional) -- valor efetivo vindo do
// backend (calculado ou escolhido manualmente, ver DayTypeService), tem
// prioridade sobre o calculo local. ENTREGA/FIM_DE_SEMANA nunca e
// sobrescrito, sempre calculado pelo dia da semana.
export function calculateDayTypes(date, overrideDayType) {
  const dayOfWeek = DAY_OF_WEEK_JS[date.getDay()];
  const isWeekend = dayOfWeek === 'SATURDAY' || dayOfWeek === 'SUNDAY';

  let onCallTag = overrideDayType;
  if (!onCallTag) {
    const diff = daysBetween(PLANTAO_ANCHOR, date);
    const isPlantao = floorMod(diff, 2) === 0;
    onCallTag = isPlantao ? 'PLANTAO' : 'FOLGA';
  }

  return [
    onCallTag,
    isWeekend ? 'FIM_DE_SEMANA' : 'ENTREGA',
  ];
}

// Mesma logica de com.carlos.finhawk_refac.service.DayTypeService.habitOccursOn:
// etiqueta de tipo de dia tem prioridade (logica OU) quando preenchida,
// senao usa a frequencia DAILY/WEEKLY antiga.
export function habitOccursOn(habit, date, overrideDayType) {
  if (habit.dayTypeTags && habit.dayTypeTags.length > 0) {
    const todayTypes = calculateDayTypes(date, overrideDayType);
    return habit.dayTypeTags.some((tag) => todayTypes.includes(tag));
  }

  if (habit.recurrenceFrequency === 'DAILY') {
    return true;
  }
  if (habit.recurrenceFrequency === 'WEEKLY') {
    const dayOfWeek = DAY_OF_WEEK_JS[date.getDay()];
    return (habit.daysOfWeek || []).includes(dayOfWeek);
  }
  return false;
}
