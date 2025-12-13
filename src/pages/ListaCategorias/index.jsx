import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faRotate } from '@fortawesome/free-solid-svg-icons';
import './listaCategorias.css';

const ListaCategorias = ({ refresh }) => {
    const [dados, setDados] = useState([]);
    const [tipoFiltro, setTipoFiltro] = useState('todos'); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDados = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token não encontrado. Faça login novamente.');
            }
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar categorias');
            }
            
            const data = await response.json();
            setDados(data);
            setError(null);
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        console.log('Atualizando lista de categorias...');
        fetchDados();
    }, [refresh, fetchDados]);

    const filteredData = dados.filter((categoria) => {
        if (tipoFiltro === 'todos') return true;
        return categoria.type?.toLowerCase() === tipoFiltro.toLowerCase();
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
            <div className="botoes-tipo-container">
                <button
                    className={`botao-tipo ${tipoFiltro === 'receipt' ? 'ativo' : ''}`}
                    onClick={() => setTipoFiltro(prev => prev === 'receipt' ? 'todos' : 'receipt')}
                >
                    Recebimentos
                </button>
                <button
                    className={`botao-tipo ${tipoFiltro === 'payment' ? 'ativo' : ''}`}
                    onClick={() => setTipoFiltro(prev => prev === 'payment' ? 'todos' : 'payment')}
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
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((categoria) => (
                            <tr key={categoria.id}>
                                <td>{categoria.id}</td>
                                <td>{categoria.name}</td>
                                <td>{traduzirTipo(categoria.type)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {loading && <div className="loading">Carregando...</div>}
                
                {!loading && filteredData.length === 0 && !error && (
                    <div className="lista-vazia">Nenhuma categoria encontrada.</div>
                )}

                {error && <p className="erro-mensagem">{error}</p>}
            </div>
        </>
    );
};

export default ListaCategorias;