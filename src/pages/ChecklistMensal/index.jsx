import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { api } from '../../services/api';
import { useAccount } from '../../contexts/AccountContext';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
import Card from '../../componentes/ui/Card';
import Badge from '../../componentes/ui/Badge';
import Table from '../../componentes/ui/Table';

const ChecklistMensal = () => {
  const navigate = useNavigate();
  const [itens, setItens] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [approximateValue, setApproximateValue] = useState('');
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
        account: { id: Number(accountId) },
        approximateValue: approximateValue ? Number(approximateValue) : null
      };

      const response = await api.post('/checklist', payload);

      if (!response.ok) {
        const errText = await response.text();
        console.error('Backend Error:', errText);
        throw new Error(`Erro do servidor (${response.status}) ao cadastrar item. Verifique os logs no console.`);
      }

      setDescricao('');
      setDueDay('');
      setApproximateValue('');
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

  const handleCriarLancamento = (item) => {
    const today = new Date();
    let dueDate = new Date(today.getFullYear(), today.getMonth(), item.dueDay);
    if (dueDate < today) {
      dueDate = new Date(today.getFullYear(), today.getMonth() + 1, item.dueDay);
    }
    navigate('/cadastroTitulo', {
      state: {
        fromChecklist: true,
        checklistItemId: item.id,
        description: item.description,
        dueDate: dueDate.toISOString().split('T')[0],
        approximateValue: item.approximateValue || '',
        selectedMonth,
      }
    });
  };

  const filteredItens = itens.filter(item => !busca || item.description.toLowerCase().includes(busca.toLowerCase()));

  const columns = [
    {
      header: 'Feito',
      render: (item) => (
        <input
          type="checkbox"
          checked={checkedItemsState.has(item.id)}
          onChange={() => handleToggle(item.id)}
          disabled={loadingCompletions || savingItems.has(item.id)}
        />
      ),
    },
    { header: 'Dia de Vencimento', render: (item) => item.dueDay },
    {
      header: 'Descrição',
      render: (item) => (
        <span className={checkedItemsState.has(item.id) ? 'text-muted line-through' : 'text-text'}>
          {item.description}
        </span>
      ),
    },
    {
      header: 'Status no Mês',
      render: (item) => {
        if (savingItems.has(item.id)) return <Badge variant="neutral">Salvando...</Badge>;
        return checkedItemsState.has(item.id)
          ? <Badge variant="success"><FaCheckCircle className="mr-1 inline" /> Concluído</Badge>
          : <Badge variant="warning"><FaExclamationCircle className="mr-1 inline" /> Pendente</Badge>;
      },
    },
    {
      header: 'Ações',
      render: (item) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            title="Criar lançamento a partir do checklist"
            onClick={() => handleCriarLancamento(item)}
          >
            Criar
          </Button>
          {deletingId === item.id ? (
            <>
              <Button size="sm" variant="primary" title="Confirmar exclusão" onClick={() => handleDelete(item.id)}>
                <FaCheckCircle />
              </Button>
              <Button size="sm" variant="outline" title="Cancelar" onClick={() => setDeletingId(null)}>
                ✕
              </Button>
            </>
          ) : (
            <Button size="sm" variant="danger" title="Apagar Recorrência" onClick={() => setDeletingId(item.id)}>
              <FaTrash />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">

      <Card>
        <h1 className="mb-4 text-2xl font-semibold text-text">Controle de Checklist Recorrente</h1>

        <form onSubmit={handleCadastrar} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Descrição do Item"
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Aluguel, Internet..."
            />
            <Input
              label="Dia do Vencimento"
              type="number"
              min="1"
              max="31"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
              placeholder="Ex: 5"
            />
            <Input
              label="Valor aproximado"
              type="number"
              step="0.01"
              min="0"
              value={approximateValue}
              onChange={(e) => setApproximateValue(e.target.value)}
              placeholder="Ex: 350,00"
            />
          </div>

          <div>
            <Button type="submit">Adicionar Recorrência</Button>
          </div>

          {erro && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>}
          {sucesso && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>}
        </form>
      </Card>

      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-text">Acompanhamento do Mês</h3>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text"
          />
        </div>

        <Input
          type="text"
          placeholder="Buscar item..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="mb-4"
        />

        {loading ? (
          <p className="text-sm text-muted2">Carregando...</p>
        ) : (
          <Table
            columns={columns}
            data={filteredItens}
            rowKey={(i) => i.id}
            emptyMessage="Nenhum item recorrente cadastrado. Adicione acima."
          />
        )}
      </div>

    </div>
  );
};

export default ChecklistMensal;
