import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../Login/AuthContext';
import { api } from '../../services/api';
import { useTooltipsEnabled } from '../../hooks/useTooltipsEnabled';
import { translateError } from '../../utils/errorMessages';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
import Card from '../../componentes/ui/Card';
import Modal from '../../componentes/ui/Modal';

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
      setDadosErro(translateError(err.message));
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
      setSenhaErro(translateError(err.message));
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
      setExportErro(translateError(err.message || 'Erro ao exportar dados.'));
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
      setImportErro(translateError(err.message || 'Erro ao importar backup.'));
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
        setDeleteErro(translateError(err.message || 'Não foi possível excluir sua conta. Tente novamente.'));
      }
    } finally {
      setDeletando(false);
    }
  };

  if (!user) {
    return <div className="p-6 text-sm text-muted2">Carregando configurações...</div>;
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">

      <h1 className="text-2xl font-semibold text-text">Configurações da Conta</h1>

      {/* ── Dados Pessoais ─────────────────────────────────── */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Dados Pessoais</h2>
        <form onSubmit={handleSalvarDados} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Nome"
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
            />
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
            />
          </div>

          {dadosErro && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{dadosErro}</p>}
          {dadosSucesso && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{dadosSucesso}</p>}

          <div>
            <Button type="submit" disabled={salvandoDados}>
              {salvandoDados ? 'Salvando...' : 'Salvar Dados Pessoais'}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Alterar Senha ──────────────────────────────────── */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Alterar Senha</h2>
        <form onSubmit={handleAlterarSenha} className="flex flex-col gap-4">
          <Input
            label="Senha Atual"
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            placeholder="Digite sua senha atual"
          />
          <Input
            label="Nova Senha"
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Mínimo 6 caracteres"
          />
          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            placeholder="Repita a nova senha"
          />

          {senhaErro && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{senhaErro}</p>}
          {senhaSucesso && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{senhaSucesso}</p>}

          <div>
            <Button type="submit" disabled={salvandoSenha}>
              {salvandoSenha ? 'Verificando...' : 'Alterar Senha'}
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Preferências ──────────────────────────────────── */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Preferências</h2>

        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-text">
            Tooltips informativos no Dashboard
            <span className="mt-0.5 block text-xs text-muted2">
              Exibe ícones ⓘ com explicações nos cards do Dashboard.
            </span>
          </span>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              checked={tooltipsEnabled}
              onChange={handleToggleTooltips}
              className="peer sr-only"
            />
            <span className="h-6 w-11 rounded-full bg-surface2 transition-colors peer-checked:bg-primary" />
            <span className="absolute left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
          </label>
        </div>
      </Card>

      {/* ── Privacidade e Dados ────────────────────────────── */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-text">Privacidade e Dados</h2>

        <p className="mb-4 text-sm text-muted2">
          Exporte todos os seus dados em um arquivo JSON (contas, categorias, lançamentos e checklist).
        </p>

        <Button type="button" onClick={handleExportarDados} disabled={exportando} className="mb-6">
          {exportando ? 'Exportando...' : 'Exportar Meus Dados'}
        </Button>

        {exportErro && <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{exportErro}</p>}

        <p className="mb-4 text-sm text-muted2">
          Restaure um backup JSON exportado anteriormente. Os dados importados serão adicionados aos dados existentes.
        </p>

        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportarBackup}
        />

        <Button
          type="button"
          onClick={() => importInputRef.current?.click()}
          disabled={importando}
          className="mb-6"
        >
          {importando ? 'Importando...' : 'Importar Backup'}
        </Button>

        {importErro && <p className="mb-4 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{importErro}</p>}
        {importSucesso && <p className="mb-4 rounded-md bg-success/10 px-3 py-2 text-sm text-success">{importSucesso}</p>}

        <p className="mb-2 text-sm text-muted2">
          Esta ação removerá permanentemente todos os seus dados do FinHawk:
        </p>
        <ul className="mb-5 list-disc pl-5 text-sm leading-relaxed text-muted2">
          <li>Contas</li>
          <li>Categorias</li>
          <li>Lançamentos</li>
          <li>Checklist</li>
          <li>Histórico</li>
        </ul>

        <Button type="button" variant="danger" onClick={handleAbrirModalExclusao}>
          Excluir Minha Conta
        </Button>
      </Card>

      {/* ── Modal de confirmação de exclusão ─────────────────── */}
      <Modal isOpen={showDeleteModal} onClose={handleFecharModalExclusao} title="Excluir Conta">
        {deleteSuccess ? (
          <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">
            Sua conta foi removida com sucesso. Redirecionando...
          </p>
        ) : (
          <>
            <p className="text-sm text-muted2">
              Esta ação é permanente. Todos os seus dados serão removidos e não poderão ser recuperados.
            </p>
            <p className="mb-4 mt-2 text-sm text-muted2">
              Digite seu e-mail para confirmar.
            </p>

            <Input
              label="E-mail de confirmação"
              type="email"
              value={emailConfirmacao}
              onChange={(e) => setEmailConfirmacao(e.target.value)}
              placeholder={user.email}
              disabled={deletando}
              autoComplete="off"
            />

            {deleteErro && (
              <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{deleteErro}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={handleFecharModalExclusao} disabled={deletando}>
                Cancelar
              </Button>
              <Button type="button" variant="danger" onClick={handleExcluirConta} disabled={deletando}>
                {deletando ? 'Excluindo...' : 'Excluir Conta'}
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Configuracoes;
