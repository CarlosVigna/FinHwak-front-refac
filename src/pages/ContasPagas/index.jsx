import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { generateReportPDF, formatPeriodLabel } from '../../utils/pdfExport';
import { api } from '../../services/api';

const ContasPagas = () => {
    const [dados, setDados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [closedSections, setClosedSections] = useState(new Set());

    const fetchDados = useCallback(async () => {
        const idConta = localStorage.getItem('accountId');
        if (!idConta || idConta === "null") {
            setError("ID da conta não encontrado. Verifique se há uma conta selecionada.");
            return;
        }
        setLoading(true);
        try {
            const response = await api.get(`/bill/account/${idConta}`);
            if (!response.ok) throw new Error(`Erro ao buscar lançamentos (${response.status})`);
            const data = await response.json();
            const pagas = data.filter(item =>
                item.category?.type?.toLowerCase() === 'payment' &&
                item.status === 'PAID'
            );
            setDados(pagas);
            setError(null);
        } catch (err) {
            console.error("Erro Fetch Dados:", err);
            setError("Falha ao carregar a lista de contas pagas.");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchCategorias = useCallback(async () => {
        const idConta = localStorage.getItem('accountId');
        if (!idConta || idConta === "null") return;
        try {
            const response = await api.get(`/category/account/${idConta}`);
            if (response.ok) {
                const data = await response.json();
                setCategorias(data);
            }
        } catch (err) {
            console.error("Erro Fetch Categorias:", err);
        }
    }, []);

    useEffect(() => {
        fetchDados();
        fetchCategorias();
    }, [fetchDados, fetchCategorias]);

    const parseLocalDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const filteredData = dados.filter((item) => {
        const itemVenc = parseLocalDate(item.maturity);
        const startDate = filterStartDate ? parseLocalDate(filterStartDate) : null;
        const endDate = filterEndDate ? parseLocalDate(filterEndDate) : null;
        const dateMatch = (!startDate || itemVenc >= startDate) && (!endDate || itemVenc <= endDate);
        const catMatch = !filterCategoria || item.category?.name === filterCategoria;
        return dateMatch && catMatch;
    });

    const groupedData = useMemo(() => {
        const groups = {};
        filteredData.forEach(item => {
            const cat = item.category?.name || 'Sem categoria';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(item);
        });
        return groups;
    }, [filteredData]);

    const totalValor = filteredData.reduce((acc, item) => acc + Number(item.installmentAmount), 0);

    const toggleSection = (catName) => {
        setClosedSections(prev => {
            const next = new Set(prev);
            if (next.has(catName)) next.delete(catName);
            else next.add(catName);
            return next;
        });
    };

    const formatCurrency = (valor) =>
        new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

    const handleExportPDF = async () => {
        const accountId   = localStorage.getItem('accountId');
        const accountName = localStorage.getItem('accountName') || '';
        const statusLabel = { PENDING: 'Pendente', PAID: 'Pago', RECEIVED: 'Recebido' };
        const total = filteredData.reduce((s, item) => s + (Number(item.installmentAmount) || 0), 0);
        try {
            await generateReportPDF({
                title: 'Pagamentos Realizados',
                accountName,
                fileName: `relatorio_contas_pagas_${accountId}.pdf`,
                headers: ['ID', 'Descrição', 'Vencimento', 'Categoria', 'Valor', 'Status'],
                rows: filteredData.map(item => [
                    item.id,
                    item.description,
                    item.maturity ? new Date(item.maturity).toLocaleDateString('pt-BR') : '-',
                    item.category?.name || '-',
                    formatCurrency(item.installmentAmount),
                    statusLabel[item.status] || item.status,
                ]),
                totalLabel: 'Total Pago',
                totalValue: formatCurrency(total),
                period: formatPeriodLabel(filterStartDate, filterEndDate),
            });
        } catch (err) {
            console.error('Erro ao exportar PDF:', err);
            setError('Não foi possível gerar o PDF do relatório.');
        }
    };

    const handleClearFilters = () => {
        setFilterStartDate('');
        setFilterEndDate('');
        setFilterCategoria('');
    };

    const handleExportCSV = () => {
        const idConta = localStorage.getItem('accountId');
        const statusLabel = { PENDING: 'Pendente', PAID: 'Pago', RECEIVED: 'Recebido' };
        const headers = ['ID', 'Descrição', 'Vencimento', 'Categoria', 'Valor', 'Status'];
        const rows = filteredData.map(item => [
            item.id,
            item.description,
            new Date(item.maturity).toLocaleDateString('pt-BR'),
            item.category?.name || '-',
            Number(item.installmentAmount).toFixed(2).replace('.', ','),
            statusLabel[item.status] || item.status
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
            .join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio_contas_pagas_${idConta}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className='cadastro-titulo-vertical'>
            <div className='historico-container'>

                <div className='titulo-relatorio-header'>
                    <div>
                        <h1 className="fh-title"><span>Relatório de Contas Pagas</span></h1>
                    </div>
                </div>

                <div className='container-filtro-moderno'>
                    <div className="grupo-campo">
                        <label>Data Inicial</label>
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div className="grupo-campo">
                        <label>Data Final</label>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>
                    <div className="grupo-campo">
                        <label>Categoria</label>
                        <select
                            value={filterCategoria}
                            onChange={(e) => setFilterCategoria(e.target.value)}
                        >
                            <option value="">Todas as Categorias</option>
                            {categorias
                                .filter(c => c.type?.toLowerCase() === 'payment')
                                .map(cat => (
                                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                                ))}
                        </select>
                    </div>
                    <div className="grupo-campo report-actions">
                        <button onClick={handleExportPDF} className="fh-btn fh-btn-primary">
                            📄 Exportar PDF
                        </button>
                        <button onClick={handleExportCSV} className="fh-btn fh-btn-secondary">
                            📊 Exportar CSV
                        </button>
                    </div>
                </div>

                <div id="relatorio-export">
                    {error && <div className="mensagem-erro-relatorio">{error}</div>}

                    {loading ? (
                        <div className="loading-placeholder">⏳ Carregando dados do servidor...</div>
                    ) : dados.length === 0 ? (
                        <div className="empty-state">
                            <div className="empty-state-icon">📑</div>
                            <h3>Nenhum pagamento realizado ainda</h3>
                            <p>Os pagamentos confirmados aparecerão aqui assim que forem marcados como pagos.</p>
                        </div>
                    ) : filteredData.length === 0 ? (
                        <p className="empty-table-cell">
                            Nenhum resultado para os filtros selecionados.{' '}
                            <button className="btn-link" onClick={handleClearFilters}>Limpar filtros</button>
                        </p>
                    ) : (
                        <div className="tabela-responsiva">
                            {Object.entries(groupedData).map(([catName, items]) => {
                                const isOpen = !closedSections.has(catName);
                                const catTotal = items.reduce((acc, i) => acc + Number(i.installmentAmount), 0);
                                return (
                                    <div key={catName} className="accordion-section">
                                        <button
                                            type="button"
                                            className={`accordion-header${isOpen ? ' open' : ''}`}
                                            onClick={() => toggleSection(catName)}
                                        >
                                            <span className="accordion-chevron">{isOpen ? '▼' : '▶'}</span>
                                            <span className="accordion-cat-name">{catName}</span>
                                            <span className="accordion-cat-meta">
                                                {items.length} {items.length === 1 ? 'item' : 'itens'} · {formatCurrency(catTotal)}
                                            </span>
                                        </button>
                                        {isOpen && (
                                            <div className="accordion-body">
                                                <div className="tabela-responsiva">
                                                    <table className="tabela-titulos">
                                                        <thead>
                                                            <tr>
                                                                <th>ID</th>
                                                                <th>Descrição</th>
                                                                <th>Vencimento</th>
                                                                <th>Valor</th>
                                                                <th>Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {items.map((item) => (
                                                                <tr key={item.id}>
                                                                    <td data-label="ID">#{item.id}</td>
                                                                    <td data-label="Descrição">{item.description}</td>
                                                                    <td data-label="Vencimento">{parseLocalDate(item.maturity).toLocaleDateString('pt-BR')}</td>
                                                                    <td data-label="Valor" className="valor-saida">
                                                                        {formatCurrency(item.installmentAmount)}
                                                                    </td>
                                                                    <td data-label="Status">
                                                                        <span className="badge-status status-pago">
                                                                            <FaCheckCircle /> Pago
                                                                        </span>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            <div className="totalizador-relatorio color-saida">
                                <span>Total Pago</span>
                                <strong>{formatCurrency(totalValor)}</strong>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContasPagas;
