import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faRotate } from '@fortawesome/free-solid-svg-icons';
import './listaTitulo.css';

const ListaTitulo = ({ onEdit, refresh, tipoTransacao }) => {
    const [titulos, setTitulos] = useState([]);
    const [error, setError] = useState(null);
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');

    const fetchTitulos = async () => {
        try {
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('accountId');

            if (!token) {
                setError('Token não encontrado.');
                return;
            }

            let url = `${import.meta.env.VITE_API_URL}/bill`;
            if (accountId) {
                url += `?accountId=${accountId}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Erro ao buscar títulos');
            }

            const data = await response.json();
            console.log('Títulos recebidos:', data);
            setTitulos(data);
        } catch (error) {
            setError(error.message);
            console.error('Erro:', error);
        }
    };

    useEffect(() => {
        fetchTitulos();
    }, [refresh]);

    const handleDelete = async (id) => {
        if (window.confirm('Tem certeza que deseja excluir este item?')) {
            try {
                const token = localStorage.getItem('token');

                const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Erro ao excluir item');
                }

                setTitulos((prevTitulos) => prevTitulos.filter(item => item.id !== id));
            } catch (error) {
                console.error('Erro ao excluir item:', error);
                setError(error.message);
            }
        }
    };

    const handleEdit = (id) => {
        const tituloParaEditar = titulos.find(titulo => titulo.id === id);
        if (tituloParaEditar) {
            onEdit(tituloParaEditar);
        }
    };

    const filteredData = titulos.filter((item) => {
        const itemVenc = new Date(item.maturity);
        if (itemVenc) itemVenc.setHours(0, 0, 0, 0);

        const startDate = filterStartDate ? new Date(filterStartDate) : null;
        if (startDate) startDate.setHours(0, 0, 0, 0);

        const endDate = filterEndDate ? new Date(filterEndDate) : null;
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const dateMatch = (!startDate || itemVenc >= startDate) && (!endDate || itemVenc <= endDate);


        let typeMatch = true;
        const catType = item.category?.type?.toLowerCase();

        if (tipoTransacao === 'recebimentos') {
            typeMatch = catType === 'receipt';
        } else if (tipoTransacao === 'pagamentos') {
            typeMatch = catType === 'payment';
        }

        return dateMatch && typeMatch;
    });

    const formatarValor = (valor) => {
        if (valor === undefined || valor === null) return 'R$ 0,00';
        return Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    const traduzirStatus = (status) => {
        const mapa = {
            'PENDING': 'Pendente',
            'PAID': 'Pago',
            'RECEIVED': 'Recebido'
        };
        return mapa[status] || status;
    };

    const traduzirTipo = (type) => {
        if (type?.toLowerCase() === 'receipt') return 'Recebimento';
        if (type?.toLowerCase() === 'payment') return 'Pagamento';
        return type;
    }

    return (
        <div className="table-container">
            <div className="filtros-historico">
                <div className="filtro-periodo">
                    <div className="campo-filtro">
                        <label>De:</label>
                        <input
                            type="date"
                            value={filterStartDate}
                            onChange={(e) => setFilterStartDate(e.target.value)}
                        />
                    </div>
                    <div className="campo-filtro">
                        <label>Até:</label>
                        <input
                            type="date"
                            value={filterEndDate}
                            onChange={(e) => setFilterEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <button className="botao-filtrar" onClick={fetchTitulos}>
                    <FontAwesomeIcon icon={faRotate} /> Atualizar
                </button>
            </div>

            <table className="table table-hover">
                <thead>
                    <tr>
                        <th scope="col">ID</th>
                        <th scope="col">Descrição</th>
                        <th scope="col">Tipo Trans.</th>
                        <th scope="col">Data Emissão</th>
                        <th scope="col">Venc.</th>
                        <th scope="col">Categoria</th>
                        <th scope="col">Valor (R$)</th>
                        <th scope="col">Parcela</th>
                        <th scope="col">Status</th>
                        <th scope="col">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item) => (
                        <tr key={item.id}>
                            <td>{item.id}</td>

                            <td>{item.description}</td>

                            <td>{traduzirTipo(item.category?.type)}</td>

                            <td>{new Date(item.emission).toLocaleDateString('pt-BR')}</td>
                            <td>{new Date(item.maturity).toLocaleDateString('pt-BR')}</td>

                            <td>{item.category?.name}</td>

                            <td className={item.category?.type?.toLowerCase() === 'payment' ? 'valor-saida' : 'valor-entrada'}>
                                {formatarValor(item.value)}
                            </td>

                            <td>{item.parcelNumber}</td>

                            <td>{traduzirStatus(item.status)}</td>

                            <td>
                                <FontAwesomeIcon
                                    icon={faEdit}
                                    className="action-icon edit"
                                    onClick={() => handleEdit(item.id)}
                                    title="Editar"
                                />
                                <FontAwesomeIcon
                                    icon={faTrash}
                                    className="action-icon delete"
                                    onClick={() => handleDelete(item.id)}
                                    title="Excluir"
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ListaTitulo;