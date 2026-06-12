import React, { useState, useCallback } from 'react';
import FormularioTransacao from '../../componentes/FormularioTransacao';
import ListaTitulo from '../../componentes/ListaTitulo';

const CadastroTitulo = () => {
    const [tituloParaEditar, setTituloParaEditar] = useState(null);
    const [refreshList, setRefreshList] = useState(false);
    const [tipoTransacao, setTipoTransacao] = useState('todos');
    const [accountId] = useState(() => localStorage.getItem('accountId'));

    const handleEdit = useCallback((titulo) => {
        setTituloParaEditar(titulo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSave = useCallback(() => {
        setTituloParaEditar(null);
        setRefreshList(prev => !prev);
    }, []);

    const handleCancel = useCallback(() => {
        setTituloParaEditar(null);
    }, []);

    const handleTipoTransacao = (tipo) => {
        setTipoTransacao(prevTipo => prevTipo === tipo ? 'todos' : tipo);
    };

    return (
    <div className="cadastro-titulo-vertical">

        <div className="fh-page-header">
            <h1 className="fh-title">
                Cadastro de <span>Títulos</span>
            </h1>

            <p className="fh-subtitle">
                Gerencie recebimentos e pagamentos da conta selecionada.
            </p>
        </div>

        <div className="secao-superior">
            <FormularioTransacao
                tituloParaEditar={tituloParaEditar}
                onSave={handleSave}
                onCancel={handleCancel}
                tipoTransacao={tipoTransacao}
            />
        </div>

        <div className="historico-container">
            <h2 className="historico-titulo">
                Histórico de Lançamentos
            </h2>

            <div className="botoes-filtro-container">
                ...
            </div>

            <ListaTitulo
                key={accountId}
                accountId={accountId}
                onEdit={handleEdit}
                refresh={refreshList}
                tipoTransacao={tipoTransacao}
            />
        </div>

    </div>
);
};

export default CadastroTitulo;