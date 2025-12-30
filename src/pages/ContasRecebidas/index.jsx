import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaFilter, FaCashRegister } from 'react-icons/fa';
import './contasRecebidas.css'; // O CSS será unificado abaixo

const ContasRecebidas = () => {
    const [dados, setDados] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [filterCategoria, setFilterCategoria] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDados = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const idConta = localStorage.getItem('id');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/account/${idConta}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erro ao buscar dados');

            const data = await response.json();
            // Filtra por Recebimento e Status Recebido
            const filtrados = data.filter(item =>
                item.category?.type?.toLowerCase() === 'receipt' &&
                item.status === 'RECEIVED'
            );
            setDados(filtrados);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategorias = async () => {
        const token = localStorage.getItem('token');
        const idConta = localStorage.getItem('id');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/categorias/tipo?tipo=Recebimento&contaId=${idConta}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setCategorias(await response.json());
    };

    useEffect(() => {
        fetchDados();
        fetchCategorias();
    }, []);

    const filteredData = dados.filter((item) => {
        const itemVenc = new Date(item.maturity);
        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        const endDate = filterEndDate ? new Date(filterEndDate) : null;
        const catMatch = !filterCategoria || item.category?.name === filterCategoria;
        const dateMatch = (!startDate || itemVenc >= startDate) && (!endDate || itemVenc <= endDate);
        return dateMatch && catMatch;
    });

    const totalValor = filteredData.reduce((acc, item) => acc + Number(item.installmentAmount), 0);

    return (
        <div className='cadastro-titulo-vertical'>
            <div className='historico-container'>
                <div className='titulo-relatorio-header'>
                    <FaCashRegister size={30} color="var(--primary)" />
                    <h2 className="historico-titulo">Relatório de Contas Recebidas</h2>
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

                {loading ? <div className="loading-container">Carregando...</div> : (
                    <div className="tabela-responsiva">
                        <table className="tabela-titulos">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Descrição</th>
                                    <th>Vencimento</th>
                                    <th>Categoria</th>
                                    <th>Valor (R$)</th>
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
                                        <td data-label="Valor" className="valor-entrada">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.installmentAmount)}</td>
                                        <td data-label="Status"><span className="badge-status status-pago"><FaCheckCircle /> Recebido</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div className="totalizador-relatorio color-entrada">
                            <span>Total Recebido</span>
                            <strong>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}</strong>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContasRecebidas;