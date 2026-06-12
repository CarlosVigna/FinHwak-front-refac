import React, { useEffect, useState, useCallback } from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { api } from '../../services/api';

const ContasPagas = () => {
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

            // Filtro rigoroso: Apenas contas do tipo PAGAMENTO que estão PAGOS
            const pendentes = data.filter(item =>
                item.category?.type?.toLowerCase() === 'payment' &&
                item.status === 'PAID'
            );

            setDados(pendentes);
            setError(null);
        } catch (err) {
            console.error("Erro Fetch Dados:", err);
            setError("Falha ao carregar a lista de contas pagas.");
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

    // 3. Lógica de Filtro em tela
    const filteredData = dados.filter((item) => {
        const itemVenc = new Date(item.maturity);
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        const endDate = filterEndDate ? new Date(filterEndDate) : null;

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
            pdf.save('relatorio_contas_pagas.pdf');
        } catch (err) {
            console.error('Erro ao exportar PDF:', err);
            setError('Não foi possível gerar o PDF do relatório.');
        }
    };

    const handleExportCSV = async () => {
        const idConta = localStorage.getItem('accountId');
        if (!idConta) {
            setError('Nenhuma conta selecionada.');
            return;
        }

        try {
            const response = await api.blob(`/bill/export/account/${idConta}`);

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(txt || 'Erro ao exportar CSV');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_contas_pagas_${idConta}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError('Erro ao exportar CSV: ' + err.message);
        }
    };

    return (
        <div className='cadastro-titulo-vertical'>
            <div className='historico-container'>

                <div className='titulo-relatorio-header'>
                    <FaExclamationTriangle size={30} color="#ef4444" />
                    <h2 className="historico-titulo">Relatório de Contas Pagas</h2>
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
                            className="btn-export-pdf btn-export-danger"
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
                                            <td data-label="Vencimento">{new Date(item.maturity).toLocaleDateString('pt-BR')}</td>
                                            <td data-label="Categoria">{item.category?.name || '-'}</td>
                                            <td data-label="Valor" className="valor-saida">
                                                {formatCurrency(item.installmentAmount)}
                                            </td>
                                            <td data-label="Status">
                                                <span className="badge-status status-pago">
                                                    <FaClock /> Pago
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="empty-table-cell">
                                            Nenhuma conta paga encontrada para este período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

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
