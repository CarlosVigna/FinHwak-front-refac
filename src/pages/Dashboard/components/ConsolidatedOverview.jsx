import { useEffect, useState, useMemo, useRef } from 'react';
import { api } from '../../../services/api';
import { translateError } from '../../../utils/errorMessages';
import PropTypes from 'prop-types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer,
    PieChart, Pie
} from 'recharts';
import { formatCurrency } from '../utils/formatters';
import {
    filterByMonth,
    calculateReceitas,
    calculateDespesas,
    calculateSaldoRealizado,
    calculatePendenteMes,
    calculateDelta,
    groupByMonth
} from '../utils/calculations';
import AnnualChart from './AnnualChart';
import Card from '../../../componentes/ui/Card';
import Button from '../../../componentes/ui/Button';

const TOOLTIP_STYLE = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' };
const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4', '#ec4899'];

// ── Multi-select dropdown ─────────────────────────────────────────
function AccountMultiSelect({ accounts, selectedIds, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const allSelected = selectedIds.length === accounts.length;

    const toggle = (id) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(x => x !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    useEffect(() => {
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener('mousedown', onDown);
        return () => document.removeEventListener('mousedown', onDown);
    }, []);

    const label = allSelected
        ? 'Todas as contas'
        : `${selectedIds.length} conta${selectedIds.length !== 1 ? 's' : ''} selecionada${selectedIds.length !== 1 ? 's' : ''}`;

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-text hover:bg-surface2"
            >
                {label}
                <span className="text-xs text-muted">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="absolute right-0 z-20 mt-1 w-64 rounded-md border border-border bg-surface p-2 shadow-lg">
                    <label className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-text hover:bg-surface2">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => onChange(allSelected ? [] : accounts.map(a => a.accountId))}
                        />
                        <span>Todas as contas</span>
                    </label>
                    <div className="my-1 border-t border-border" />
                    {accounts.map(acc => (
                        <label key={acc.accountId} className="flex items-center gap-2 rounded px-2 py-1.5 text-sm text-text hover:bg-surface2">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(acc.accountId)}
                                onChange={() => toggle(acc.accountId)}
                            />
                            <span className="h-2 w-2 rounded-full bg-primary" />
                            <span>{acc.name}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── ConsolidatedOverview ─────────────────────────────────────────
const ConsolidatedOverview = ({ onSelectAccount, onBackToDashboard }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedIds, setSelectedIds] = useState([]);
    const [allBills, setAllBills] = useState([]);
    const [billsLoading, setBillsLoading] = useState(false);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear  = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Fetch consolidated summary
    useEffect(() => {
        let cancelled = false;

        const fetchSummary = async () => {
            try {
                setLoading(true);
                const response = await api.get('/bill/dashboard/consolidated');
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'Falha ao carregar resumo consolidado.');
                }
                const data = await response.json();
                if (cancelled) return;
                setSummary(data);
                if (data.accounts) {
                    setSelectedIds(data.accounts.map(acc => acc.accountId));
                }
                setError(null);
            } catch (err) {
                if (cancelled) return;
                console.error(err);
                setError(translateError(err.message));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        fetchSummary();

        return () => { cancelled = true; };
    }, []);

    // Fetch all bills for selected accounts when >= 2 selected (C1 + C3)
    useEffect(() => {
        if (selectedIds.length < 2) {
            setAllBills([]);
            return;
        }

        let cancelled = false;

        const fetchAllBills = async () => {
            setBillsLoading(true);
            try {
                const results = await Promise.all(
                    selectedIds.map(id =>
                        api.get(`/bill/account/${id}`).then(r => r.ok ? r.json() : [])
                    )
                );
                if (cancelled) return;
                setAllBills(results.flat());
            } catch (err) {
                if (cancelled) return;
                console.error('Erro ao buscar lançamentos consolidados:', err);
                setAllBills([]);
            } finally {
                if (!cancelled) setBillsLoading(false);
            }
        };
        fetchAllBills();

        return () => { cancelled = true; };
    }, [selectedIds]);

    // C1 — Aggregated metrics from combined bills
    const filteredBills  = useMemo(() => filterByMonth(allBills, currentMonth, currentYear), [allBills, currentMonth, currentYear]);
    const prevBills      = useMemo(() => filterByMonth(allBills, prevMonth, prevYear), [allBills, prevMonth, prevYear]);
    const receitas       = useMemo(() => calculateReceitas(filteredBills), [filteredBills]);
    const despesas       = useMemo(() => calculateDespesas(filteredBills), [filteredBills]);
    const saldoRealizado = useMemo(() => calculateSaldoRealizado(filteredBills), [filteredBills]);
    const pendenteMes    = useMemo(() => calculatePendenteMes(filteredBills), [filteredBills]);
    const saldoAcumulado = useMemo(() => calculateSaldoRealizado(allBills), [allBills]);
    const deltaReceitas  = useMemo(() => calculateDelta(receitas,       calculateReceitas(prevBills)),       [receitas,       prevBills]);
    const deltaDespesas  = useMemo(() => calculateDelta(despesas,       calculateDespesas(prevBills)),       [despesas,       prevBills]);
    const deltaResultado = useMemo(() => calculateDelta(saldoRealizado, calculateSaldoRealizado(prevBills)), [saldoRealizado, prevBills]);

    // C2 — Impact per account bar chart
    const impactData = useMemo(() => {
        if (!summary?.accounts) return [];
        return summary.accounts
            .filter(acc => selectedIds.includes(acc.accountId))
            .map(acc => ({
                name: acc.name,
                resultado: (acc.receitasRealizadas || 0) - (acc.despesasRealizadas || 0),
            }));
    }, [summary, selectedIds]);

    // C3 — Annual chart data from combined bills
    const monthData = useMemo(() => groupByMonth(allBills, 6, 5), [allBills]);

    // Legacy totals (from summary API, for single-account view + per-account list)
    const totals = useMemo(() => {
        if (!summary?.accounts) return { patrimonio: 0, receitas: 0, despesas: 0 };
        const filtered = summary.accounts.filter(acc => selectedIds.includes(acc.accountId));
        return {
            patrimonio: filtered.reduce((s, acc) => s + (acc.saldoRealizado || 0), 0),
            receitas:   filtered.reduce((s, acc) => s + (acc.receitasRealizadas || 0), 0),
            despesas:   filtered.reduce((s, acc) => s + (acc.despesasRealizadas || 0), 0),
        };
    }, [summary, selectedIds]);

    const receitasByAccount = useMemo(() => {
        if (!summary?.accounts) return [];
        return summary.accounts
            .filter(acc => selectedIds.includes(acc.accountId) && (acc.receitasRealizadas || 0) > 0)
            .map(acc => ({ name: acc.name, value: acc.receitasRealizadas || 0 }));
    }, [summary, selectedIds]);

    const despesasByAccount = useMemo(() => {
        if (!summary?.accounts) return [];
        return summary.accounts
            .filter(acc => selectedIds.includes(acc.accountId) && (acc.despesasRealizadas || 0) > 0)
            .map(acc => ({ name: acc.name, value: acc.despesasRealizadas || 0 }));
    }, [summary, selectedIds]);

    const showConsolidated = selectedIds.length >= 2;

    if (loading) return <div className="p-6 text-sm text-muted2">Carregando resumo consolidado...</div>;
    if (error)   return <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">Erro: {error}</p>;
    if (!summary) return null;

    const deltaClass = (v) => (v >= 0 ? 'text-success' : 'text-danger');

    return (
        <div className="flex flex-col gap-6">
            {/* Header + seletor */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-2xl font-semibold text-text">Visão Consolidada</h2>
                    {onBackToDashboard && (
                        <Button variant="outline" onClick={onBackToDashboard} title="Voltar ao dashboard">
                            ← Voltar
                        </Button>
                    )}
                </div>
                <p className="text-sm text-muted2">
                    Representa os valores efetivamente recebidos e pagos registrados no FinHawk.
                    Não representa patrimônio total.
                </p>
                <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-text">Contas exibidas</span>
                    {summary.accounts && summary.accounts.length > 0 && (
                        <AccountMultiSelect
                            accounts={summary.accounts}
                            selectedIds={selectedIds}
                            onChange={setSelectedIds}
                        />
                    )}
                </div>
            </div>

            {/* C1 — 5 cards de métricas agregadas (≥ 2 contas) */}
            {showConsolidated && (
                billsLoading ? (
                    <p className="text-sm text-muted2">Calculando métricas...</p>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                        <Card>
                            <div className="text-sm text-muted2">Receitas</div>
                            <div className="mt-1 text-xl font-semibold text-success">{formatCurrency(receitas)}</div>
                            {deltaReceitas !== null && (
                                <div className={`mt-1 text-xs font-medium ${deltaClass(deltaReceitas)}`}>
                                    {deltaReceitas >= 0 ? '▲' : '▼'} {Math.abs(deltaReceitas).toFixed(1)}%
                                </div>
                            )}
                        </Card>
                        <Card>
                            <div className="text-sm text-muted2">Despesas</div>
                            <div className="mt-1 text-xl font-semibold text-danger">{formatCurrency(despesas)}</div>
                            {deltaDespesas !== null && (
                                <div className={`mt-1 text-xs font-medium ${deltaClass(deltaDespesas)}`}>
                                    {deltaDespesas >= 0 ? '▲' : '▼'} {Math.abs(deltaDespesas).toFixed(1)}%
                                </div>
                            )}
                        </Card>
                        <Card>
                            <div className="text-sm text-muted2">Pendente do Mês</div>
                            <div className="mt-1 text-xl font-semibold text-warning">{formatCurrency(pendenteMes)}</div>
                        </Card>
                        <Card>
                            <div className="text-sm text-muted2">Resultado Realizado</div>
                            <div className={`mt-1 text-xl font-semibold ${saldoRealizado >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatCurrency(saldoRealizado)}
                            </div>
                            {deltaResultado !== null && (
                                <div className={`mt-1 text-xs font-medium ${deltaClass(deltaResultado)}`}>
                                    {deltaResultado >= 0 ? '▲' : '▼'} {Math.abs(deltaResultado).toFixed(1)}%
                                </div>
                            )}
                        </Card>
                        <Card>
                            <div className="text-sm text-muted2">Saldo Acumulado</div>
                            <div className={`mt-1 text-xl font-semibold ${saldoAcumulado >= 0 ? 'text-success' : 'text-danger'}`}>
                                {formatCurrency(saldoAcumulado)}
                            </div>
                        </Card>
                    </div>
                )
            )}

            {/* Saldo total — apenas 1 conta selecionada */}
            {!showConsolidated && (
                <Card className="text-center">
                    <div className="text-3xl font-semibold text-text">{formatCurrency(totals.patrimonio)}</div>
                    <div className="mt-1 text-sm text-muted2">
                        {selectedIds.length} conta{selectedIds.length !== 1 ? 's' : ''} selecionada{selectedIds.length !== 1 ? 's' : ''}
                    </div>
                </Card>
            )}

            {/* C2 — Gráfico "Impacto por conta" (≥ 2 contas) */}
            {showConsolidated && impactData.length >= 2 && (
                <Card>
                    <div className="mb-4 flex items-center gap-1.5">
                        <span className="text-lg font-semibold text-text">Impacto por conta (mês atual)</span>
                        <span
                            className="cursor-help text-xs text-muted"
                            title="Resultado de cada conta no mês: receitas realizadas − despesas realizadas."
                        >ⓘ</span>
                    </div>
                    <ResponsiveContainer width="100%" height={Math.max(180, impactData.length * 44)}>
                        <BarChart data={impactData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                            <XAxis
                                type="number"
                                stroke="var(--muted)"
                                tick={{ fill: 'var(--muted2)', fontSize: 11 }}
                                tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`}
                            />
                            <YAxis
                                type="category"
                                dataKey="name"
                                stroke="var(--muted)"
                                tick={{ fill: 'var(--muted2)', fontSize: 11 }}
                                width={100}
                            />
                            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                            <Tooltip
                                contentStyle={TOOLTIP_STYLE}
                                formatter={(v) => [formatCurrency(v), 'Resultado']}
                            />
                            <Bar dataKey="resultado" radius={[0, 4, 4, 0]}>
                                {impactData.map((entry, i) => (
                                    <Cell key={i} fill={entry.resultado >= 0 ? 'var(--green)' : 'var(--red)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* C2.5 — Donut charts por conta (≥ 2 contas) */}
            {showConsolidated && !billsLoading && (receitasByAccount.length > 0 || despesasByAccount.length > 0) && (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <Card>
                        <div className="mb-4 text-lg font-semibold text-text">Receitas por conta (mês atual)</div>
                        {receitasByAccount.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={receitasByAccount}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {receitasByAccount.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={TOOLTIP_STYLE}
                                            formatter={(v) => [formatCurrency(v), 'Receitas']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-3 flex flex-col gap-1.5">
                                    {receitasByAccount.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="flex-1 truncate text-text">{entry.name}</span>
                                            <span className="text-muted2">{formatCurrency(entry.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-sm text-muted">Sem receitas no mês</div>
                        )}
                    </Card>

                    <Card>
                        <div className="mb-4 text-lg font-semibold text-text">Despesas por conta (mês atual)</div>
                        {despesasByAccount.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height={200}>
                                    <PieChart>
                                        <Pie
                                            data={despesasByAccount}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {despesasByAccount.map((_, i) => (
                                                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={TOOLTIP_STYLE}
                                            formatter={(v) => [formatCurrency(v), 'Despesas']}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="mt-3 flex flex-col gap-1.5">
                                    {despesasByAccount.map((entry, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                            <span className="flex-1 truncate text-text">{entry.name}</span>
                                            <span className="text-muted2">{formatCurrency(entry.value)}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-sm text-muted">Sem despesas no mês</div>
                        )}
                    </Card>
                </div>
            )}

            {/* C3 — Evolução anual consolidada (≥ 2 contas, dados carregados) */}
            {showConsolidated && !billsLoading && allBills.length > 0 && (
                <AnnualChart monthData={monthData} />
            )}

            {/* Detalhes por conta */}
            <div>
                <h3 className="mb-3 text-lg font-semibold text-text">Detalhes por Conta</h3>
                {summary.accounts && summary.accounts.length > 0 ? (
                    <div className="flex flex-col gap-3">
                        {summary.accounts
                            .filter(acc => selectedIds.includes(acc.accountId))
                            .map(acc => (
                                <Card key={acc.accountId} className="flex flex-wrap items-center justify-between gap-4">
                                    <div>
                                        <div className="font-semibold text-text">{acc.name}</div>
                                        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted2">
                                            <span>Receitas: <strong className="text-text">{formatCurrency(acc.receitasRealizadas)}</strong></span>
                                            <span>Despesas: <strong className="text-text">{formatCurrency(acc.despesasRealizadas)}</strong></span>
                                            <span>Saldo: <strong className="text-text">{formatCurrency(acc.saldoRealizado)}</strong></span>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onSelectAccount(acc.accountId)}
                                        title="Abrir dashboard desta conta"
                                    >
                                        Abrir →
                                    </Button>
                                </Card>
                            ))}
                    </div>
                ) : (
                    <p className="text-sm text-muted2">Nenhuma conta selecionada.</p>
                )}
            </div>
        </div>
    );
};

export default ConsolidatedOverview;

ConsolidatedOverview.propTypes = {
    onSelectAccount: PropTypes.func,
    onBackToDashboard: PropTypes.func,
};
