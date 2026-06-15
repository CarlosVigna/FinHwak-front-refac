import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { api } from '../../services/api';
import { useAccount } from '../../contexts/AccountContext';

const ChecklistMensal = () => {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [checkedItemsState, setCheckedItemsState] = useState(new Set());
  const [loadingCompletions, setLoadingCompletions] = useState(false);
  const [savingItems, setSavingItems] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);
  const [busca, setBusca] = useState('');

  const { accountId } = useAccount();

  const fetchItens = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/checklist/account/${accountId}`);
      if (!response.ok) throw new Error('Erro ao carregar checklist.');
      const data = await response.json();
      setItens(data);
      setErro('');
    } catch (error) {
      console.error(error);
      setErro('Falha ao carregar itens recorrentes.');
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  const fetchCompletions = useCallback(async () => {
    if (!accountId || accountId === 'null') return;
    try {
      setLoadingCompletions(true);
      const response = await api.get(`/checklist/account/${accountId}/completions?month=${selectedMonth}`);
      if (!response.ok) throw new Error('Erro ao carregar conclusões.');
      const ids = await response.json();
      setCheckedItemsState(new Set(ids));
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingCompletions(false);
    }
  }, [accountId, selectedMonth]);

  useEffect(() => {
    if (accountId && accountId !== 'null') {
      fetchItens();
    }
  }, [fetchItens, accountId]);

  useEffect(() => {
    fetchCompletions();
  }, [fetchCompletions]);

  const handleToggle = async (itemId) => {
    const isConcluido = checkedItemsState.has(itemId);

    setSavingItems(prev => {
      const next = new Set(prev);
      next.add(itemId);
      return next;
    });

    try {
      if (isConcluido) {
        const response = await api.delete(`/checklist/${itemId}/completion/${selectedMonth}`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Erro ao desmarcar item.');
        }
        setCheckedItemsState(prev => {
          const next = new Set(prev);
          next.delete(itemId);
          return next;
        });
      } else {
        const response = await api.post(`/checklist/${itemId}/completion`, { month: selectedMonth });
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Erro ao marcar item.');
        }
        setCheckedItemsState(prev => new Set(prev).add(itemId));
      }
      setErro('');
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setSavingItems(prev => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!descricao || !dueDay) {
      setErro('Preencha todos os campos.');
      return;
    }

    try {
      const payload = {
        description: descricao,
        dueDay: Number(dueDay),
        active: true,
        accountId: Number(accountId),
        account: { id: Number(accountId) }
      };

      const response = await api.post('/checklist', payload);

      if (!response.ok) {
        const errText = await response.text();
        console.error('Backend Error:', errText);
        throw new Error(`Erro do servidor (${response.status}) ao cadastrar item. Verifique os logs no console.`);
      }

      setDescricao('');
      setDueDay('');
      setSucesso('Item recorrente cadastrado!');
      setErro('');
      fetchItens();
      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await api.delete(`/checklist/${id}`);
      if (!response.ok) throw new Error('Erro ao excluir item.');
      setCheckedItemsState(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      setDeletingId(null);
      fetchItens();
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  };

  return (
    <div className='cadastro-titulo-vertical'>

      <div className='secao-superior'>
        <h1 className="fh-title">
          <span>Controle de Checklist Recorrente</span>
        </h1>

        <form onSubmit={handleCadastrar} className="checklist-form">
          <div className="checklist-grid">
            <div className="campo-formulario">
              <label>Descrição do Item</label>
              <input
                type="text"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Ex: Aluguel, Internet..."
              />
            </div>

            <div className="campo-formulario">
              <label>Dia do Vencimento</label>
              <input
                type="number"
                min="1"
                max="31"
                value={dueDay}
                onChange={(e) => setDueDay(e.target.value)}
                placeholder="Ex: 5"
              />
            </div>
          </div>

          <div className="botoes-formulario checklist-actions">
            <button type="submit" className="botao-salvar">Adicionar Recorrência</button>
          </div>

          {erro && <div className="error-message">{erro}</div>}
          {sucesso && <div className="success-message">{sucesso}</div>}
        </form>
      </div>

      <div className='historico-container'>
        <div className="checklist-toolbar">
          <h3>Acompanhamento do Mês</h3>

          <div className="campo-formulario checklist-month-field">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
        </div>

        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            className="fh-search-input"
            placeholder="Buscar item..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        <div className="table-container">
          <div className="tabela-responsiva">
            <table className="tabela-titulos">
              <thead>
                <tr>
                  <th className="cell-narrow cell-center">Feito</th>
                  <th>Dia de Vencimento</th>
                  <th>Descrição</th>
                  <th>Status no Mês</th>
                  <th className="cell-center">Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">Carregando...</td>
                  </tr>
                ) : itens.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-table-cell">
                      Nenhum item recorrente cadastrado. Adicione acima.
                    </td>
                  </tr>
                ) : (
                  itens
                    .filter(item => !busca || item.description.toLowerCase().includes(busca.toLowerCase()))
                    .map((item) => {
                    const isConcluido = checkedItemsState.has(item.id);
                    const isSaving = savingItems.has(item.id);

                    return (
                      <tr key={item.id} className={isConcluido ? 'checklist-row-done' : ''}>
                        <td className="cell-center">
                          <input
                            type="checkbox"
                            className="checklist-checkbox"
                            checked={isConcluido}
                            onChange={() => handleToggle(item.id)}
                            disabled={loadingCompletions || isSaving}
                          />
                        </td>
                        <td data-label="Dia">{item.dueDay}</td>
                        <td data-label="Descrição" className={isConcluido ? 'checklist-item-done' : ''}>
                          {item.description}
                        </td>
                        <td data-label="Status">
                          {isSaving ? (
                            <span className="badge-status">Salvando...</span>
                          ) : isConcluido ? (
                            <span className="badge-status checklist-status-done">
                              <FaCheckCircle /> Concluído
                            </span>
                          ) : (
                            <span className="badge-status status-pendente">
                              <FaExclamationCircle /> Pendente
                            </span>
                          )}
                        </td>
                        <td className="cell-center">
                          <div className="action-group">
                            <button
                              type="button"
                              className="btn-acao btn-criar"
                              title="Criar lançamento a partir do checklist"
                              onClick={() => navigate(`/cadastroTitulo?checklistItemId=${item.id}`)}
                            >
                              Criar
                            </button>
                            {deletingId === item.id ? (
                              <>
                                <button
                                  type="button"
                                  className="btn-acao btn-excluir"
                                  title="Confirmar exclusão"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <FaCheckCircle />
                                </button>
                                <button
                                  type="button"
                                  className="btn-acao"
                                  title="Cancelar"
                                  onClick={() => setDeletingId(null)}
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                className="btn-acao btn-excluir"
                                title="Apagar Recorrência"
                                onClick={() => setDeletingId(item.id)}
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChecklistMensal;
