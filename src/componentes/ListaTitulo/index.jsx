import React, { useEffect, useState, useCallback } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import './listaTitulo.css';

const ListaTitulo = ({ accountId, tipoTransacao, filtroData, onEdit, refresh }) => {
    const [titulos, setTitulos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // ✅ ADICIONADO: estados que estavam faltando (era isso que causava statusEdit is not defined)
    const [statusEdit, setStatusEdit] = useState({ open: false, id: null, value: 'PENDING', type: null });
    const [savingStatus, setSavingStatus] = useState(false);

    console.log("DEBUG: AccountID recebido:", accountId);
    console.log("DEBUG: Tipo Transação:", tipoTransacao);

    // Deleta um título
    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.ok) {
                setTitulos(prev => prev.filter(titulo => titulo.id !== id));
            } else {
                alert("Erro ao excluir lançamento.");
            }
        } catch (err) {
            console.error("Erro ao excluir:", err);
        }
    }, []);

    // Busca os títulos da conta
    const fetchTitulos = useCallback(async () => {
        if (!accountId) {
            setTitulos([]);
            setError('Nenhuma conta selecionada');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Usuário não autenticado.');

            const url = `${import.meta.env.VITE_API_URL}/bill/account/${accountId}`;
            console.log('🌐 Requisição para URL:', url);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erro ao buscar lançamentos');
            }

            const data = await response.json();
            setTitulos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
            console.error('❌ ERRO:', err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        fetchTitulos();
    }, [fetchTitulos, refresh]);

    // Filtra por tipo de transação
    const titulosFiltrados = titulos.filter(titulo => {
        if (tipoTransacao === 'todos') return true;

        const tipoCategoria = titulo.category?.type?.toLowerCase();

        if (tipoTransacao === 'recebimentos') return tipoCategoria === 'receipt';
        if (tipoTransacao === 'pagamentos') return tipoCategoria === 'payment';
        return true;
    });

    console.log('📊 Títulos totais:', titulos.length);
    console.log('📊 Títulos filtrados:', titulosFiltrados.length);

    // Funções auxiliares
    const formatarData = (dataISO) => {
        if (!dataISO) return '-';
        const [ano, mes, dia] = String(dataISO).split('-');
        if (!ano || !mes || !dia) return String(dataISO);
        return `${dia}/${mes}/${ano}`;
    };

    const formatarValor = (valor) => {
        const num = typeof valor === 'string' ? parseFloat(valor) : Number(valor);
        if (isNaN(num)) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    const traduzirStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'Pendente';
            case 'PAID': return 'Pago';
            case 'RECEIVED': return 'Recebido';
            default: return status;
        }
    };

    const traduzirTipo = (type) => {
        if (!type) return '-';
        const tipoNormalizado = String(type).toUpperCase();
        if (tipoNormalizado === 'PAYMENT') return 'Pagamento';
        if (tipoNormalizado === 'RECEIPT') return 'Recebimento';
        return type;
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'PAID':
            case 'RECEIVED': return 'status-pago';
            case 'PENDING': return 'status-pendente';
            default: return '';
        }
    };

    // ===== Status inline (modal)

    const getStatusOptions = (billType) => {
        const t = String(billType || '').toUpperCase();
        if (t === 'PAYMENT') return [
            { value: 'PENDING', label: 'Pendente' },
            { value: 'PAID', label: 'Pago' },
        ];
        if (t === 'RECEIPT') return [
            { value: 'PENDING', label: 'Pendente' },
            { value: 'RECEIVED', label: 'Recebido' },
        ];
        return [
            { value: 'PENDING', label: 'Pendente' },
            { value: 'PAID', label: 'Pago' },
            { value: 'RECEIVED', label: 'Recebido' },
        ];
    };

    const abrirEdicaoStatus = (titulo) => {
        const billType = titulo.category?.type ? String(titulo.category.type).toUpperCase() : null;
        setStatusEdit({
            open: true,
            id: titulo.id,
            value: titulo.status || 'PENDING',
            type: billType
        });
    };

    const fecharEdicaoStatus = () => setStatusEdit({ open: false, id: null, value: 'PENDING', type: null });

    const salvarStatus = async () => {
        if (!statusEdit.id) return;

        try {
            setSavingStatus(true);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Usuário não autenticado.');

            const titulo = titulos.find(t => t.id === statusEdit.id);
            if (!titulo) throw new Error('Lançamento não encontrado.');

            // ✅ Backend exige BillRequestDTO completo
            const payload = {
                description: titulo.description,
                emission: titulo.emission,
                maturity: titulo.maturity,
                installmentAmount: Number(titulo.installmentAmount) || 0,
                installmentCount: Number(titulo.installmentCount) || 1,
                periodicity: titulo.periodicity || 'MONTHLY',
                status: statusEdit.value,
                categoryId: Number(titulo.category?.id || titulo.categoryId),
                accountId: Number(accountId),
            };

            if (!payload.categoryId) {
                throw new Error('categoryId não encontrado no título (category.id).');
            }

            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${titulo.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erro ao atualizar status.');
            }

            // Atualiza na tabela sem precisar recarregar tudo
            setTitulos(prev => prev.map(t => t.id === titulo.id ? { ...t, status: statusEdit.value } : t));
            fecharEdicaoStatus();
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            alert(`Erro ao atualizar status: ${err.message}`);
        } finally {
            setSavingStatus(false);
        }
    };

    if (loading) return <div className="lista-titulo-container">⏳ Carregando...</div>;

    return (
        <div className="lista-titulo-container">
            {error && <div className="mensagem-erro"><FaExclamationCircle /> {error}</div>}

            {titulosFiltrados.length === 0 && !error ? (
                <div className="lista-vazia">
                    <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
                    <p style={{ fontSize: '0.9em', color: '#666' }}>
                        📌 Conta selecionada: <strong>{accountId}</strong>
                    </p>
                </div>
            ) : (
                <div className="tabela-responsiva">
                    <table className="tabela-titulos">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Descrição</th>
                                <th>Tipo</th>
                                <th>Categoria</th>
                                <th>Vencimento</th>
                                <th>Valor</th>
                                <th>Parcela</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {titulosFiltrados.map(titulo => {
                                const tipoCategoria = titulo.category?.type?.toLowerCase();
                                const isDespesa = tipoCategoria === 'payment';

                                return (
                                    <tr key={titulo.id}>
                                        <td data-label="ID">#{titulo.id}</td>
                                        <td data-label="Descrição">{titulo.description}</td>
                                        <td data-label="Tipo" style={{
                                            color: isDespesa ? '#d32f2f' : '#2e7d32',
                                            fontWeight: 'bold'
                                        }}>
                                            {traduzirTipo(titulo.category?.type)}
                                        </td>
                                        <td data-label="Categoria">{titulo.category?.name || '-'}</td>
                                        <td data-label="Vencimento">{formatarData(titulo.maturity)}</td>
                                        <td data-label="Valor" className={isDespesa ? 'valor-saida' : 'valor-entrada'}>
                                            {formatarValor(titulo.installmentAmount)}
                                        </td>
                                        <td data-label="Parcela">{titulo.currentInstallment || 1}/{titulo.installmentCount || 1}</td>
                                        <td data-label="Status">
                                            <span
                                                className={`badge-status ${getStatusClass(titulo.status)}`}
                                                role="button"
                                                tabIndex={0}
                                                title="Clique para editar o status"
                                                onClick={() => abrirEdicaoStatus(titulo)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') abrirEdicaoStatus(titulo);
                                                }}
                                            >
                                                {(titulo.status === 'PAID' || titulo.status === 'RECEIVED') && <FaCheckCircle />}
                                                {titulo.status === 'PENDING' && <FaClock />} {traduzirStatus(titulo.status)}
                                            </span>
                                        </td>
                                        <td data-label="Ações" className="coluna-acoes">
                                            <button className="btn-acao btn-editar" onClick={() => onEdit(titulo)} title="Editar">
                                                <FaEdit />
                                            </button>
                                            <button className="btn-acao btn-excluir" onClick={() => handleDelete(titulo.id)} title="Excluir">
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {statusEdit.open && (
                <div className="status-modal-overlay" onClick={fecharEdicaoStatus}>
                    <div className="status-modal" onClick={(e) => e.stopPropagation()}>
                        <h4>Alterar status</h4>

                        <div className="status-modal-row">
                            <select
                                value={statusEdit.value}
                                onChange={(e) => setStatusEdit(prev => ({ ...prev, value: e.target.value }))}
                                disabled={savingStatus}
                            >
                                {getStatusOptions(statusEdit.type).map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="status-modal-actions">
                            <button className="btn-secundario" onClick={fecharEdicaoStatus} disabled={savingStatus}>
                                Cancelar
                            </button>
                            <button className="btn-primario" onClick={salvarStatus} disabled={savingStatus}>
                                {savingStatus ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ListaTitulo;
