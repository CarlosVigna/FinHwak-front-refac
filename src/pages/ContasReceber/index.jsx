import React, { useEffect, useState } from 'react';
import { FaClock, FaFilter, FaFileInvoiceDollar } from 'react-icons/fa';
import './contasReceber.css';

const ContasReceber = () => {
    const [dados, setDados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [sortOrder, setSortOrder] = useState('asc');
    const [loading, setLoading] = useState(true);

    const fetchDados = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const idConta = localStorage.getItem('id'); // Verifique se no seu sistema é 'id' ou 'accountId'

            if (!token || !idConta) {
                setError('Sessão expirada. Faça login novamente.');
                return;
            }

            // Usando a rota de "bills" que você enviou na segunda classe
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/account/${idConta}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) throw new Error('Erro ao buscar lançamentos');

            const data = await response.json();

            // Filtrando apenas RECEBIMENTOS (receipt) que estão PENDENTES
            const pendentes = data.filter(item =>
                item.category?.type?.toLowerCase() === 'receipt' &&
                item.status === 'PENDING'
            );

            setDados(pendentes);
            setError(null);
        } catch (error) {
            console.error('Erro:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategorias = async () => {
        try {
            const token = localStorage.getItem('token');
            const idConta = localStorage.getItem('id');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/categorias/tipo?tipo=Recebimento&contaId=${idConta}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setCategorias(data);
            }
        } catch (err) { console.error("Erro categorias:", err); }
    };

    useEffect(() => {
        fetchDados();
        fetchCategorias();
    }, []);

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
    };

    // Filtros de tela
    const filteredData = dados.filter((item) => {
        const itemVenc = new Date(item.maturity);
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        const endDate = filterEndDate ? new Date(filterEndDate) : null;

        const categoriaMatch = !filterCategoria || item.category?.name === filterCategoria;
        const dateMatch = (!startDate || itemVenc >= startDate) && (!endDate || itemVenc <= endDate);

        return dateMatch && categoriaMatch;
    });

    const totalValor = filteredData.reduce((total, item) => total + Number(item.installmentAmount), 0);

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
    };

    return (
        <div className='cadastro-titulo-vertical'> {/* Reutilizando container pai do cadastro */}
            <div className='historico-container'>
                <div className='titulo-relatorio-header'>
                    <FaFileInvoiceDollar size={30} color="var(--primary)" />
                    <h2 className="historico-titulo">Relatório de Contas à Receber</h2>
                </div>

                <div className='container-filtro-moderno'>
                    <div className="grupo-campo">
                        <label>Data Inicial</label>
                        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} />
                    </div>
                    <div className="grupo-campo">
                        <label>Data Final</label>
                        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} />
                    </div>
                    <div className="grupo-campo">
                        <label>Categoria</label>
                        <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)}>
                            <option value="">Todas</option>
                            {categorias.map(cat => <option key={cat.id} value={cat.nome}>{cat.nome}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">⏳ Carregando lançamentos...</div>
                ) : (
                    <div className="tabela-responsiva">
                        <div className="info-geracao">
                            <span><strong>Período:</strong> {filterStartDate || '...'} até {filterEndDate || '...'}</span>
                            <span><strong>Gerado em:</strong> {new Date().toLocaleString('pt-BR')}</span>
                        </div>

                        <table className="tabela-titulos">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort('id')}>ID</th>
                                    <th onClick={() => handleSort('description')}>Descrição</th>
                                    <th onClick={() => handleSort('maturity')}>Vencimento</th>
                                    <th onClick={() => handleSort('category')}>Categoria</th>
                                    <th onClick={() => handleSort('installmentAmount')}>Valor (R$)</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((item) => (
                                    <tr key={item.id}>
                                        <td data-label="ID">#{item.id}</td>
                                        <td data-label="Descrição">{item.description}</td>
                                        <td data-label="Vencimento">{new Date(item.maturity).toLocaleDateString('pt-BR')}</td>
                                        <td data-label="Categoria">{item.category?.name}</td>
                                        <td data-label="Valor" className="valor-entrada">
                                            {formatarMoeda(item.installmentAmount)}
                                        </td>
                                        <td data-label="Status">
                                            <span className="badge-status status-pendente">
                                                <FaClock /> Pendente
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="totalizador-relatorio">
                            <span>Total à Receber no Período</span>
                            <strong>{formatarMoeda(totalValor)}</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContasReceber;