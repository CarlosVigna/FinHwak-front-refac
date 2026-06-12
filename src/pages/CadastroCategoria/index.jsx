import React, { useState } from 'react';
import { api } from '../../services/api';
import FormularioCategoria from '../../componentes/FormularioCategoria';
import ListaCategorias from '../ListaCategorias';

const CadastroCategoria = () => {
  const [valores, setValores] = useState({
    name: '',
    type: 'RECEIPT',
  });

  const [erro, setErro] = useState('');
  const [refresh, setRefresh] = useState(false);
  const [sucesso, setSucesso] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValores({
      ...valores,
      [name]: value,
    });
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

    const novaCategoria = {
      name,
      type,
      accountId: Number(accountId),
    };

    try {
      const response = await api.post('/category', novaCategoria);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Erro ao cadastrar categoria');
      }

      await response.json();

      setValores({
        name: '',
        type: 'RECEIPT',
      });

      setErro('');
      setSucesso('Categoria cadastrada com sucesso!');
      setRefresh((prev) => !prev);

      setTimeout(() => {
        setSucesso('');
      }, 3000);
    } catch (error) {
      console.error('Erro ao cadastrar categoria:', error);
      setErro(error.message || 'Erro ao cadastrar categoria.');
      setSucesso('');
    }
  };

  return (
    <div className="cadastro-categoria-vertical">
      <div className="secao-superior">
        <h2>Cadastrar Nova Categoria</h2>
        <FormularioCategoria
          valores={valores}
          handleInputChange={handleInputChange}
          onSubmit={handleCadastro}
          erro={erro}
          sucesso={sucesso}
        />
      </div>

      <div className="historico-container">
        <h2 className="historico-titulo">Categorias Cadastradas</h2>
        <ListaCategorias refresh={refresh} />
      </div>
    </div>
  );
};

export default CadastroCategoria;
