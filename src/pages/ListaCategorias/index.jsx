import React, { useState, useEffect, useCallback } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { api } from '../../services/api';

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
            setError(err.message);
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
            setError(err.message);
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

    return (
        <>
            <div style={{ marginBottom: 12 }}>
                <input
                    type="text"
                    className="fh-search-input"
                    placeholder="Buscar categoria..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                />
            </div>
            <div className="botoes-tipo-container">
                <button
                    className={`fh-btn ${tipoFiltro === 'receipt' ? 'fh-btn-primary' : 'fh-btn-secondary'}`}
                    onClick={() => setTipoFiltro(prev => prev === 'receipt' ? 'todos' : 'receipt')}
                    type="button"
                >
                    Recebimentos
                </button>

                <button
                    className={`fh-btn ${tipoFiltro === 'payment' ? 'fh-btn-primary' : 'fh-btn-secondary'}`}
                    onClick={() => setTipoFiltro(prev => prev === 'payment' ? 'todos' : 'payment')}
                    type="button"
                >
                    Pagamentos
                </button>
            </div>

            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome da Categoria</th>
                            <th>Tipo</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((categoria) => (
                            <tr key={categoria.id}>
                                <td>{categoria.id}</td>
                                <td>{categoria.name}</td>
                                <td>{traduzirTipo(categoria.type)}</td>
                                <td className="coluna-acoes">
                                    <button
                                        className="fh-btn fh-btn-secondary fh-btn-sm"
                                        title="Editar categoria"
                                        onClick={() => onEdit(categoria)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="fh-btn fh-btn-danger fh-btn-sm"
                                        title="Excluir categoria"
                                        onClick={() => handleDelete(categoria)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {loading && <div className="loading">Carregando...</div>}

                {!loading && filteredData.length === 0 && !error && (
                    <div className="lista-vazia">
                        {dados.length === 0
                            ? "Nenhuma categoria cadastrada ainda. Use o formulário acima para criar sua primeira."
                            : "Nenhuma categoria do tipo selecionado."}
                    </div>
                )}

                {error && <p className="erro-mensagem">{error}</p>}
            </div>
        </>
    );
};

export default ListaCategorias;
