import React, { useEffect, useState, useCallback } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import './listaTitulo.css';

const ListaTitulo = ({ accountId, tipoTransacao, filtroData, onEdit, refresh }) => {
    const [titulos, setTitulos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    console.log("DEBUG: AccountID recebido:", accountId);
    console.log("DEBUG: Token:", localStorage.getItem('token'));
    // Deleta um título
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setTitulos(prev => prev.filter(titulo => titulo.id !== id));
            } else {
                alert("Erro ao excluir lançamento.");
            }
        } catch (err) {
            console.error("Erro ao excluir:", err);
        }
    }, []);

    // Busca os títulos da conta
    const fetchTitulos = useCallback(async () => {
        if (!accountId) {
            setTitulos([]);
            setError('Nenhuma conta selecionada');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Usuário não autenticado.');

            const url = `${import.meta.env.VITE_API_URL}/bill/account/${accountId}`;
            console.log('🌐 Requisição para URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erro ao buscar lançamentos');
            }

            const data = await response.json();
            setTitulos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
            console.error('❌ ERRO:', err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    // Atualiza quando accountId, refresh, tipoTransacao ou filtroData mudarem
    useEffect(() => {
        fetchTitulos();
    }, [fetchTitulos, refresh, tipoTransacao, filtroData.dataInicio, filtroData.dataFim]);

    // Funções auxiliares
    const formatarData = (dataISO) => {
        if (!dataISO) return '-';
        const [ano, mes, dia] = dataISO.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const formatarValor = (valor) => {
        const num = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
        if (isNaN(num)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const traduzirStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Pendente';
            case 'PAID': return 'Pago';
            case 'RECEIVED': return 'Recebido';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PAID':
            case 'RECEIVED': return 'status-pago';
            case 'PENDING': return 'status-pendente';
            default: return '';
        }
    };

    if (loading) return <div className="lista-titulo-container">⏳ Carregando...</div>;

    return (
        <div className="lista-titulo-container">
            {error && <div className="mensagem-erro"><FaExclamationCircle /> {error}</div>}

            {titulos.length === 0 && !error ? (
                <div className="lista-vazia">
                    <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                        📌 Conta selecionada: <strong>{accountId}</strong>
                    </p>
                </div>
            ) : (
                <div className="tabela-responsiva">
                    <table className="tabela-titulos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Vencimento</th>
                                <th>Valor</th>
                                <th>Parcela</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {titulos.map(titulo => {
                                const tipoCategoria = titulo.category?.type?.toLowerCase();
                                const isDespesa = tipoCategoria === 'payment';
                                return (
                                    <tr key={titulo.id}>
                                        <td>#{titulo.id}</td>
                                        <td>{titulo.description}</td>
                                        <td>{titulo.category?.name || '-'}</td>
                                        <td>{formatarData(titulo.maturity)}</td>
                                        <td className={isDespesa ? 'valor-saida' : 'valor-entrada'}>
                                            {formatarValor(titulo.installmentAmount)}
                                        </td>
                                        <td>{titulo.currentInstallment || 1}/{titulo.installmentCount || 1}</td>
                                        <td>
                                            <span className={`badge-status ${getStatusClass(titulo.status)}`}>
                                                {(titulo.status === 'PAID' || titulo.status === 'RECEIVED') && <FaCheckCircle />}
                                                {titulo.status === 'PENDING' && <FaClock />} {traduzirStatus(titulo.status)}
                                            </span>
                                        </td>
                                        <td className="coluna-acoes">
                                            <button className="btn-acao btn-editar" onClick={() => onEdit(titulo)} title="Editar">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-acao btn-excluir" onClick={() => handleDelete(titulo.id)} title="Excluir">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ListaTitulo;
