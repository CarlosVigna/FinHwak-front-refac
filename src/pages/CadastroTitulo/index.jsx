import React, { useState, useCallback, useEffect } from 'react';
import FormularioTransacao from '../../componentes/FormularioTransacao';
import ListaTitulo from '../../componentes/ListaTitulo';

const CadastroTitulo = () => {
    const [tituloParaEditar, setTituloParaEditar] = useState(null);
    const [refreshList, setRefreshList] = useState(false);
    const [tipoTransacao, setTipoTransacao] = useState('todos');
    const [accountId, setAccountId] = useState(null);
    const [filtroData, setFiltroData] = useState({
        dataInicio: '',
        dataFim: ''
    });

    // ✅ Monitora mudanças no accountId do localStorage
    useEffect(() => {
        const currentAccountId = localStorage.getItem('accountId');
        console.log('🔑 Account ID atual:', currentAccountId);
        setAccountId(currentAccountId);
    }, []);

    // ✅ Polling para detectar mudança de conta
    useEffect(() => {
        const interval = setInterval(() => {
            const currentAccountId = localStorage.getItem('accountId');
            if (currentAccountId !== accountId) {
                console.log('🔄 Conta mudou de', accountId, 'para', currentAccountId);
                setAccountId(currentAccountId);
                setRefreshList(prev => !prev);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [accountId]);

    const handleEdit = useCallback((titulo) => {
        console.log('Iniciando edição do título:', titulo);
        setTituloParaEditar(titulo);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleSave = useCallback(() => {
        console.log('Salvando alterações...');
        setTituloParaEditar(null);
        setRefreshList(prev => !prev);
    }, []);

    const handleCancel = useCallback(() => {
        setTituloParaEditar(null);
    }, []);

    const handleTipoTransacao = (tipo) => {
        setTipoTransacao(prevTipo => prevTipo === tipo ? 'todos' : tipo);
    };

    const handleFiltroData = (e) => {
        const { name, value } = e.target;
        setFiltroData(prev => ({
            ...prev,
            [name]: value
        }));
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
                filtroData={filtroData}
            />
        </div>

    </div>
);
};

export default CadastroTitulo;