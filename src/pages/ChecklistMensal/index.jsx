import React, { useEffect, useState, useCallback } from 'react';
import { FaTrash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

const ChecklistMensal = () => {
  const [itens, setItens] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Controle mensal
  const currentMonthStr = new Date().toISOString().slice(0, 7); // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  const [checkedItemsState, setCheckedItemsState] = useState({});

  const accountId = localStorage.getItem('accountId');

  const fetchItens = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/checklist/account/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

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

  useEffect(() => {
    if (accountId && accountId !== "null") {
      fetchItens();
    }
  }, [fetchItens, accountId]);

  // Carregar status do mês sempre que o mês ou accountId mudar
  useEffect(() => {
    if (!accountId) return;
    const storageKey = `finhawk_checklist_${selectedMonth}_${accountId}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setCheckedItemsState(JSON.parse(saved));
    } else {
      setCheckedItemsState({});
    }
  }, [selectedMonth, accountId]);

  const saveMonthState = (newState) => {
    const storageKey = `finhawk_checklist_${selectedMonth}_${accountId}`;
    localStorage.setItem(storageKey, JSON.stringify(newState));
    setCheckedItemsState(newState);
  };

  const handleToggle = (itemId) => {
    const newState = { ...checkedItemsState };
    newState[itemId] = !newState[itemId];
    saveMonthState(newState);
  };

  const handleCadastrar = async (e) => {
    e.preventDefault();
    if (!descricao || !dueDay) {
        setErro("Preencha todos os campos.");
        return;
    }

    try {
      const token = localStorage.getItem('token');
      const payload = {
        description: descricao,
        dueDay: Number(dueDay),
        active: true,
        accountId: Number(accountId), // compatibilidade com DTO
        account: { id: Number(accountId) } // compatibilidade com Entity
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/checklist`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
          const errText = await response.text();
          console.error("Backend Error:", errText);
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
    const confirmar = window.confirm('Deseja excluir permanentemente este item recorrente?');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/checklist/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Erro ao excluir item.');
      fetchItens();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div className='cadastro-titulo-vertical'>
      
      {/* Formulário de Cadastro */}
      <div className='secao-superior'>
        <h2 className="historico-titulo checklist-title">
            Controle de Checklist Recorrente
        </h2>
        
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
             <button type="submit">Adicionar Recorrência</button>
          </div>
          
          {erro && <div className="error-message">{erro}</div>}
          {sucesso && <div className="success-message">{sucesso}</div>}
        </form>
      </div>

      {/* Histórico/Lista */}
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
                  itens.map((item) => {
                    const isConcluido = checkedItemsState[item.id] || false;
                    
                    return (
                      <tr key={item.id} className={isConcluido ? 'checklist-row-done' : ''}>
                        <td className="cell-center">
                            <input 
                                type="checkbox" 
                                className="checklist-checkbox"
                                checked={isConcluido}
                                onChange={() => handleToggle(item.id)}
                            />
                        </td>
                        <td data-label="Dia">{item.dueDay}</td>
                        <td data-label="Descrição" className={isConcluido ? 'checklist-item-done' : ''}>
                            {item.description}
                        </td>
                        <td data-label="Status">
                            {isConcluido ? (
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
                              onClick={() => window.location.href = `/cadastroTitulo?checklistItemId=${item.id}`}
                            >
                              Criar
                            </button>
                            <button
                              type="button"
                              className="btn-acao btn-excluir"
                              title="Apagar Recorrência"
                              onClick={() => handleDelete(item.id)}
                            >
                              <FaTrash />
                            </button>
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
