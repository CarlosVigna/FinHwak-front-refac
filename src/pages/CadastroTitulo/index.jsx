import React, { useState, useCallback } from 'react';
import FormularioTransacao from '../../componentes/FormularioTransacao';
import ListaTitulo from '../../componentes/ListaTitulo';
import { useAccount } from '../../contexts/AccountContext';

const CadastroTitulo = () => {
    const [tituloParaEditar, setTituloParaEditar] = useState(null);
    const [refreshList, setRefreshList] = useState(false);
    const [tipoTransacao, setTipoTransacao] = useState('todos');
    const [busca, setBusca] = useState('');
    const { accountId } = useAccount();

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
                <div className="filtro-tipo">
                    <button
                        className={`fh-btn fh-btn-sm ${tipoTransacao === 'todos' ? 'fh-btn-primary' : 'fh-btn-ghost'}`}
                        onClick={() => handleTipoTransacao('todos')}
                        type="button"
                    >
                        Todos
                    </button>
                    <button
                        className={`fh-btn fh-btn-sm ${tipoTransacao === 'recebimentos' ? 'fh-btn-primary' : 'fh-btn-ghost'}`}
                        onClick={() => handleTipoTransacao('recebimentos')}
                        type="button"
                    >
                        Recebimentos
                    </button>
                    <button
                        className={`fh-btn fh-btn-sm ${tipoTransacao === 'pagamentos' ? 'fh-btn-primary' : 'fh-btn-ghost'}`}
                        onClick={() => handleTipoTransacao('pagamentos')}
                        type="button"
                    >
                        Pagamentos
                    </button>
                </div>

                <input
                    className="input-busca-titulo"
                    type="text"
                    placeholder="Buscar por descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>

            <ListaTitulo
                key={accountId}
                accountId={accountId}
                onEdit={handleEdit}
                refresh={refreshList}
                tipoTransacao={tipoTransacao}
                busca={busca}
            />
        </div>

    </div>
);
};

export default CadastroTitulo;