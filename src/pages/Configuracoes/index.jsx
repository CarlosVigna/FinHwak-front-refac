import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
import { api } from '../../services/api';

const Configuracoes = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // ── Seção 1: Dados pessoais ──────────────────────────────────
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [dadosSucesso, setDadosSucesso] = useState('');
  const [dadosErro, setDadosErro] = useState('');

  // ── Seção 2: Alterar senha ────────────────────────────────────
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [senhaSucesso, setSenhaSucesso] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  // Pré-preenche formulário com dados do usuário logado
  useEffect(() => {
    if (user) {
      setNome(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSalvarDados = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !email.trim()) {
      setDadosErro('Nome e e-mail são obrigatórios.');
      return;
    }

    setSalvandoDados(true);
    setDadosErro('');
    setDadosSucesso('');

    try {
      const response = await api.put(`/user/${user.id}`, {
        name: nome.trim(),
        email: email.trim(),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Erro ao salvar dados.');
      }

      const emailAlterado = email.trim() !== user.email;

      if (emailAlterado) {
        setDadosSucesso('E-mail atualizado. Você será redirecionado para o login.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 2500);
      } else {
        setDadosSucesso('Dados atualizados com sucesso!');
        refreshUser();
        setTimeout(() => setDadosSucesso(''), 4000);
      }
    } catch (err) {
      setDadosErro(err.message);
    } finally {
      setSalvandoDados(false);
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setSenhaErro('Preencha todos os campos de senha.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaErro('A nova senha e a confirmação não coincidem.');
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaErro('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setSalvandoSenha(true);
    setSenhaErro('');
    setSenhaSucesso('');

    try {
      // Valida a senha atual via endpoint de login antes de alterar
      const loginRes = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: senhaAtual }),
      });

      if (!loginRes.ok) {
        setSenhaErro('Senha atual incorreta.');
        return;
      }

      const updateRes = await api.put(`/user/${user.id}`, { password: novaSenha });

      if (!updateRes.ok) {
        const data = await updateRes.json().catch(() => null);
        throw new Error(data?.message || 'Erro ao alterar senha.');
      }

      setSenhaSucesso('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarSenha('');
      setTimeout(() => setSenhaSucesso(''), 4000);
    } catch (err) {
      setSenhaErro(err.message);
    } finally {
      setSalvandoSenha(false);
    }
  };

  if (!user) {
    return (
      <div className="fh-page">
        <div className="configuracoes-container">
          <div className="loading">Carregando configurações...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fh-page">
      <div className="configuracoes-container">

        <h1 className="titulo-contas">Configurações da Conta</h1>

        {/* ── Dados Pessoais ─────────────────────────────────── */}
        <div className="secao-superior">
          <h2 className="historico-titulo">Dados Pessoais</h2>
          <form className="fh-form" onSubmit={handleSalvarDados}>
            <div className="linha-formulario">
              <div className="campo-formulario">
                <label>Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                />
              </div>
              <div className="campo-formulario">
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu e-mail"
                />
              </div>
            </div>

            {dadosErro && <div className="error-message">{dadosErro}</div>}
            {dadosSucesso && <div className="success-message">{dadosSucesso}</div>}

            <div className="botoes-formulario">
              <button type="submit" className="botao-salvar" disabled={salvandoDados}>
                {salvandoDados ? 'Salvando...' : 'Salvar Dados Pessoais'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Alterar Senha ──────────────────────────────────── */}
        <div className="secao-superior">
          <h2 className="historico-titulo">Alterar Senha</h2>
          <form className="fh-form" onSubmit={handleAlterarSenha}>
            <div className="campo-formulario">
              <label>Senha Atual</label>
              <input
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>
            <div className="campo-formulario">
              <label>Nova Senha</label>
              <input
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div className="campo-formulario">
              <label>Confirmar Nova Senha</label>
              <input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Repita a nova senha"
              />
            </div>

            {senhaErro && <div className="error-message">{senhaErro}</div>}
            {senhaSucesso && <div className="success-message">{senhaSucesso}</div>}

            <div className="botoes-formulario">
              <button type="submit" className="botao-salvar" disabled={salvandoSenha}>
                {salvandoSenha ? 'Verificando...' : 'Alterar Senha'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Configuracoes;
