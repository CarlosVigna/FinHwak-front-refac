import { describe, it, expect, afterEach, vi } from 'vitest';
import { toDateKey, todayStr } from './dateKey';

// Bug real: as 23:29 horario de Brasilia (ainda segunda 17/08), o app
// considerava terca 18/08 -- toISOString() converte pra UTC antes de
// formatar, e 23:29 em Sao Paulo (UTC-3) ja e 02:29 UTC do dia seguinte.
// O fix usa os componentes locais (getFullYear/getMonth/getDate), que nao
// sofrem essa conversao.

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
});

describe('todayStr / toDateKey (fuso America/Sao_Paulo)', () => {
  it('as 23:29 de segunda (horario local) ainda retorna segunda, nao terca', () => {
    vi.stubEnv('TZ', 'America/Sao_Paulo');
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 17, 23, 29)); // 17/08/2026 (segunda) 23:29 local

    expect(todayStr()).toBe('2026-08-17');
  });

  it('a meia-noite em ponto ja e o dia seguinte', () => {
    vi.stubEnv('TZ', 'America/Sao_Paulo');
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 18, 0, 0));

    expect(todayStr()).toBe('2026-08-18');
  });

  it('no meio do dia (longe de qualquer virada) retorna o dia correto', () => {
    vi.stubEnv('TZ', 'America/Sao_Paulo');
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 17, 12, 0));

    expect(todayStr()).toBe('2026-08-17');
  });

  it('toDateKey usa os componentes locais da data recebida, nao UTC', () => {
    vi.stubEnv('TZ', 'America/Sao_Paulo');
    const date = new Date(2026, 7, 17, 23, 29);

    expect(toDateKey(date)).toBe('2026-08-17');
  });
});
