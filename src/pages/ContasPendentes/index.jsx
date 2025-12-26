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

            if (!accountId) {
                throw new Error('Nenhuma conta selecionada. Volte e selecione uma conta.');
            }

            // --- CORREÇÃO AQUI ---
            // URL Correta: /bill/account/{id}
            const url = `${import.meta.env.VITE_API_URL}/bill/account/${accountId}`;
            
            console.log('🌐 Buscando contas pendentes na URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Falha ao carregar contas pendentes.');
            }

            const data = await response.json();
            
            // Filtrar apenas: Pagamentos (Type=PAYMENT) E Pendentes (Status=PENDING)
            const pendentes = data.filter(item => {
                // Tenta pegar o tipo da categoria OU do item (caso venha plano)
                const type = item.category?.type || item.type;
                const status = item.status;

                const isPayment = type?.toUpperCase() === 'PAYMENT';
                const isPending = status?.toUpperCase() === 'PENDING';
                
                return isPayment && isPending;
            });

            // Ordenar por vencimento (mais antigas/atrasadas primeiro)
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
        const valorFormatado = formatCurrency(conta.installmentAmount || conta.value);
        if (!window.confirm(`Confirma o pagamento de "${conta.description}"?\nValor: ${valorFormatado}`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('accountId');

            // Monta o payload mantendo os dados originais, apenas mudando o status
            const payload = {
                id: conta.id,
                description: conta.description,
                emission: conta.emission,
                maturity: conta.maturity,
                installmentAmount: Number(conta.installmentAmount || conta.value),
                installmentCount: Number(conta.installmentCount || 1),
                periodicity: conta.periodicity || 'MONTHLY',
                status: 'PAID', // <--- MUDANÇA DE STATUS AQUI
                categoryId: Number(conta.category?.id || conta.categoryId),
                accountId: Number(accountId), // Usa o ID da conta atual
                type: 'PAYMENT'
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

            // Sucesso: remove da lista visualmente
            setContas(prev => prev.filter(c => c.id !== conta.id));
            alert('Conta paga com sucesso!');

        } catch (err) {
            console.error(err);
            alert(`Erro: ${err.message}`);
        }
    };

    // Utilitários
    const formatCurrency = (value) => {
        if (value === undefined || value === null) return 'R$ 0,00';
        return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        // Corrige bug de fuso horário adicionando 'T12:00:00' se for só data
        const data = new Date(dateString.includes('T') ? dateString : dateString + 'T12:00:00');
        return data.toLocaleDateString('pt-BR');
    };

    const getStatusVencimento = (maturityDate) => {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        
        // Garante a conversão correta da string de data
        const dataString = maturityDate.includes('T') ? maturityDate : maturityDate + 'T12:00:00';
        const vencimento = new Date(dataString);
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
                {error && <div className="mensagem-erro">{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '2rem' }}>⏳ Carregando contas...</div>
                ) : (
                    <div className="table-container">
                        {contas.length === 0 ? (
                            <div className="empty-state">
                                <FontAwesomeIcon icon={faInbox} size="3x" style={{ marginBottom: '10px', color: '#ccc' }} />
                                <p>Tudo em dia! Nenhuma conta pendente.</p>
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
                                                        {statusInfo.icon && <FontAwesomeIcon icon={statusInfo.icon} />} {statusInfo.label}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="btn-baixa"
                                                        onClick={() => handleDarBaixa(conta)}
                                                        title="Marcar como paga"
                                                    >
                                                        <FontAwesomeIcon icon={faCheckCircle} />
                                                        <span> Pagar</span>
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