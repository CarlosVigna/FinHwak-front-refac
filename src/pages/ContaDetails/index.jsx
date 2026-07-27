import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
import {
    filterByMonth,
    calculateReceitas,
    calculateDespesas,
    calculateSaldoRealizado,
} from '../Dashboard/utils/calculations';
import Card from '../../componentes/ui/Card';
import Button from '../../componentes/ui/Button';
import Badge from '../../componentes/ui/Badge';
import Table from '../../componentes/ui/Table';

const parseLocalDate = (dateString) => {
    if (!dateString) return null;
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const STATUS_BADGE = {
    PENDING: { variant: 'warning', label: 'Pendente' },
    PAID: { variant: 'success', label: 'Pago' },
    RECEIVED: { variant: 'success', label: 'Recebido' },
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
                setError(translateError(err.message));
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

    if (loading) return <div className="p-6 text-sm text-muted2">Carregando detalhes...</div>;
    if (error) return <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>;
    if (!account) return <div className="p-6 text-sm text-muted2">Conta não encontrada.</div>;

    const columns = [
        { header: 'Descrição', render: (b) => b.description },
        { header: 'Categoria', render: (b) => b.category?.name || '-' },
        { header: 'Vencimento', render: (b) => formatarData(b.maturity) },
        {
            header: 'Valor',
            render: (b) => {
                const isDespesa = b.category?.type?.toUpperCase() === 'PAYMENT';
                return (
                    <span className={isDespesa ? 'text-danger' : 'text-success'}>
                        {formatarMoeda(b.installmentAmount || 0)}
                    </span>
                );
            },
        },
        {
            header: 'Status',
            render: (b) => {
                const cfg = STATUS_BADGE[b.status] || { variant: 'neutral', label: b.status || '-' };
                return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
            },
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold text-text">Detalhes da Conta</h1>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => navigate('/contas')}>Voltar</Button>
                    <Button variant="outline" onClick={handleExportCSV}>Exportar CSV</Button>
                </div>
            </div>

            <Card className="flex items-center gap-4">
                {account.photoUrl && (
                    <img
                        src={account.photoUrl}
                        alt="Foto da conta"
                        className="h-14 w-14 rounded-md object-cover"
                    />
                )}
                <div>
                    <h2 className="text-lg font-semibold text-text">{account.name}</h2>
                    <p className="text-sm text-muted2"><strong className="text-text">ID da Conta:</strong> {account.id}</p>
                </div>
            </Card>

            <div>
                <h3 className="mb-3 text-lg font-semibold capitalize text-text">Resumo de {nomeMes}</h3>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <Card>
                        <span className="text-xs text-muted">Receitas</span>
                        <p className="mt-1 text-xl font-semibold text-success">{formatarMoeda(receitasMes)}</p>
                    </Card>
                    <Card>
                        <span className="text-xs text-muted">Despesas</span>
                        <p className="mt-1 text-xl font-semibold text-danger">{formatarMoeda(despesasMes)}</p>
                    </Card>
                    <Card>
                        <span className="text-xs text-muted">Saldo Realizado</span>
                        <p className={`mt-1 text-xl font-semibold ${saldoRealizado >= 0 ? 'text-success' : 'text-danger'}`}>
                            {formatarMoeda(saldoRealizado)}
                        </p>
                    </Card>
                    <Card>
                        <span className="text-xs text-muted">Total Pendente</span>
                        <p className="mt-1 text-xl font-semibold text-warning">{formatarMoeda(totalPendente)}</p>
                    </Card>
                </div>
            </div>

            <div>
                <h3 className="mb-3 text-lg font-semibold text-text">Últimos Lançamentos</h3>
                {lancamentosRecentes.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
                        <div className="text-4xl">📝</div>
                        <h3 className="text-lg font-semibold text-text">Nenhum lançamento ainda</h3>
                        <p className="text-sm text-muted2">Registre receitas e despesas para acompanhar esta conta.</p>
                        <Button
                            onClick={() => {
                                localStorage.setItem('accountId', String(id));
                                navigate('/cadastroTitulo');
                            }}
                        >
                            + Criar Lançamento
                        </Button>
                    </div>
                ) : (
                    <Table columns={columns} data={lancamentosRecentes} rowKey={(b) => b.id} />
                )}
            </div>
        </div>
    );
};

export default AccountDetails;
