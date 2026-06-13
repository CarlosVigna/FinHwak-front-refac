import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import {
    filterByMonth,
    calculateReceitas,
    calculateDespesas,
    calculateSaldoRealizado,
} from '../Dashboard/utils/calculations';

const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const AccountDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [account, setAccount] = useState(null);
    const [bills, setBills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [accountResponse, billsResponse] = await Promise.all([
                    api.get(`/account/${id}`),
                    api.get(`/bill/account/${id}`),
                ]);

                if (!accountResponse.ok) {
                    throw new Error('Erro ao buscar detalhes da conta.');
                }

                const accountData = await accountResponse.json();
                setAccount(accountData);

                if (billsResponse.ok) {
                    const billsData = await billsResponse.json();
                    setBills(Array.isArray(billsData) ? billsData : []);
                }
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const formatarMoeda = (valor) =>
        Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    const formatarData = (dataISO) => {
        if (!dataISO) return '-';
        const [ano, mes, dia] = String(dataISO).split('T')[0].split('-');
        if (!ano || !mes || !dia) return String(dataISO);
        return `${dia}/${mes}/${ano}`;
    };

    const traduzirStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Pendente';
            case 'PAID': return 'Pago';
            case 'RECEIVED': return 'Recebido';
            default: return status || '-';
        }
    };

    const handleExportCSV = () => {
        const statusLabel = { PENDING: 'Pendente', PAID: 'Pago', RECEIVED: 'Recebido' };
        const headers = ['ID', 'Descrição', 'Vencimento', 'Categoria', 'Valor', 'Status'];
        const rows = bills.map(item => {
            const d = parseLocalDate(item.maturity);
            const vencimento = d ? d.toLocaleDateString('pt-BR') : '-';
            return [
                item.id,
                item.description,
                vencimento,
                item.category?.name || '-',
                Number(item.installmentAmount).toFixed(2).replace('.', ','),
                statusLabel[item.status] || item.status
            ];
        });
        const csv = [headers, ...rows]
            .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
            .join('\n');
        const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finhawk_account_${id}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const hoje = new Date();
    const billsDoMes = filterByMonth(bills, hoje.getMonth(), hoje.getFullYear());
    const receitasMes = calculateReceitas(billsDoMes);
    const despesasMes = calculateDespesas(billsDoMes);
    const saldoRealizado = calculateSaldoRealizado(billsDoMes);
    const totalPendente = bills
        .filter(b => b.status === 'PENDING')
        .reduce((sum, b) => sum + Number(b.installmentAmount || 0), 0);

    const lancamentosRecentes = [...bills]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

    const nomeMes = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

    if (loading) return <div>Carregando detalhes...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!account) return <div>Conta não encontrada.</div>;

    return (
        <div className="account-details-container">
            <div className="header-details">
                <h1>Detalhes da Conta</h1>
                <div className="account-details-actions">
                    <button onClick={() => navigate('/contas')}>Voltar</button>
                    <button className="btn-export-csv" onClick={handleExportCSV}>
                        Exportar CSV
                    </button>
                </div>
            </div>

            <div className="card-detalhe">
                {account.photoUrl && (
                    <img
                        src={account.photoUrl}
                        alt="Foto da conta"
                        className="account-photo"
                    />
                )}
                <h2>{account.name}</h2>
                <p><strong>ID da Conta:</strong> {account.id}</p>
            </div>

            <div className="metricas-mes">
                <h3>Resumo de {nomeMes}</h3>
                <div className="metricas-cards">
                    <div className="metrica-card metrica-receita">
                        <span className="metrica-label">Receitas</span>
                        <span className="metrica-valor">{formatarMoeda(receitasMes)}</span>
                    </div>
                    <div className="metrica-card metrica-despesa">
                        <span className="metrica-label">Despesas</span>
                        <span className="metrica-valor">{formatarMoeda(despesasMes)}</span>
                    </div>
                    <div className={`metrica-card metrica-saldo ${saldoRealizado >= 0 ? 'positivo' : 'negativo'}`}>
                        <span className="metrica-label">Saldo Realizado</span>
                        <span className="metrica-valor">{formatarMoeda(saldoRealizado)}</span>
                    </div>
                    <div className="metrica-card metrica-pendente">
                        <span className="metrica-label">Total Pendente</span>
                        <span className="metrica-valor">{formatarMoeda(totalPendente)}</span>
                    </div>
                </div>
            </div>

            <div className="lancamentos-recentes">
                <h3>Últimos Lançamentos</h3>
                {lancamentosRecentes.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📝</div>
                        <h3>Nenhum lançamento ainda</h3>
                        <p>Registre receitas e despesas para acompanhar esta conta.</p>
                        <div className="empty-state-actions">
                            <button
                                className="botao-nova-conta"
                                onClick={() => {
                                    localStorage.setItem('accountId', String(id));
                                    navigate('/cadastroTitulo');
                                }}
                            >
                                + Criar Lançamento
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="tabela-responsiva">
                        <table className="tabela-recentes">
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Categoria</th>
                                    <th>Vencimento</th>
                                    <th>Valor</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lancamentosRecentes.map(bill => {
                                    const isDespesa = bill.category?.type?.toUpperCase() === 'PAYMENT';
                                    return (
                                        <tr key={bill.id}>
                                            <td>{bill.description}</td>
                                            <td>{bill.category?.name || '-'}</td>
                                            <td>{formatarData(bill.maturity)}</td>
                                            <td className={isDespesa ? 'valor-saida' : 'valor-entrada'}>
                                                {formatarMoeda(bill.installmentAmount || 0)}
                                            </td>
                                            <td>{traduzirStatus(bill.status)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AccountDetails;
