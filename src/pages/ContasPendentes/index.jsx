import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';

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

  const handleFiltrar = () => {
    fetchContasPendentes();
  };

  const handleDarBaixa = async (conta) => {
    const valorFormatado = formatCurrency(conta.installmentAmount || conta.value);

    if (
      !window.confirm(
        `Confirma o pagamento de "${conta.description}"?\nValor: ${valorFormatado}`
      )
    ) {
      return;
    }

    try {
      const response = await api.patch(`/bill/${conta.id}/status`, { status: 'PAID' });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro ao dar baixa na conta.');
      }

      setContas((prev) => prev.filter((c) => c.id !== conta.id));
      setSucesso('Conta paga com sucesso!');
      setTimeout(() => setSucesso(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.message);
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

  const handleExportCSV = async () => {
    const idConta = localStorage.getItem('accountId');
    if (!idConta) {
      setError('Nenhuma conta selecionada.');
      return;
    }

    try {
      const response = await api.blob(`/bill/export/account/${idConta}`);

      if (!response.ok) {
        const txt = await response.text();
        throw new Error(txt || 'Erro ao exportar CSV');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_contas_pendentes_${idConta}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Erro ao exportar CSV: ' + err.message);
    }
  };

  return (
    <div className="contas-pendentes-page">
      <div className="fh-page-header">
        <h1 className="fh-title">
          Contas <span>Pendentes</span>
        </h1>

        <p className="fh-subtitle">
          Gerencie seus pagamentos em aberto.
        </p>
      </div>

      <div className="tabela-card">
        <div className="filtros-periodo">
          <div className="filtro-grupo">
            <label htmlFor="dataInicio">Data inicial</label>
            <input
              id="dataInicio"
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
            />
          </div>

          <div className="filtro-grupo">
            <label htmlFor="dataFim">Data final</label>
            <input
              id="dataFim"
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="btn-filtrar-periodo"
            onClick={handleFiltrar}
          >
            Filtrar
          </button>

          <button
            type="button"
            className="btn-exportar-csv btn-export-csv"
            onClick={handleExportCSV}
          >
            📊 Exportar CSV
          </button>
        </div>

        {error && <div className="mensagem-erro">{error}</div>}
        {sucesso && <div className="sucesso-mensagem">{sucesso}</div>}

        {loading ? (
          <div className="loading-placeholder">
            ⏳ Carregando contas...
          </div>
        ) : (
          <div className="table-container">
            {contas.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon
                  icon={faInbox}
                  size="3x"
                  className="empty-state-icon"
                />
                <p>Nenhuma conta pendente no período informado.</p>
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
                  {contas.map((conta) => {
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
                            {statusInfo.icon && <FontAwesomeIcon icon={statusInfo.icon} />}{' '}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
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
