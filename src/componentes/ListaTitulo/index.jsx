import { useEffect, useState, useCallback } from 'react';
import { FaEdit, FaTrash, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { api } from '../../services/api';
import { translateError } from '../../utils/errorMessages';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Table from '../ui/Table';
import Modal from '../ui/Modal';
import Select from '../ui/Select';

const STATUS_BADGE_VARIANT = {
    PAID: 'success',
    RECEIVED: 'success',
    PENDING: 'warning',
};

const ListaTitulo = ({ accountId, tipoTransacao, onEdit, refresh, busca = '' }) => {
    const [titulos, setTitulos] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const [statusEdit, setStatusEdit] = useState({ open: false, id: null, value: 'PENDING', type: null });
    const [savingStatus, setSavingStatus] = useState(false);
    const [statusErro, setStatusErro] = useState('');

    const handleDelete = useCallback(async (id) => {
        if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;

        try {
            const response = await api.delete(`/bill/${id}`);

            if (response.ok) {
                setTitulos(prev => prev.filter(titulo => titulo.id !== id));
            } else {
                setError("Erro ao excluir lançamento.");
            }
        } catch (err) {
            console.error("Erro ao excluir:", err);
        }
    }, []);

    const fetchTitulos = useCallback(async () => {
        if (!accountId) {
            setTitulos([]);
            setError('Nenhuma conta selecionada');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await api.get(`/bill/account/${accountId}`);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erro ao buscar lançamentos');
            }

            const data = await response.json();
            setTitulos(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(translateError(err.message));
            console.error('❌ ERRO:', err);
        } finally {
            setLoading(false);
        }
    }, [accountId]);

    useEffect(() => {
        fetchTitulos();
    }, [fetchTitulos, refresh]);

    const termoBusca = busca.trim().toLowerCase();
    const titulosFiltrados = titulos.filter(titulo => {
        const tipoCategoria = titulo.category?.type?.toLowerCase();

        if (tipoTransacao === 'recebimentos' && tipoCategoria !== 'receipt') return false;
        if (tipoTransacao === 'pagamentos' && tipoCategoria !== 'payment') return false;
        if (termoBusca && !titulo.description?.toLowerCase().includes(termoBusca)) return false;

        return true;
    });

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

    const fecharEdicaoStatus = () => {
        setStatusEdit({ open: false, id: null, value: 'PENDING', type: null });
        setStatusErro('');
    };

    const salvarStatus = async () => {
        if (!statusEdit.id) return;

        try {
            setSavingStatus(true);

            const response = await api.patch(`/bill/${statusEdit.id}/status`, { status: statusEdit.value });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Erro ao atualizar status.');
            }

            setTitulos(prev => prev.map(t => t.id === statusEdit.id ? { ...t, status: statusEdit.value } : t));
            fecharEdicaoStatus();
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            setStatusErro(translateError(err.message));
        } finally {
            setSavingStatus(false);
        }
    };

    const filtersActive = tipoTransacao !== 'todos' || busca.trim() !== '';

    const columns = [
        { header: 'ID', render: (t) => `#${t.id}` },
        {
            header: 'Descrição',
            render: (titulo) => (
                <div>
                    <div className="text-text">{titulo.description}</div>
                    <div className="mt-0.5 flex flex-col text-xs text-muted">
                        {titulo.createdAt && <span>Criado: {formatarData(titulo.createdAt.split('T')[0])}</span>}
                        {titulo.updatedAt && <span>Atualizado: {formatarData(titulo.updatedAt.split('T')[0])}</span>}
                        {titulo.paidAt && <span>Pago em: {formatarData(titulo.paidAt.split('T')[0])}</span>}
                        {titulo.receivedAt && <span>Recebido em: {formatarData(titulo.receivedAt.split('T')[0])}</span>}
                    </div>
                </div>
            ),
        },
        {
            header: 'Tipo',
            render: (titulo) => {
                const isDespesa = titulo.category?.type?.toLowerCase() === 'payment';
                return <span className={isDespesa ? 'text-danger' : 'text-success'}>{traduzirTipo(titulo.category?.type)}</span>;
            },
        },
        { header: 'Categoria', render: (t) => t.category?.name || '-' },
        { header: 'Vencimento', render: (t) => formatarData(t.maturity) },
        {
            header: 'Valor',
            render: (titulo) => {
                const isDespesa = titulo.category?.type?.toLowerCase() === 'payment';
                return (
                    <span className={isDespesa ? 'text-danger' : 'text-success'}>
                        {formatarValor(titulo.installmentAmount)}
                    </span>
                );
            },
        },
        { header: 'Parcela', render: (t) => `${t.currentInstallment || 1}/${t.installmentCount || 1}` },
        {
            header: 'Status',
            render: (titulo) => (
                <button
                    type="button"
                    title="Clique para editar o status"
                    onClick={() => abrirEdicaoStatus(titulo)}
                >
                    <Badge variant={STATUS_BADGE_VARIANT[titulo.status] || 'neutral'}>
                        {(titulo.status === 'PAID' || titulo.status === 'RECEIVED') && <FaCheckCircle className="mr-1 inline" />}
                        {titulo.status === 'PENDING' && <FaClock className="mr-1 inline" />}
                        {traduzirStatus(titulo.status)}
                    </Badge>
                </button>
            ),
        },
        {
            header: 'Ações',
            render: (titulo) => (
                <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onEdit(titulo)} title="Editar">
                        <FaEdit />
                    </Button>
                    <Button size="sm" variant="danger" onClick={() => handleDelete(titulo.id)} title="Excluir">
                        <FaTrash />
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) return <p className="text-sm text-muted2">⏳ Carregando...</p>;

    return (
        <div>
            {error && (
                <p className="mb-4 flex items-center gap-2 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">
                    <FaExclamationCircle /> {error}
                </p>
            )}

            <Table
                columns={columns}
                data={titulosFiltrados}
                rowKey={(t) => t.id}
                emptyMessage={
                    titulos.length === 0
                        ? "Nenhum lançamento cadastrado. Use o formulário acima para criar o primeiro."
                        : filtersActive
                            ? "Nenhum resultado para os filtros selecionados."
                            : "Nenhum lançamento encontrado."
                }
            />

            <Modal isOpen={statusEdit.open} onClose={fecharEdicaoStatus} title="Alterar status">
                <Select
                    value={statusEdit.value}
                    onChange={(e) => setStatusEdit(prev => ({ ...prev, value: e.target.value }))}
                    disabled={savingStatus}
                    options={getStatusOptions(statusEdit.type)}
                />

                {statusErro && (
                    <p className="mt-3 rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{statusErro}</p>
                )}

                <div className="mt-5 flex justify-end gap-3">
                    <Button variant="outline" onClick={fecharEdicaoStatus} disabled={savingStatus}>
                        Cancelar
                    </Button>
                    <Button onClick={salvarStatus} disabled={savingStatus}>
                        {savingStatus ? 'Salvando...' : 'Salvar'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default ListaTitulo;
