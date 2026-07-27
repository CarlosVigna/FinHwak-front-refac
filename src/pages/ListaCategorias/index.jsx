import { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
import Input from '../../componentes/ui/Input';
import Button from '../../componentes/ui/Button';
import Table from '../../componentes/ui/Table';

const ListaCategorias = ({ refresh, onEdit }) => {
    const [dados, setDados] = useState([]);
    const [tipoFiltro, setTipoFiltro] = useState('todos');
    const [busca, setBusca] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDados = useCallback(async () => {
        setLoading(true);

        try {
            const accountId = localStorage.getItem('accountId');

            if (!accountId) {
                throw new Error('Nenhuma conta selecionada. Volte e escolha uma conta.');
            }

            const response = await api.get(`/category/account/${accountId}`);

            if (!response.ok) {
                throw new Error('Erro ao buscar categorias');
            }

            const data = await response.json();
            setDados(data);
            setError(null);
        } catch (err) {
            console.error('Erro ao buscar dados:', err);
            setError(translateError(err.message));
            setDados([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDados();
    }, [refresh, fetchDados]);

    const handleDelete = async (categoria) => {
        if (!window.confirm(`Excluir a categoria "${categoria.name}"?`)) return;

        try {
            const response = await api.delete(`/category/${categoria.id}`);

            if (!response.ok) {
                throw new Error('Não foi possível excluir esta categoria. Verifique se ela não está vinculada a lançamentos.');
            }

            setDados((prev) => prev.filter((c) => c.id !== categoria.id));
            setError(null);
        } catch (err) {
            setError(translateError(err.message));
        }
    };

    const filteredData = dados.filter((categoria) => {
        const matchTipo = tipoFiltro === 'todos' || categoria.type?.toLowerCase() === tipoFiltro.toLowerCase();
        const matchBusca = !busca || categoria.name.toLowerCase().includes(busca.toLowerCase());
        return matchTipo && matchBusca;
    });

    const traduzirTipo = (tipo) => {
        if (!tipo) return '-';
        const t = tipo.toLowerCase();
        if (t === 'receipt') return 'Recebimento';
        if (t === 'payment') return 'Pagamento';
        return tipo;
    };

    const columns = [
        { header: 'ID', render: (c) => c.id },
        { header: 'Nome da Categoria', render: (c) => c.name },
        { header: 'Tipo', render: (c) => traduzirTipo(c.type) },
        {
            header: 'Ações',
            render: (categoria) => (
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        title="Editar categoria"
                        onClick={() => onEdit(categoria)}
                    >
                        <FaEdit />
                    </Button>
                    <Button
                        size="sm"
                        variant="danger"
                        title="Excluir categoria"
                        onClick={() => handleDelete(categoria)}
                    >
                        <FaTrash />
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-4">
            <Input
                type="text"
                placeholder="Buscar categoria..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
            />

            <div className="flex gap-2">
                <Button
                    size="sm"
                    variant={tipoFiltro === 'receipt' ? 'primary' : 'ghost'}
                    onClick={() => setTipoFiltro(prev => prev === 'receipt' ? 'todos' : 'receipt')}
                    type="button"
                >
                    Recebimentos
                </Button>

                <Button
                    size="sm"
                    variant={tipoFiltro === 'payment' ? 'primary' : 'ghost'}
                    onClick={() => setTipoFiltro(prev => prev === 'payment' ? 'todos' : 'payment')}
                    type="button"
                >
                    Pagamentos
                </Button>
            </div>

            {loading ? (
                <p className="text-sm text-muted2">Carregando...</p>
            ) : (
                <Table
                    columns={columns}
                    data={filteredData}
                    rowKey={(c) => c.id}
                    emptyMessage={
                        dados.length === 0
                            ? "Nenhuma categoria cadastrada ainda. Use o formulário acima para criar sua primeira."
                            : "Nenhuma categoria do tipo selecionado."
                    }
                />
            )}

            {error && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{error}</p>}
        </div>
    );
};

export default ListaCategorias;
