import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
import { api } from '../../services/api';
import { useTooltipsEnabled } from '../../hooks/useTooltipsEnabled';
import SprayUnderline from '../../componentes/SprayUnderline';

const Configuracoes = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const tooltipsEnabled = useTooltipsEnabled();

  const handleToggleTooltips = (e) => {
    const val = e.target.checked;
    localStorage.setItem('finhawk-tooltips', val ? 'true' : 'false');
    window.dispatchEvent(new Event('finhawk-tooltips-changed'));
  };

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

  // ── Seção 3: Exportação de dados ─────────────────────────────
  const [exportando, setExportando] = useState(false);
  const [exportErro, setExportErro] = useState('');

  // ── Seção 3b: Importação de dados ────────────────────────────
  const importInputRef = useRef(null);
  const [importando, setImportando] = useState(false);
  const [importErro, setImportErro] = useState('');
  const [importSucesso, setImportSucesso] = useState('');

  // ── Seção 4: Exclusão de conta ────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailConfirmacao, setEmailConfirmacao] = useState('');
  const [deletando, setDeletando] = useState(false);
  const [deleteErro, setDeleteErro] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

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

  const handleExportarDados = async () => {
    setExportando(true);
    setExportErro('');
    try {
      const response = await api.get('/user/export');
      if (!response.ok) {
        throw new Error('Erro ao exportar dados.');
      }
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const today = new Date().toISOString().split('T')[0];
      a.download = `finhawk-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setExportErro(err.message || 'Erro ao exportar dados.');
    } finally {
      setExportando(false);
    }
  };

  const handleImportarBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';
    setImportErro('');
    setImportSucesso('');
    setImportando(true);

    try {
      const text = await file.text();
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        throw new Error('Arquivo inválido. Selecione um backup JSON gerado pelo FinHawk.');
      }

      const response = await api.post('/user/import', parsed);
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.message || 'Erro ao importar backup.');
      }

      setImportSucesso('Backup importado com sucesso!');
      setTimeout(() => setImportSucesso(''), 5000);
    } catch (err) {
      setImportErro(err.message || 'Erro ao importar backup.');
    } finally {
      setImportando(false);
    }
  };

  const handleAbrirModalExclusao = () => {
    setShowDeleteModal(true);
    setEmailConfirmacao('');
    setDeleteErro('');
    setDeleteSuccess(false);
  };

  const handleFecharModalExclusao = () => {
    if (deletando) return;
    setShowDeleteModal(false);
    setEmailConfirmacao('');
    setDeleteErro('');
    setDeleteSuccess(false);
  };

  const handleExcluirConta = async () => {
    if (emailConfirmacao.trim() !== user?.email) {
      setDeleteErro('O e-mail digitado não confere. Verifique e tente novamente.');
      return;
    }

    setDeletando(true);
    setDeleteErro('');

    try {
      const response = await api.delete('/user/me');

      if (response.status === 204) {
        setDeleteSuccess(true);
        setTimeout(() => {
          localStorage.removeItem('accountName');
          logout();
          navigate('/login');
        }, 1500);
        return;
      }

      throw new Error('Não foi possível excluir sua conta. Tente novamente.');
    } catch (err) {
      if (!deleteSuccess) {
        setDeleteErro(err.message || 'Não foi possível excluir sua conta. Tente novamente.');
      }
    } finally {
      setDeletando(false);
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
        <SprayUnderline width={140} className="page-title-spray" />

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

        {/* ── Preferências ──────────────────────────────────── */}
        <div className="secao-superior">
          <h2 className="historico-titulo">Preferências</h2>

          <div className="toggle-row">
            <span className="toggle-label">
              Tooltips informativos no Dashboard
              <span style={{ display: 'block', fontSize: '0.78rem', color: 'var(--muted2)', marginTop: 2 }}>
                Exibe ícones ⓘ com explicações nos cards do Dashboard.
              </span>
            </span>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={tooltipsEnabled}
                onChange={handleToggleTooltips}
              />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>

        {/* ── Privacidade e Dados ────────────────────────────── */}
        <div className="secao-superior">
          <h2 className="historico-titulo">Privacidade e Dados</h2>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 16px' }}>
            Exporte todos os seus dados em um arquivo JSON (contas, categorias, lançamentos e checklist).
          </p>

          <button
            type="button"
            className="botao-salvar"
            onClick={handleExportarDados}
            disabled={exportando}
            style={{ marginBottom: '24px' }}
          >
            {exportando ? 'Exportando...' : 'Exportar Meus Dados'}
          </button>

          {exportErro && <div className="error-message" style={{ marginBottom: '16px' }}>{exportErro}</div>}

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 16px' }}>
            Restaure um backup JSON exportado anteriormente. Os dados importados serão adicionados aos dados existentes.
          </p>

          <input
            ref={importInputRef}
            type="file"
            accept=".json,application/json"
            style={{ display: 'none' }}
            onChange={handleImportarBackup}
          />

          <button
            type="button"
            className="botao-salvar"
            onClick={() => importInputRef.current?.click()}
            disabled={importando}
            style={{ marginBottom: '24px' }}
          >
            {importando ? 'Importando...' : 'Importar Backup'}
          </button>

          {importErro && <div className="error-message" style={{ marginBottom: '16px' }}>{importErro}</div>}
          {importSucesso && <div className="success-message" style={{ marginBottom: '16px' }}>{importSucesso}</div>}

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0 0 10px' }}>
            Esta ação removerá permanentemente todos os seus dados do FinHawk:
          </p>
          <ul style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 20px', paddingLeft: '20px', lineHeight: '1.8' }}>
            <li>Contas</li>
            <li>Categorias</li>
            <li>Lançamentos</li>
            <li>Checklist</li>
            <li>Histórico</li>
          </ul>

          <button
            type="button"
            className="btn-excluir"
            onClick={handleAbrirModalExclusao}
          >
            Excluir Minha Conta
          </button>
        </div>

      </div>

      {/* ── Modal de confirmação de exclusão ─────────────────── */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) handleFecharModalExclusao(); }}>
          <div className="status-modal">
            <h3 className="modal-titulo">Excluir Conta</h3>

            {deleteSuccess ? (
              <div className="success-message">
                Sua conta foi removida com sucesso. Redirecionando...
              </div>
            ) : (
              <>
                <p className="modal-descricao">
                  Esta ação é permanente. Todos os seus dados serão removidos e não poderão ser recuperados.
                </p>
                <p className="modal-descricao" style={{ marginBottom: '16px' }}>
                  Digite seu e-mail para confirmar.
                </p>

                <div className="campo-formulario">
                  <label>E-mail de confirmação</label>
                  <input
                    type="email"
                    value={emailConfirmacao}
                    onChange={(e) => setEmailConfirmacao(e.target.value)}
                    placeholder={user.email}
                    disabled={deletando}
                    autoComplete="off"
                  />
                </div>

                {deleteErro && <div className="error-message" style={{ marginTop: '10px' }}>{deleteErro}</div>}

                <div className="botoes-formulario" style={{ marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={handleFecharModalExclusao}
                    disabled={deletando}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="btn-excluir"
                    onClick={handleExcluirConta}
                    disabled={deletando}
                  >
                    {deletando ? 'Excluindo...' : 'Excluir Conta'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
