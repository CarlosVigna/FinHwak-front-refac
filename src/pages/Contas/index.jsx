import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../componentes/Card';
import { api } from '../../services/api';
import { useAccount } from '../../contexts/AccountContext';

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

const PrimeirosPassos = ({ contas, categorias, onDismiss }) => {
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const drag = useRef({ active: false, startX: 0, startY: 0, initX: 0, initY: 0 });

  useEffect(() => {
    const onMove = (e) => {
      if (!drag.current.active) return;
      setPos({
        x: drag.current.initX + e.clientX - drag.current.startX,
        y: drag.current.initY + e.clientY - drag.current.startY,
      });
    };
    const onUp = () => { drag.current.active = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const handleDragStart = (e) => {
    drag.current = { active: true, startX: e.clientX, startY: e.clientY, initX: pos.x, initY: pos.y };
    e.preventDefault();
  };

  const step1 = contas.length > 0;
  const step2 = localStorage.getItem('finhawk-account-entered') === 'true';
  const step3 = categorias.length > 0;
  const step4 = localStorage.getItem('finhawk-first-bill') === 'true';

  const steps = [
    { done: step1, label: <>Criar uma conta financeira</> },
    { done: step2, label: <>Clique em <strong>Entrar</strong> em uma conta para selecioná-la</> },
    { done: step3, label: <>Cadastre suas categorias de receita e despesa</> },
    { done: step4, label: <>Registre seus primeiros lançamentos e explore o Dashboard</> },
  ];

  return (
    <div
      className="primeiros-passos primeiros-passos--float"
      style={{ left: pos.x, top: pos.y }}
    >
      <div className="primeiros-passos-header" onMouseDown={handleDragStart}>
        <span>🚀 Primeiros passos</span>
        <button
          className="primeiros-passos-fechar"
          onClick={onDismiss}
          onMouseDown={(e) => e.stopPropagation()}
        >
          Fechar
        </button>
      </div>
      <ol className="primeiros-passos-lista">
        {steps.map((step, i) => (
          <li key={i} className={`primeiros-passos-item${step.done ? ' done' : ''}`}>
            <span className={`primeiros-passos-badge ${step.done ? 'completed' : 'pending'}`}>
              {step.done ? '✓' : i + 1}
            </span>
            {step.label}
          </li>
        ))}
      </ol>
    </div>
  );
};

const Contas = () => {
  const [contas, setContas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [erro, setErro] = useState(null);
  const [sucesso, setSucesso] = useState('');
  const navigate = useNavigate();
  const { accountId, setAccount, clearAccount } = useAccount();

  const [isNewUser, setIsNewUser] = useState(
    () => localStorage.getItem('finhawk-new-user') === 'true'
  );
  const [showChecklist, setShowChecklist] = useState(
    () => localStorage.getItem('finhawk-onboarding-done') !== 'true'
  );

  useEffect(() => {
    const fetchContas = async () => {
      try {
        const response = await api.get('/account');
        if (!response.ok) throw new Error('Erro ao carregar contas.');
        const data = await response.json();
        setContas(data);

        if (data.length > 0) {
          const catRes = await api.get(`/category/account/${data[0].id}`);
          if (catRes.ok) {
            const catData = await catRes.json();
            setCategorias(catData);
          }
        }
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
    setAccount(String(idConta), conta?.name || '');
    localStorage.setItem('finhawk-account-entered', 'true');
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
        if (String(idConta) === accountId) {
          clearAccount();
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
            <button className="fh-btn fh-btn-primary" onClick={handleCriarConta}>
              + Criar Primeira Conta
            </button>
          </div>
        </div>
      ) : (
        <>
          {showChecklist && <PrimeirosPassos contas={contas} categorias={categorias} onDismiss={dismissChecklist} />}

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
            <button className="fh-btn fh-btn-primary" onClick={handleCriarConta}>
              Adicionar Nova Conta
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Contas;
