import React, { useEffect, useState } from 'react';

const ChecklistMensal = () => {
  const [itens, setItens] = useState([]);
  const [descricao, setDescricao] = useState('');
  const [dueDay, setDueDay] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchItens = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem('token');
      const accountId = localStorage.getItem('accountId');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/checklist-item/account/${accountId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao carregar checklist.');
      }

      const data = await response.json();
      setItens(data);
      setErro('');
    } catch (error) {
      console.error(error);
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItens();
  }, []);

  const handleCadastrar = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const accountId = localStorage.getItem('accountId');

      const payload = {
        description: descricao,
        dueDay: Number(dueDay),
        accountId: Number(accountId),
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/checklist-item`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || 'Erro ao cadastrar item.');
      }

      setDescricao('');
      setDueDay('');
      setSucesso('Item cadastrado com sucesso.');
      fetchItens();

      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error(error);
      setErro(error.message);
    }
  };

  const handleToggle = async (item) => {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/checklist-item/${item.id}/toggle`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao alterar item.');
      }

      fetchItens();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmar = window.confirm('Deseja excluir este item do checklist?');
    if (!confirmar) return;

    try {
      const token = localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/checklist-item/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erro ao excluir item.');
      }

      fetchItens();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Checklist Mensal</h1>
      <p>Use esta lista para lembrar o que ainda precisa lançar no sistema.</p>

      <form
        onSubmit={handleCadastrar}
        style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          marginBottom: '24px',
          alignItems: 'end',
        }}
      >
        <div>
          <label>Descrição</label>
          <input
            type="text"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Ex: Acordo João"
          />
        </div>

        <div>
          <label>Dia do vencimento</label>
          <input
            type="number"
            min="1"
            max="31"
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            placeholder="5"
          />
        </div>

        <button type="submit">Adicionar</button>
      </form>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      {sucesso && <p style={{ color: 'green' }}>{sucesso}</p>}

      {loading ? (
        <p>Carregando...</p>
      ) : itens.length === 0 ? (
        <p>Nenhum item cadastrado.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Feito</th>
              <th>Dia</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((item) => (
              <tr key={item.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => handleToggle(item)}
                  />
                </td>
                <td>{item.dueDay}</td>
                <td>{item.description}</td>
                <td>
                  <button onClick={() => handleDelete(item.id)}>Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ChecklistMensal;