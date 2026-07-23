import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaClock, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { generateReportPDF, formatPeriodLabel } from '../../utils/pdfExport';
import { api } from '../../services/api';
import Button from '../../componentes/ui/Button';
import Input from '../../componentes/ui/Input';
import Select from '../../componentes/ui/Select';
import Badge from '../../componentes/ui/Badge';
import Card from '../../componentes/ui/Card';

const ContasPagar = () => {
    const navigate = useNavigate();
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
            const pendentes = data.filter(item =>
                item.category?.type?.toLowerCase() === 'payment' &&
                item.status === 'PENDING'
            );
            setDados(pendentes);
            setError(null);
        } catch (err) {
            console.error("Erro Fetch Dados:", err);
            setError("Falha ao carregar a lista de contas a pagar.");
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
                title: 'Contas a Pagar',
                accountName,
                fileName: `relatorio_contas_pagar_${accountId}.pdf`,
                headers: ['ID', 'Descrição', 'Vencimento', 'Categoria', 'Valor', 'Status'],
                rows: filteredData.map(item => [
                    item.id,
                    item.description,
                    item.maturity ? new Date(item.maturity).toLocaleDateString('pt-BR') : '-',
                    item.category?.name || '-',
                    formatCurrency(item.installmentAmount),
                    statusLabel[item.status] || item.status,
                ]),
                totalLabel: 'Total',
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
        a.download = `relatorio_contas_pagar_${idConta}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const categoriaOptions = categorias
        .filter(c => c.type?.toLowerCase() === 'payment')
        .map(cat => ({ value: cat.name, label: cat.name }));

    return (
        <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-semibold text-text">Relatório de Contas a Pagar</h1>

            <Card className="flex flex-wrap items-end gap-4">
                <Input
                    label="Data Inicial"
                    type="date"
                    value={filterStartDate}
                    onChange={(e) => setFilterStartDate(e.target.value)}
                />
                <Input
                    label="Data Final"
                    type="date"
                    value={filterEndDate}
                    onChange={(e) => setFilterEndDate(e.target.value)}
                />
                <Select
                    label="Categoria"
                    value={filterCategoria}
                    onChange={(e) => setFilterCategoria(e.target.value)}
                    placeholder="Todas as Categorias"
                    options={categoriaOptions}
                />
                <div className="ml-auto flex gap-2">
                    <Button onClick={handleExportPDF}>📄 Exportar PDF</Button>
                    <Button variant="outline" onClick={handleExportCSV}>📊 Exportar CSV</Button>
                </div>
            </Card>

            <div>
                {error && (
                    <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
                )}

                {loading ? (
                    <p className="text-sm text-muted2">⏳ Carregando dados do servidor...</p>
                ) : dados.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
                        <div className="text-4xl">📋</div>
                        <h3 className="text-lg font-semibold text-text">Nenhum pagamento pendente</h3>
                        <p className="text-sm text-muted2">Registre lançamentos do tipo pagamento para acompanhá-los aqui.</p>
                        <Button onClick={() => navigate('/cadastroTitulo')}>+ Registrar Lançamento</Button>
                    </div>
                ) : filteredData.length === 0 ? (
                    <p className="text-sm text-muted2">
                        Nenhum resultado para os filtros selecionados.{' '}
                        <button className="text-primary hover:underline" onClick={handleClearFilters}>Limpar filtros</button>
                    </p>
                ) : (
                    <div className="flex flex-col gap-3">
                        {Object.entries(groupedData).map(([catName, items]) => {
                            const isOpen = !closedSections.has(catName);
                            const catTotal = items.reduce((acc, i) => acc + Number(i.installmentAmount), 0);
                            return (
                                <div key={catName} className="overflow-hidden rounded-lg border border-border">
                                    <button
                                        type="button"
                                        onClick={() => toggleSection(catName)}
                                        className="flex w-full items-center gap-2 bg-surface2 px-4 py-3 text-left"
                                    >
                                        {isOpen ? <FaChevronDown className="text-muted2" /> : <FaChevronRight className="text-muted2" />}
                                        <span className="flex-1 font-medium text-text">{catName}</span>
                                        <span className="text-sm text-muted2">
                                            {items.length} {items.length === 1 ? 'item' : 'itens'} · {formatCurrency(catTotal)}
                                        </span>
                                    </button>
                                    {isOpen && (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead className="bg-surface2/50 text-muted2">
                                                    <tr>
                                                        <th className="px-4 py-2 font-medium">ID</th>
                                                        <th className="px-4 py-2 font-medium">Descrição</th>
                                                        <th className="px-4 py-2 font-medium">Vencimento</th>
                                                        <th className="px-4 py-2 font-medium">Valor</th>
                                                        <th className="px-4 py-2 font-medium">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {items.map((item) => (
                                                        <tr key={item.id} className="border-t border-border">
                                                            <td className="px-4 py-2 text-muted2">#{item.id}</td>
                                                            <td className="px-4 py-2 text-text">{item.description}</td>
                                                            <td className="px-4 py-2 text-text">{parseLocalDate(item.maturity).toLocaleDateString('pt-BR')}</td>
                                                            <td className="px-4 py-2 font-medium text-danger">
                                                                {formatCurrency(item.installmentAmount)}
                                                            </td>
                                                            <td className="px-4 py-2">
                                                                <Badge variant="warning">
                                                                    <FaClock className="mr-1 inline" /> Pendente
                                                                </Badge>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex items-center justify-between rounded-lg border border-danger/30 bg-danger/5 px-4 py-3">
                            <span className="font-medium text-text">Total em Aberto</span>
                            <strong className="text-lg text-danger">{formatCurrency(totalValor)}</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContasPagar;
