import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import FormularioCategoria from '../../componentes/FormularioCategoria';
import ListaCategorias from '../ListaCategorias';

const VALORES_VAZIOS = { name: '', type: 'RECEIPT' };

const CadastroCategoria = () => {
  const location = useLocation();
  const fromNewAccount = !!location.state?.fromNewAccount;

  const [valores, setValores] = useState(VALORES_VAZIOS);
  const [categoriaParaEditar, setCategoriaParaEditar] = useState(null);
  const [erro, setErro] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [sucesso, setSucesso] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValores((prev) => ({ ...prev, [name]: value }));
  };

  const handleEdit = (categoria) => {
    setCategoriaParaEditar(categoria);
    setValores({ name: categoria.name, type: categoria.type });
    setErro('');
    setSucesso('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancel = () => {
    setCategoriaParaEditar(null);
    setValores(VALORES_VAZIOS);
    setErro('');
    setSucesso('');
  };

  const handleCadastro = async (e) => {
    e.preventDefault();

    const { name, type } = valores;

    if (!name) {
      setErro('O nome da categoria é obrigatório.');
      return;
    }

    const accountId = localStorage.getItem('accountId');

    if (!accountId) {
      setErro('Erro: Conta não identificada. Volte e selecione uma conta.');
      return;
    }

    try {
      let response;

      if (categoriaParaEditar) {
        const payload = { name, type, accountId: Number(accountId) };
        response = await api.put(`/category/${categoriaParaEditar.id}`, payload);
      } else {
        const payload = { name, type, accountId: Number(accountId) };
        response = await api.post('/category', payload);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Erro ao salvar categoria');
      }

      await response.json();

      const msg = categoriaParaEditar
        ? 'Categoria atualizada com sucesso!'
        : 'Categoria cadastrada com sucesso!';

      setCategoriaParaEditar(null);
      setValores(VALORES_VAZIOS);
      setErro('');
      setSucesso(msg);
      setRefresh((prev) => !prev);

      setTimeout(() => setSucesso(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar categoria:', error);
      setErro(error.message || 'Erro ao salvar categoria.');
      setSucesso('');
    }
  };

  return (
    <div className="cadastro-categoria-vertical">
      <div className="fh-page-header">
        <h1 className="fh-title">Cadastro de <span>Categorias</span></h1>
        <p className="fh-subtitle">Organize seus lançamentos por categoria de receita ou despesa.</p>
      </div>

      {fromNewAccount && (
        <div className="banner-guiado">
          <strong>Conta criada com sucesso!</strong>
          <p>Agora cadastre uma categoria para começar a registrar seus lançamentos.</p>
        </div>
      )}

      <div className="secao-superior">
        <h2>{categoriaParaEditar ? 'Editar Categoria' : 'Cadastrar Nova Categoria'}</h2>
        <FormularioCategoria
          valores={valores}
          handleInputChange={handleInputChange}
          onSubmit={handleCadastro}
          erro={erro}
          sucesso={sucesso}
          editando={!!categoriaParaEditar}
          onCancel={handleCancel}
        />
      </div>

      <div className="historico-container">
        <h2 className="historico-titulo">Categorias Cadastradas</h2>
        <ListaCategorias refresh={refresh} onEdit={handleEdit} />
      </div>
    </div>
  );
};

export default CadastroCategoria;
