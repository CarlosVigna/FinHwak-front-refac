// Formata uma data como YYYY-MM-DD usando os componentes LOCAIS (getFullYear/
// getMonth/getDate), nunca toISOString() -- toISOString() converte pra UTC
// antes de formatar, o que faz a data "virar" cedo demais perto da meia-noite
// em fusos negativos (ex: as 23:29 em Sao Paulo, UTC-3, ja e 02:29 UTC do dia
// seguinte). Usado tanto pra "hoje" quanto pra qualquer outra data derivada
// de um objeto Date, garantindo que os dois representem o mesmo dia que o
// usuario ve no relogio do proprio aparelho.
export function toDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function todayStr() {
  return toDateKey(new Date());
}
