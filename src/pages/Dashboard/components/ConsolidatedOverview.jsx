import { useEffect, useState, useMemo } from 'react';
import { api } from '../../../services/api';
import PropTypes from 'prop-types';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer
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

// ── Multi-select dropdown ─────────────────────────────────────────
function AccountMultiSelect({ accounts, selectedIds, onChange }) {
    const [open, setOpen] = useState(false);
    const ref = { current: null };
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
        <div className="account-multiselect" ref={(el) => { ref.current = el; }}>
            <button
                type="button"
                className="account-multiselect-trigger"
                onClick={() => setOpen(o => !o)}
            >
                {label}
                <span className="account-multiselect-arrow">{open ? '▲' : '▼'}</span>
            </button>
            {open && (
                <div className="account-multiselect-panel">
                    <label className="account-multiselect-item">
                        <input
                            type="checkbox"
                            checked={allSelected}
                            onChange={() => onChange(allSelected ? [] : accounts.map(a => a.accountId))}
                        />
                        <span>Todas as contas</span>
                    </label>
                    <div className="account-multiselect-divider" />
                    {accounts.map(acc => (
                        <label key={acc.accountId} className="account-multiselect-item">
                            <input
                                type="checkbox"
                                checked={selectedIds.includes(acc.accountId)}
                                onChange={() => toggle(acc.accountId)}
                            />
                            <span className="account-multiselect-dot" />
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
                setError(err.message);
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

    const showConsolidated = selectedIds.length >= 2;

    if (loading) return <div className="consolidated-loading">Carregando resumo consolidado...</div>;
    if (error)   return <div className="consolidated-error">Erro: {error}</div>;
    if (!summary) return null;

    return (
        <div className="consolidated-overview">
            {/* Header + seletor */}
            <div className="consolidated-header">
                <div className="consolidated-header-row">
                    <h2>Visão Consolidada</h2>
                    {onBackToDashboard && (
                        <button
                            className="fh-btn fh-btn-secondary"
                            onClick={onBackToDashboard}
                            title="Voltar ao dashboard"
                        >
                            ← Voltar
                        </button>
                    )}
                </div>
                <p className="consolidated-tooltip">
                    Representa os valores efetivamente recebidos e pagos registrados no FinHawk.
                    Não representa patrimônio total.
                </p>
                <div className="consolidated-selector-row">
                    <span className="consolidated-selector-label">Contas exibidas</span>
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
                <div className="consolidated-metrics-grid">
                    {billsLoading ? (
                        <div className="consolidated-metrics-loading">Calculando métricas...</div>
                    ) : (
                        <>
                            <div className="consol-metric-card">
                                <div className="consol-metric-label">Receitas</div>
                                <div className="consol-metric-value" style={{ color: 'var(--green)' }}>
                                    {formatCurrency(receitas)}
                                </div>
                                {deltaReceitas !== null && (
                                    <div className={`consol-metric-delta ${deltaReceitas >= 0 ? 'delta-up' : 'delta-down'}`}>
                                        {deltaReceitas >= 0 ? '▲' : '▼'} {Math.abs(deltaReceitas).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                            <div className="consol-metric-card">
                                <div className="consol-metric-label">Despesas</div>
                                <div className="consol-metric-value" style={{ color: 'var(--red)' }}>
                                    {formatCurrency(despesas)}
                                </div>
                                {deltaDespesas !== null && (
                                    <div className={`consol-metric-delta ${deltaDespesas >= 0 ? 'delta-up' : 'delta-down'}`}>
                                        {deltaDespesas >= 0 ? '▲' : '▼'} {Math.abs(deltaDespesas).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                            <div className="consol-metric-card">
                                <div className="consol-metric-label">Pendente do Mês</div>
                                <div className="consol-metric-value" style={{ color: 'var(--amber)' }}>
                                    {formatCurrency(pendenteMes)}
                                </div>
                            </div>
                            <div className="consol-metric-card">
                                <div className="consol-metric-label">Resultado Realizado</div>
                                <div className="consol-metric-value" style={{ color: saldoRealizado >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {formatCurrency(saldoRealizado)}
                                </div>
                                {deltaResultado !== null && (
                                    <div className={`consol-metric-delta ${deltaResultado >= 0 ? 'delta-up' : 'delta-down'}`}>
                                        {deltaResultado >= 0 ? '▲' : '▼'} {Math.abs(deltaResultado).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                            <div className="consol-metric-card">
                                <div className="consol-metric-label">Saldo Acumulado</div>
                                <div className="consol-metric-value" style={{ color: saldoAcumulado >= 0 ? 'var(--green)' : 'var(--red)' }}>
                                    {formatCurrency(saldoAcumulado)}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Saldo total — apenas 1 conta selecionada */}
            {!showConsolidated && (
                <div className="consolidated-main-card">
                    <div className="consolidated-value">{formatCurrency(totals.patrimonio)}</div>
                    <div className="consolidated-accounts">
                        {selectedIds.length} conta{selectedIds.length !== 1 ? 's' : ''} selecionada{selectedIds.length !== 1 ? 's' : ''}
                    </div>
                </div>
            )}

            {/* C2 — Gráfico "Impacto por conta" (≥ 2 contas) */}
            {showConsolidated && impactData.length >= 2 && (
                <div className="fh-card">
                    <div className="fh-card-header">
                        <span className="fh-card-title">Impacto por conta (mês atual)</span>
                        <span
                            className="metric-info"
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
                                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text)' }}
                                formatter={(v) => [formatCurrency(v), 'Resultado']}
                            />
                            <Bar dataKey="resultado" radius={[0, 4, 4, 0]}>
                                {impactData.map((entry, i) => (
                                    <Cell key={i} fill={entry.resultado >= 0 ? 'var(--green)' : 'var(--red)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* C3 — Evolução anual consolidada (≥ 2 contas, dados carregados) */}
            {showConsolidated && !billsLoading && allBills.length > 0 && (
                <AnnualChart monthData={monthData} />
            )}

            {/* Detalhes por conta */}
            <div className="consolidated-list">
                <h3>Detalhes por Conta</h3>
                {summary.accounts && summary.accounts.length > 0 ? (
                    summary.accounts
                        .filter(acc => selectedIds.includes(acc.accountId))
                        .map(acc => (
                            <div key={acc.accountId} className="consolidated-account-card">
                                <div className="consolidated-account-main">
                                    <div>
                                        <div className="acc-name">{acc.name}</div>
                                        <div className="acc-values">
                                            <div className="acc-item">Receitas: <strong>{formatCurrency(acc.receitasRealizadas)}</strong></div>
                                            <div className="acc-item">Despesas: <strong>{formatCurrency(acc.despesasRealizadas)}</strong></div>
                                            <div className="acc-item">Saldo: <strong>{formatCurrency(acc.saldoRealizado)}</strong></div>
                                        </div>
                                    </div>
                                    <button
                                        className="fh-btn fh-btn-secondary fh-btn-sm"
                                        onClick={() => onSelectAccount(acc.accountId)}
                                        title="Abrir dashboard desta conta"
                                    >
                                        Abrir →
                                    </button>
                                </div>
                            </div>
                        ))
                ) : (
                    <div>Nenhuma conta selecionada.</div>
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
