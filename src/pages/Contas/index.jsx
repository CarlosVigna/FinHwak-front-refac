import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../componentes/Card';
import Button from '../../componentes/ui/Button';
import { api } from '../../services/api';
import { useAccount } from '../../contexts/AccountContext';

const WelcomeBanner = ({ onDismiss }) => (
  <div className="mb-6 flex items-start justify-between gap-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
    <div className="flex items-start gap-3">
      <span className="text-2xl">🎉</span>
      <div>
        <strong className="text-text">Bem-vindo ao FinHawk!</strong>
        <p className="mt-1 text-sm text-muted2">
          Comece criando sua primeira conta financeira. Depois, cadastre categorias
          de receita e despesa e registre seus primeiros lançamentos.
        </p>
      </div>
    </div>
    <button
      onClick={onDismiss}
      aria-label="Fechar"
      className="shrink-0 text-muted hover:text-text"
    >
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
      className="fixed z-40 w-72 rounded-lg border border-border bg-surface shadow-lg"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        onMouseDown={handleDragStart}
        className="flex cursor-move items-center justify-between rounded-t-lg border-b border-border bg-surface2 px-3 py-2 text-sm font-medium text-text"
      >
        <span>🚀 Primeiros passos</span>
        <button
          onClick={onDismiss}
          onMouseDown={(e) => e.stopPropagation()}
          className="text-xs text-muted hover:text-text"
        >
          Fechar
        </button>
      </div>
      <ol className="flex flex-col gap-2 p-3">
        {steps.map((step, i) => (
          <li key={i} className={`flex items-start gap-2 text-sm ${step.done ? 'text-muted' : 'text-text'}`}>
            <span className={[
              'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs',
              step.done ? 'bg-success/10 text-success' : 'bg-surface2 text-muted2',
            ].join(' ')}>
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
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">Minhas Contas</h1>
          <p className="mt-1 text-sm text-muted2">Selecione uma conta para continuar</p>
        </div>
        <Button onClick={handleCriarConta}>Nova conta</Button>
      </div>

      {isNewUser && <WelcomeBanner onDismiss={dismissWelcome} />}

      {erro && (
        <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>
      )}
      {sucesso && (
        <p className="mb-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>
      )}

      {contas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
          <div className="text-4xl">🏦</div>
          <h3 className="text-lg font-semibold text-text">Nenhuma conta ainda</h3>
          <p className="text-sm text-muted2">Crie sua primeira conta para começar a organizar suas finanças.</p>
          <Button onClick={handleCriarConta}>+ Criar Primeira Conta</Button>
        </div>
      ) : (
        <>
          {showChecklist && <PrimeirosPassos contas={contas} categorias={categorias} onDismiss={dismissChecklist} />}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {contas.map((conta) => (
              <Card
                key={conta.id}
                conta={conta}
                onEntrar={handleEntrar}
                onEditar={handleEditar}
                onExcluir={handleExcluir}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Contas;
