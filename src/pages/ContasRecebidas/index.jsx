import React, { useEffect, useState, useCallback } from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { api } from '../../services/api';

const ContasRecebidas = () => {
    const [dados, setDados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Busca os Títulos (Bills) - Rota que já está funcionando
    const fetchDados = useCallback(async () => {
        const idConta = localStorage.getItem('accountId');

        if (!idConta || idConta === "null") {
            setError("ID da conta não encontrado. Verifique se há uma conta selecionada.");
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/bill/account/${idConta}`);

            if (!response.ok) {
                throw new Error(`Erro ao buscar lançamentos (${response.status})`);
            }

            const data = await response.json();

            // Filtro rigoroso: Apenas contas do tipo RECEBIMENTOS que estão RECEBIDOS
            const recebidos = data.filter(item =>
                item.category?.type?.toLowerCase() === 'receipt' &&
                item.status === 'RECEIVED'
            );

            setDados(recebidos);
            setError(null);
        } catch (err) {
            console.error("Erro Fetch Dados:", err);
            setError("Falha ao carregar a lista de contas recebidas.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Busca as Categorias - Ajustada para ser mais resiliente
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

    // Inicialização
    useEffect(() => {
        fetchDados();
        fetchCategorias();
    }, [fetchDados, fetchCategorias]);

    const parseLocalDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    // 3. Lógica de Filtro em tela
    const filteredData = dados.filter((item) => {
        const itemVenc = parseLocalDate(item.maturity);
        const startDate = filterStartDate ? parseLocalDate(filterStartDate) : null;
        const endDate = filterEndDate ? parseLocalDate(filterEndDate) : null;

        const dateMatch = (!startDate || itemVenc >= startDate) && (!endDate || itemVenc <= endDate);
        const catMatch = !filterCategoria || item.category?.name === filterCategoria;

        return dateMatch && catMatch;
    });

    const totalValor = filteredData.reduce((acc, item) => acc + Number(item.installmentAmount), 0);

    // Formatação de Moeda
    const formatCurrency = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    const handleExportPDF = async () => {
        const input = document.getElementById('relatorio-export');
        if (!input) return;
        
        try {
            const canvas = await html2canvas(input, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save('relatorio_contas_recebidas.pdf');
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
        a.download = `relatorio_contas_recebidas_${idConta}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className='cadastro-titulo-vertical'>
            <div className='historico-container'>

                <div className='titulo-relatorio-header'>
                    <FaExclamationTriangle size={30} style={{ color: 'var(--red)' }} />
                    <h2 className="historico-titulo">Relatório de Contas Recebidas</h2>
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
                            {categorias.map(cat => (
                                <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grupo-campo report-actions">
                        <button
                            onClick={handleExportPDF} 
                            className="btn-export-pdf"
                        >
                            📄 Exportar PDF
                        </button>
                        <button
                            onClick={handleExportCSV}
                            className="btn-export-csv"
                        >
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
                        <div className="empty-state-icon">📥</div>
                        <h3>Nenhum recebimento realizado ainda</h3>
                        <p>Os recebimentos confirmados aparecerão aqui assim que forem marcados como recebidos.</p>
                    </div>
                ) : (
                    <div className="tabela-responsiva">
                        <table className="tabela-titulos">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Descrição</th>
                                    <th>Vencimento</th>
                                    <th>Categoria</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.length > 0 ? (
                                    filteredData.map((item) => (
                                        <tr key={item.id}>
                                            <td data-label="ID">#{item.id}</td>
                                            <td data-label="Descrição">{item.description}</td>
                                            <td data-label="Vencimento">{parseLocalDate(item.maturity).toLocaleDateString('pt-BR')}</td>
                                            <td data-label="Categoria">{item.category?.name || '-'}</td>
                                            <td data-label="Valor" className="valor-entrada">
                                                {formatCurrency(item.installmentAmount)}
                                            </td>
                                            <td data-label="Status">
                                                <span className="badge-status status-recebidos">
                                                    <FaClock /> Recebido
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table-cell">
                                            Nenhum resultado para os filtros selecionados.{' '}
                                            <button className="btn-link" onClick={handleClearFilters}>Limpar filtros</button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="totalizador-relatorio color-entrada">
                            <span>Total Recebido</span>
                            <strong>{formatCurrency(totalValor)}</strong>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default ContasRecebidas;
