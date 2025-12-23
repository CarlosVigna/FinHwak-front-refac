import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faCalendarAlt, faInbox } from '@fortawesome/free-solid-svg-icons';
import './contasPendentes.css';

const ContasPendentes = () => {
    const [contas, setContas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchContasPendentes = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('accountId');

            if (!token) {
                throw new Error('Usuário não autenticado.');
            }

            // Fetch genericamente (similar a ListaTitulo) ou filtrado se a API suportar
            // A API existente parece buscar tudo e filtrar no front em alguns casos, 
            // mas ListaTitulo usa /bill?accountId=...
            let url = `${import.meta.env.VITE_API_URL}/bill`;
            if (accountId) {
                url += `?accountId=${accountId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Status da resposta:', response.status);

            if (!response.ok) {
                throw new Error('Falha ao carregar contas pendentes.');
            }

            const data = await response.json();
            console.log('Dados brutos recebidos:', data);

            // Filtrar apenas: Pagamentos (Type=PAYMENT ou Payment) E Pendentes (Status=PENDING)
            const pendentes = data.filter(item => {
                const type = item.category?.type || item.type;
                const status = item.status;

                console.log(`Item ID ${item.id} - Tipo: ${type}, Status: ${status}`);

                const isPayment = type?.toUpperCase() === 'PAYMENT';
                const isPending = status?.toUpperCase() === 'PENDING';
                return isPayment && isPending;
            });

            console.log('Dados filtrados (Pendentes):', pendentes);

            // Ordenar por vencimento (mais recentes/atrasadas primeiro)
            pendentes.sort((a, b) => new Date(a.maturity) - new Date(b.maturity));

            setContas(pendentes);
            setError(null);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContasPendentes();
    }, []);

    const handleDarBaixa = async (conta) => {
        if (!window.confirm(`Confirma o pagamento de "${conta.description}"? \nValor: ${formatCurrency(conta.installmentAmount || conta.value)}`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('accountId');

            // Construir payload completo conforme FormularioTransacao
            // Precisamos garantir que todos os campos obrigatórios estejam presentes.
            // A API parece exigir o objeto completo no PUT.

            const payload = {
                id: conta.id,
                description: conta.description,
                emission: conta.emission, // Assumindo formato ISO do backend
                maturity: conta.maturity,
                installmentAmount: Number(conta.installmentAmount || conta.value),
                installmentCount: Number(conta.installmentCount || 1),
                periodicity: conta.periodicity || 'MONTHLY',
                status: 'PAID', // Mudando status para PAGO
                categoryId: Number(conta.category?.id || conta.categoryId),
                accountId: Number(accountId || conta.accountId),
                type: 'PAYMENT' // Garante que mantém como pagamento
            };

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${conta.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Erro ao dar baixa na conta.');
            }

            // Sucesso: remover da lista localmente para feedback instantâneo
            setContas(prev => prev.filter(c => c.id !== conta.id));
            alert('Conta marcada como paga com sucesso!');

        } catch (err) {
            console.error(err);
            alert(`Erro: ${err.message}`);
        }
    };

    // Utilitários de Formatação
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusVencimento = (maturityDate) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const vencimento = new Date(maturityDate);
        vencimento.setHours(0, 0, 0, 0);

        if (vencimento < hoje) return { label: 'Vencida', class: 'vencida', icon: faExclamationTriangle };
        if (vencimento.getTime() === hoje.getTime()) return { label: 'Vence Hoje', class: 'hoje', icon: faCalendarAlt };
        return { label: 'Em Dia', class: 'em-dia', icon: null };
    };

    return (
        <div className="contas-pendentes-page">
            <div className="page-header">
                <h1 className="page-title">Contas Pendentes</h1>
                <p className="page-subtitle">Gerencie seus pagamentos em aberto</p>
            </div>

            <div className="tabela-card">
                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>Carregando...</div>
                ) : (
                    <div className="table-container">
                        {contas.length === 0 ? (
                            <div className="empty-state">
                                <FontAwesomeIcon icon={faInbox} />
                                <p>Nenhuma conta pendente encontrada.</p>
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Descrição</th>
                                        <th>Categoria</th>
                                        <th>Vencimento</th>
                                        <th>Valor</th>
                                        <th>Situação</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contas.map(conta => {
                                        const statusInfo = getStatusVencimento(conta.maturity);
                                        return (
                                            <tr key={conta.id}>
                                                <td>{conta.description}</td>
                                                <td>{conta.category?.name || '-'}</td>
                                                <td>{formatDate(conta.maturity)}</td>
                                                <td className={`valor ${statusInfo.class === 'vencida' ? 'vencida' : ''}`}>
                                                    {formatCurrency(conta.installmentAmount || conta.value)}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${statusInfo.class}`}>
                                                        {statusInfo.icon && <FontAwesomeIcon icon={statusInfo.icon} />}
                                                        {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-baixa"
                                                        onClick={() => handleDarBaixa(conta)}
                                                        title="Marcar como paga"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                        <span>Dar Baixa</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContasPendentes;
