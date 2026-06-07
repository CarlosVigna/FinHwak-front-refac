import React, { useEffect, useState, useCallback } from 'react';
import { FaClock, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import './contasReceber.css';

const ContasReceber = () => {
    const [dados, setDados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // 1. Busca os Títulos (Bills) - Rota que já está funcionando
    const fetchDados = useCallback(async () => {
        const token = localStorage.getItem('token');
        const idConta = localStorage.getItem('accountId');

        if (!idConta || idConta === "null") {
            setError("ID da conta não encontrado. Verifique se há uma conta selecionada.");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/account/${idConta}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Erro ao buscar lançamentos (${response.status})`);
            }

            const data = await response.json();

            // Filtro rigoroso: Apenas contas do tipo RECEBIMENTOS que estão a receber
            const receber = data.filter(item =>
                item.category?.type?.toLowerCase() === 'receipt' &&
                item.status === 'PENDING'
            );

            setDados(receber);
            setError(null);
        } catch (err) {
            console.error("Erro Fetch Dados:", err);
            setError("Falha ao carregar a lista de contas a receber.");
        } finally {
            setLoading(false);
        }
    }, []);

    // 2. Busca as Categorias - Ajustada para ser mais resiliente
    const fetchCategorias = useCallback(async () => {
        const token = localStorage.getItem('token');
        const idConta = localStorage.getItem('accountId');

        if (!token || !idConta || idConta === "null") return;

        try {
            // Revisa se seu backend espera "tipo" ou "type", e "contaId" ou "accountId"
            // Tentei manter o seu padrão, mas com tratamento de erro isolado
            const response = await fetch(`${import.meta.env.VITE_API_URL}/categorias/tipo?tipo=Recebimento&contaId=${idConta}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setCategorias(data);
            } else {
                console.warn(`Aviso: Falha ao carregar categorias (${response.status}). Verifique as permissões da rota.`);
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
            pdf.save('relatorio_contas_receber.pdf');
        } catch (err) {
            console.error('Erro ao exportar PDF:', err);
            alert('Não foi possível gerar o PDF do relatório.');
        }
    };

    const handleExportCSV = async () => {
        const idConta = localStorage.getItem('accountId');
        if (!idConta) {
            alert('Nenhuma conta selecionada.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/export/account/${idConta}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const txt = await response.text();
                throw new Error(txt || 'Erro ao exportar CSV');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio_contas_receber_${idConta}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert('Erro ao exportar CSV: ' + err.message);
        }
    };

    return (
        <div className='cadastro-titulo-vertical'>
            <div className='historico-container'>

                <div className='titulo-relatorio-header'>
                    <FaExclamationTriangle size={30} color="#ef4444" />
                    <h2 className="historico-titulo">Relatório de Contas a Receber</h2>
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
                                <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grupo-campo" style={{ justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button 
                            onClick={handleExportPDF} 
                            style={{ 
                                height: '44px', flex: 1, marginTop: 'auto', 
                                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                                color: 'white', border: 'none', borderRadius: '8px',
                                fontWeight: 'bold', cursor: 'pointer', transition: '0.2s ease'
                            }}
                        >
                            📄 Exportar PDF
                        </button>
                        <button 
                            onClick={handleExportCSV} 
                            style={{ 
                                height: '44px', flex: 1, marginTop: 'auto', 
                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                color: 'white', border: 'none', borderRadius: '8px',
                                fontWeight: 'bold', cursor: 'pointer', transition: '0.2s ease'
                            }}
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
                                            <td data-label="Valor" className="valor-entrada">
                                                {formatCurrency(item.installmentAmount)}
                                            </td>
                                            <td data-label="Status">
                                                <span className="badge-status status-pendente">
                                                    <FaClock /> Pendente
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                            Nenhuma conta a receber encontrada para este período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="totalizador-relatorio color-entrada">
                            <span>Total a Receber</span>
                            <strong>{formatCurrency(totalValor)}</strong>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
};

export default ContasReceber;