import React, { useEffect, useState, useCallback } from 'react';
import { FaClock, FaExclamationTriangle, FaFilter } from 'react-icons/fa';
import './contasRecebidas.css';

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

    return (
        <div className='cadastro-titulo-vertical'>
            <div className='historico-container'>

                <div className='titulo-relatorio-header'>
                    <FaExclamationTriangle size={30} color="#ef4444" />
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
                                <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                            ))}
                        </select>
                    </div>
                </div>

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
                                                <span className="badge-status status-recebidos">
                                                    <FaClock /> Recebido
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#666' }}>
                                            Nenhuma conta recebida encontrada para este período.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        <div className="totalizador-relatorio color-saida">
                            <span>Total Recebido</span>
                            <strong>{formatCurrency(totalValor)}</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContasRecebidas;