import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../componentes/Card';
import { api } from '../../services/api';

const Contas = () => {
  const [contas, setContas] = useState([]);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('accountId');
    localStorage.removeItem('accountName');

    const fetchContas = async () => {
      try {
        const response = await api.get('/account');

        if (!response.ok) {
          throw new Error('Erro ao carregar contas.');
        }

        const data = await response.json();
        setContas(data);
      } catch (error) {
        setErro('Erro ao carregar contas: ' + error.message);
        console.error('Erro ao buscar contas:', error);
      }
    };

    fetchContas();
  }, []);

  const handleEntrar = (idConta) => {
    const conta = contas.find(c => c.id === idConta);
    localStorage.setItem('accountId', String(idConta));
    localStorage.setItem('accountName', conta?.name || '');
    navigate('/dashboard');
  };

  const handleEditar = (idConta) => {
    navigate(`/editar-conta/${idConta}`);
  };

  const handleCriarConta = () => {
    navigate('/criar-conta');
  };

  const handleExcluir = async (idConta) => {
    const userConfirmed = window.confirm(
      'ATENÇÃO: Excluir esta conta também removerá todos os títulos associados a ela. Deseja continuar?'
    );
    if (!userConfirmed) return;

    setErro('');
    setSucesso('');

    try {
      const response = await api.delete(`/account/${idConta}`);

      if (response.status === 204) {
        setContas((prevContas) => prevContas.filter((conta) => conta.id !== idConta));
        setSucesso('Conta e seus títulos foram excluídos com sucesso');
        if (String(idConta) === localStorage.getItem('accountId')) {
          localStorage.removeItem('accountId');
          localStorage.removeItem('accountName');
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Erro ao excluir conta.');
      }
    } catch (error) {
      setErro(error.message);
    } finally {
      setTimeout(() => {
        setErro('');
        setSucesso('');
      }, 3000);
    }
  };

  return (
    <div className="contas-container">
      <h1 className="titulo-contas">Minhas Contas</h1>

      {erro && <div className="erro-mensagem">{erro}</div>}
      {sucesso && (
        <div className="sucesso-mensagem">
          {sucesso}
        </div>
      )}

      {contas.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🏦</div>
          <h3>Nenhuma conta ainda</h3>
          <p>Crie sua primeira conta para começar a organizar suas finanças.</p>
          <div className="empty-state-actions">
            <button className="botao-nova-conta" onClick={handleCriarConta}>
              + Criar Primeira Conta
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="cards-container">
            {contas.map((conta) => (
              <Card
                key={conta.id}
                className="conta-card"
                conta={conta}
                onEntrar={handleEntrar}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
              />
            ))}
          </div>

          <div className="botao-criar-conta-container">
            <button className="botao-nova-conta" onClick={handleCriarConta}>
              Adicionar Nova Conta
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Contas;
