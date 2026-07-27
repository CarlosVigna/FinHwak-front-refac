import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import Button from '../../componentes/ui/Button';
import Input from '../../componentes/ui/Input';
import Badge from '../../componentes/ui/Badge';
import Card from '../../componentes/ui/Card';
import Table from '../../componentes/ui/Table';

const parseLocalDate = (dateString) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const STATUS_VARIANT = {
  vencida: 'danger',
  hoje: 'warning',
  'em-dia': 'neutral',
};

const ContasPendentes = () => {
  const hoje = new Date();
  const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  const ultimoDiaMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

  const formatInputDate = (date) => {
    const ano = date.getFullYear();
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const dia = String(date.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  };

  const [contas, setContas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const [dataInicio, setDataInicio] = useState(formatInputDate(primeiroDiaMes));
  const [dataFim, setDataFim] = useState(formatInputDate(ultimoDiaMes));
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchContasPendentes = async () => {
    try {
      setLoading(true);

      const accountId = localStorage.getItem('accountId');

      if (!accountId) {
        throw new Error('Nenhuma conta selecionada. Volte e selecione uma conta.');
      }

      const response = await api.get(`/bill/account/${accountId}/period?start=${dataInicio}&end=${dataFim}`);

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Falha ao carregar contas pendentes.');
      }

      const data = await response.json();

      const pendentes = data.filter((item) => {
        const type = item.category?.type || item.type;
        const status = item.status;

        const isPayment = type?.toUpperCase() === 'PAYMENT';
        const isPending = status?.toUpperCase() === 'PENDING';

        return isPayment && isPending;
      });

      pendentes.sort((a, b) => parseLocalDate(a.maturity) - parseLocalDate(b.maturity));

      setContas(pendentes);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContasPendentes();
  }, []);

  const handleFiltrar = () => {
    fetchContasPendentes();
  };

  const handleDarBaixa = async (conta) => {
    try {
      const response = await api.patch(`/bill/${conta.id}/status`, { status: 'PAID' });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro ao dar baixa na conta.');
      }

      setContas((prev) => prev.filter((c) => c.id !== conta.id));
      setConfirmingId(null);
      setSucesso('Conta paga com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      console.error(err);
      setError(translateError(err.message));
    }
  };

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return Number(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const data = new Date(dateString.includes('T') ? dateString : `${dateString}T12:00:00`);
    return data.toLocaleDateString('pt-BR');
  };

  const getStatusVencimento = (maturityDate) => {
    const hojeAtual = new Date();
    hojeAtual.setHours(0, 0, 0, 0);

    const dataString = maturityDate.includes('T')
      ? maturityDate
      : `${maturityDate}T12:00:00`;

    const vencimento = new Date(dataString);
    vencimento.setHours(0, 0, 0, 0);

    if (vencimento < hojeAtual) {
      return { label: 'Vencida', class: 'vencida', icon: faExclamationTriangle };
    }

    if (vencimento.getTime() === hojeAtual.getTime()) {
      return { label: 'Vence Hoje', class: 'hoje', icon: faCalendarAlt };
    }

    return { label: 'Em Dia', class: 'em-dia', icon: null };
  };

  const handleExportCSV = () => {
    const idConta = localStorage.getItem('accountId');
    const statusLabel = { PENDING: 'Pendente', PAID: 'Pago', RECEIVED: 'Recebido' };
    const headers = ['ID', 'Descrição', 'Vencimento', 'Categoria', 'Valor', 'Status'];
    const rows = contas.map(item => {
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
    a.download = `relatorio_contas_pendentes_${idConta}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  const columns = [
    { header: 'Descrição', render: (c) => c.description },
    { header: 'Categoria', render: (c) => c.category?.name || '-' },
    { header: 'Vencimento', render: (c) => formatDate(c.maturity) },
    {
      header: 'Valor',
      render: (c) => {
        const statusInfo = getStatusVencimento(c.maturity);
        return (
          <span className={statusInfo.class === 'vencida' ? 'font-medium text-danger' : 'text-text'}>
            {formatCurrency(c.installmentAmount || c.value)}
          </span>
        );
      },
    },
    {
      header: 'Situação',
      render: (c) => {
        const statusInfo = getStatusVencimento(c.maturity);
        return (
          <Badge variant={STATUS_VARIANT[statusInfo.class]}>
            {statusInfo.icon && <FontAwesomeIcon icon={statusInfo.icon} className="mr-1" />}
            {statusInfo.label}
          </Badge>
        );
      },
    },
    {
      header: 'Ações',
      render: (conta) => (
        confirmingId === conta.id ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              title="Confirmar pagamento"
              onClick={() => handleDarBaixa(conta)}
            >
              <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Sim
            </Button>
            <Button
              size="sm"
              variant="danger"
              title="Cancelar"
              onClick={() => setConfirmingId(null)}
            >
              Não
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setConfirmingId(conta.id)}
            title={`Marcar "${conta.description}" como paga`}
          >
            <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Pagar
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Contas Pendentes</h1>
        <p className="mt-1 text-sm text-muted2">Gerencie seus pagamentos em aberto.</p>
      </div>

      <Card className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <Input
            label="Data inicial"
            id="dataInicio"
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
          />
          <Input
            label="Data final"
            id="dataFim"
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
          />
          <Button type="button" onClick={handleFiltrar}>Filtrar</Button>
          <Button type="button" variant="outline" onClick={handleExportCSV}>📊 Exportar CSV</Button>
        </div>

        {error && (
          <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>
        )}
        {sucesso && (
          <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>
        )}

        {loading ? (
          <p className="text-sm text-muted2">⏳ Carregando contas...</p>
        ) : contas.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <FontAwesomeIcon icon={faInbox} size="3x" className="text-muted" />
            <h3 className="text-lg font-semibold text-text">Tudo em dia!</h3>
            <p className="text-sm text-muted2">Nenhuma conta pendente no período informado.</p>
          </div>
        ) : (
          <Table columns={columns} data={contas} rowKey={(c) => c.id} />
        )}
      </Card>
    </div>
  );
};

export default ContasPendentes;
