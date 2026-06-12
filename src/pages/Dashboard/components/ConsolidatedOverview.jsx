import { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import PropTypes from 'prop-types';
import { formatCurrency } from '../utils/formatters';

const ConsolidatedOverview = ({ onSelectAccount, onBackToDashboard }) => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedAccounts, setSelectedAccounts] = useState(new Set());
    const [selectAll, setSelectAll] = useState(true);

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
                // Initialize all accounts as selected
                if (data.accounts) {
                    setSelectedAccounts(new Set(data.accounts.map(acc => acc.accountId)));
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

    const handleAccountToggle = (accountId) => {
        const newSelected = new Set(selectedAccounts);
        if (newSelected.has(accountId)) {
            newSelected.delete(accountId);
        } else {
            newSelected.add(accountId);
        }
        setSelectedAccounts(newSelected);
        setSelectAll(newSelected.size === summary.accounts.length);
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedAccounts(new Set());
            setSelectAll(false);
        } else {
            setSelectedAccounts(new Set(summary.accounts.map(acc => acc.accountId)));
            setSelectAll(true);
        }
    };

    // Calculate totals for selected accounts
    const calculateTotals = () => {
        if (!summary || !summary.accounts) return { patrimonio: 0, receitas: 0, despesas: 0 };

        const filtered = summary.accounts.filter(acc => selectedAccounts.has(acc.accountId));
        return {
            patrimonio: filtered.reduce((sum, acc) => sum + (acc.saldoRealizado || 0), 0),
            receitas: filtered.reduce((sum, acc) => sum + (acc.receitasRealizadas || 0), 0),
            despesas: filtered.reduce((sum, acc) => sum + (acc.despesasRealizadas || 0), 0)
        };
    };

    if (loading) return <div className="consolidated-loading">Carregando resumo consolidado...</div>;
    if (error) return <div className="consolidated-error">Erro: {error}</div>;
    if (!summary) return null;

    const totals = calculateTotals();

    return (
        <div className="consolidated-overview">
            <div className="consolidated-header">
                <div className="consolidated-header-row">
                    <h2>Saldo Realizado Consolidado</h2>
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
                <p className="consolidated-tooltip">Representa os valores efetivamente recebidos e pagos registrados no FinHawk. Não representa patrimônio total.</p>
                <div className="consolidated-main-card">
                    <div className="consolidated-value">{formatCurrency(totals.patrimonio)}</div>
                    <div className="consolidated-accounts">Contas: {selectedAccounts.size}</div>
                </div>
            </div>

            <div className="consolidated-selector">
                <h3>Selecione as contas para visualizar</h3>
                <label className="select-all-checkbox">
                    <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                    />
                    <span>Todas as contas</span>
                </label>
                <div className="accounts-checkboxes">
                    {summary.accounts && summary.accounts.map(acc => (
                        <label key={acc.accountId} className="account-checkbox">
                            <input
                                type="checkbox"
                                checked={selectedAccounts.has(acc.accountId)}
                                onChange={() => handleAccountToggle(acc.accountId)}
                            />
                            <span>{acc.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="consolidated-summary">
                <h3>Resumo das Contas Selecionadas</h3>
                <div className="summary-cards">
                    <div className="summary-card">
                        <div className="summary-label">Receitas</div>
                        <div className="summary-value receitas">{formatCurrency(totals.receitas)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">Despesas</div>
                        <div className="summary-value despesas">{formatCurrency(totals.despesas)}</div>
                    </div>
                    <div className="summary-card">
                        <div className="summary-label">Saldo</div>
                        <div className={`summary-value ${totals.patrimonio >= 0 ? 'saldo-positivo' : 'saldo-negativo'}`}>
                            {formatCurrency(totals.patrimonio)}
                        </div>
                    </div>
                </div>
            </div>

            <div className="consolidated-list">
                <h3>Detalhes por Conta</h3>
                {summary.accounts && summary.accounts.length > 0 ? (
                    summary.accounts
                        .filter(acc => selectedAccounts.has(acc.accountId))
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
