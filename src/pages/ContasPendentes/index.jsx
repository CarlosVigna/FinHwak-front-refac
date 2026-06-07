import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationTriangle,
  faCalendarAlt,
  faInbox,
} from '@fortawesome/free-solid-svg-icons';
import './contasPendentes.css';

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
  const [dataInicio, setDataInicio] = useState(formatInputDate(primeiroDiaMes));
  const [dataFim, setDataFim] = useState(formatInputDate(ultimoDiaMes));

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

      const url = `${import.meta.env.VITE_API_URL}/bill/account/${accountId}/period?start=${dataInicio}&end=${dataFim}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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
      const token = localStorage.getItem('token');
      const accountId = localStorage.getItem('accountId');

      const payload = {
        id: conta.id,
        description: conta.description,
        emission: conta.emission,
        maturity: conta.maturity,
        installmentAmount: Number(conta.installmentAmount || conta.value),
        installmentCount: Number(conta.installmentCount || 1),
        periodicity: conta.periodicity || 'MONTHLY',
        status: 'PAID',
        categoryId: Number(conta.category?.id || conta.categoryId),
        accountId: Number(accountId),
        type: 'PAYMENT',
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${conta.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Erro ao dar baixa na conta.');
      }

      setContas((prev) => prev.filter((c) => c.id !== conta.id));
      alert('Conta paga com sucesso!');
    } catch (err) {
      console.error(err);
      alert(`Erro: ${err.message}`);
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
      alert('Nenhuma conta selecionada.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/export/account/${idConta}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

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
      alert('Erro ao exportar CSV: ' + err.message);
    }
  };

  return (
    <div className="contas-pendentes-page">
      <div className="page-header">
        <h1 className="page-title">Contas Pendentes</h1>
        <p className="page-subtitle">Gerencie seus pagamentos em aberto</p>
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
             className="btn-exportar-csv"
             onClick={handleExportCSV}
             style={{
               background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
               color: 'white',
               border: 'none',
               borderRadius: '8px',
               padding: '0.75rem 1.5rem',
               fontWeight: 'bold',
               cursor: 'pointer',
               transition: '0.2s ease'
             }}
           >
             📊 Exportar CSV
           </button>
        </div>

        {error && <div className="mensagem-erro">{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            ⏳ Carregando contas...
          </div>
        ) : (
          <div className="table-container">
            {contas.length === 0 ? (
              <div className="empty-state">
                <FontAwesomeIcon
                  icon={faInbox}
                  size="3x"
                  style={{ marginBottom: '10px', color: '#ccc' }}
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