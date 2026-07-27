import { useState, useCallback } from 'react';
import FormularioTransacao from '../../componentes/FormularioTransacao';
import ListaTitulo from '../../componentes/ListaTitulo';
import Button from '../../componentes/ui/Button';
import Input from '../../componentes/ui/Input';
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
    <div className="flex flex-col gap-6">

        <div>
            <h1 className="text-2xl font-semibold text-text">Cadastro de Títulos</h1>
            <p className="mt-1 text-sm text-muted2">
                Gerencie recebimentos e pagamentos da conta selecionada.
            </p>
        </div>

        <div>
            <FormularioTransacao
                tituloParaEditar={tituloParaEditar}
                onSave={handleSave}
                onCancel={handleCancel}
                tipoTransacao={tipoTransacao}
            />
        </div>

        <div>
            <h2 className="mb-3 text-lg font-semibold text-text">
                Histórico de Lançamentos
            </h2>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant={tipoTransacao === 'todos' ? 'primary' : 'ghost'}
                        onClick={() => handleTipoTransacao('todos')}
                        type="button"
                    >
                        Todos
                    </Button>
                    <Button
                        size="sm"
                        variant={tipoTransacao === 'recebimentos' ? 'primary' : 'ghost'}
                        onClick={() => handleTipoTransacao('recebimentos')}
                        type="button"
                    >
                        Recebimentos
                    </Button>
                    <Button
                        size="sm"
                        variant={tipoTransacao === 'pagamentos' ? 'primary' : 'ghost'}
                        onClick={() => handleTipoTransacao('pagamentos')}
                        type="button"
                    >
                        Pagamentos
                    </Button>
                </div>

                <Input
                    type="text"
                    placeholder="Buscar por descrição..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="max-w-xs"
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
