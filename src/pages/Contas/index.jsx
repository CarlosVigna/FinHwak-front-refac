import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../componentes/Card';
import { api } from '../../services/api';

const WelcomeBanner = ({ onDismiss }) => (
  <div className="welcome-banner">
    <div className="welcome-banner-content">
      <span className="welcome-banner-icon">🎉</span>
      <div>
        <strong>Bem-vindo ao FinHawk!</strong>
        <p>
          Comece criando sua primeira conta financeira. Depois, cadastre categorias
          de receita e despesa e registre seus primeiros lançamentos.
        </p>
      </div>
    </div>
    <button className="welcome-banner-close" onClick={onDismiss} aria-label="Fechar">
      ✕
    </button>
  </div>
);

const PrimeirosPassos = ({ onDismiss }) => (
  <div className="primeiros-passos">
    <div className="primeiros-passos-header">
      <span>🚀 Primeiros passos</span>
      <button className="primeiros-passos-fechar" onClick={onDismiss}>
        Fechar
      </button>
    </div>
    <ol className="primeiros-passos-lista">
      <li className="primeiros-passos-item done">
        <span className="primeiros-passos-badge completed">✓</span>
        Criar uma conta financeira
      </li>
      <li className="primeiros-passos-item">
        <span className="primeiros-passos-badge pending">2</span>
        Clique em <strong>Entrar</strong> em uma conta para selecioná-la
      </li>
      <li className="primeiros-passos-item">
        <span className="primeiros-passos-badge pending">3</span>
        Cadastre suas categorias de receita e despesa
      </li>
      <li className="primeiros-passos-item">
        <span className="primeiros-passos-badge pending">4</span>
        Registre seus primeiros lançamentos e explore o Dashboard
      </li>
    </ol>
  </div>
);

const Contas = () => {
  const [contas, setContas] = useState([]);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();

  const [isNewUser, setIsNewUser] = useState(
    () => localStorage.getItem('finhawk-new-user') === 'true'
  );
  const [showChecklist, setShowChecklist] = useState(
    () => localStorage.getItem('finhawk-onboarding-done') !== 'true'
  );

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

  const dismissWelcome = () => {
    localStorage.removeItem('finhawk-new-user');
    setIsNewUser(false);
  };

  const dismissChecklist = () => {
    localStorage.setItem('finhawk-onboarding-done', 'true');
    setShowChecklist(false);
  };

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

      {isNewUser && <WelcomeBanner onDismiss={dismissWelcome} />}

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
          {showChecklist && <PrimeirosPassos onDismiss={dismissChecklist} />}

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
