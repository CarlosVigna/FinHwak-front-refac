import { useEffect, useState, useRef } from 'react';
import { api } from '../../../services/api';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/formatters';

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
        <div className="account-multiselect" ref={ref}>
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

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                setLoading(true);
                const response = await api.get('/bill/dashboard/consolidated');
                if (!response.ok) {
                    const text = await response.text();
                    throw new Error(text || 'Falha ao carregar resumo consolidado.');
                }
                const data = await response.json();
                setSummary(data);
                if (data.accounts) {
                    setSelectedIds(data.accounts.map(acc => acc.accountId));
                }
                setError(null);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    // TODO: mover cálculo para backend se performance exigir
    const calculateTotals = () => {
        if (!summary?.accounts) return { patrimonio: 0, receitas: 0, despesas: 0 };
        const filtered = summary.accounts.filter(acc => selectedIds.includes(acc.accountId));
        return {
            patrimonio: filtered.reduce((sum, acc) => sum + (acc.saldoRealizado || 0), 0),
            receitas:   filtered.reduce((sum, acc) => sum + (acc.receitasRealizadas || 0), 0),
            despesas:   filtered.reduce((sum, acc) => sum + (acc.despesasRealizadas || 0), 0),
        };
    };

    if (loading) return <div className="consolidated-loading">Carregando resumo consolidado...</div>;
    if (error)   return <div className="consolidated-error">Erro: {error}</div>;
    if (!summary) return null;

    const totals = calculateTotals();
    const showImpact = selectedIds.length >= 2;

    return (
        <div className="consolidated-overview">
            <div className="consolidated-header">
                <div className="consolidated-header-row">
                    <h2>Visão Consolidada</h2>
                    {onBackToDashboard && (
                        <button
                            className="btn-back-dashboard"
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

            {/* ── Impacto Consolidado (≥ 2 contas) ── */}
            {showImpact && (
                <div className="fh-card consolidated-impact">
                    <div className="consolidated-impact-header">
                        <span className="fh-card-title">Impacto consolidado</span>
                        <span
                            className="metric-info"
                            title="Soma de receitas, despesas e saldo de todas as contas selecionadas."
                        >ⓘ</span>
                    </div>
                    <div className="consolidated-grid">
                        <div className="consolidated-item">
                            <span className="consolidated-label">Receitas realizadas</span>
                            <span
                                className="consolidated-value"
                                style={{ color: 'var(--green)' }}
                            >
                                {formatCurrency(totals.receitas)}
                            </span>
                        </div>
                        <div className="consolidated-item">
                            <span className="consolidated-label">Despesas realizadas</span>
                            <span
                                className="consolidated-value"
                                style={{ color: 'var(--red)' }}
                            >
                                {formatCurrency(totals.despesas)}
                            </span>
                        </div>
                        <div className="consolidated-item">
                            <span className="consolidated-label">Saldo realizado</span>
                            <span
                                className="consolidated-value"
                                style={{ color: totals.patrimonio >= 0 ? 'var(--green)' : 'var(--red)' }}
                            >
                                {formatCurrency(totals.patrimonio)}
                            </span>
                        </div>
                        <div className="consolidated-item">
                            <span className="consolidated-label">Contas no consolidado</span>
                            <span className="consolidated-value">
                                {selectedIds.length} de {summary.accounts.length}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Saldo total (card principal) ── */}
            <div className="consolidated-main-card">
                <div className="consolidated-value">{formatCurrency(totals.patrimonio)}</div>
                <div className="consolidated-accounts">
                    {selectedIds.length} conta{selectedIds.length !== 1 ? 's' : ''} selecionada{selectedIds.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* ── Detalhes por conta ── */}
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
                                        className="btn-select-account"
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
