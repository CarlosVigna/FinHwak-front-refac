import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Card from '../ui/Card';

const PERIODICIDADE_OPTIONS = [
    { value: 'MONTHLY', label: 'Mensal' },
    { value: 'BIMONTHLY', label: 'Bimestral' },
    { value: 'QUARTERLY', label: 'Trimestral' },
    { value: 'SEMIANNUAL', label: 'Semestral' },
    { value: 'ANNUAL', label: 'Anual' },
];

const FormularioTransacao = ({ tituloParaEditar, onSave, onCancel, tipoTransacao }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [checklistSuggestion, setChecklistSuggestion] = useState(null);

    const [valores, setValores] = useState({
        description: '',
        emission: '',
        maturity: '',
        installmentAmount: '',
        installmentCount: 1,
        periodicity: 'MONTHLY',
        status: 'PENDING',
        categoryId: '',
        type: 'RECEIPT'
    });

    const [markChecklist, setMarkChecklist] = useState(null);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    useEffect(() => {
        if (tipoTransacao && tipoTransacao !== 'todos' && !tituloParaEditar) {
            const novoTipo = tipoTransacao === 'recebimentos' ? 'RECEIPT' : 'PAYMENT';
            setValores(prev => ({ ...prev, type: novoTipo, categoryId: '' }));
        }
    }, [tipoTransacao, tituloParaEditar]);

    useEffect(() => {
        const fetchCategorias = async () => {
            setLoadingCategorias(true);
            try {
                const accountId = localStorage.getItem('accountId');

                if (!accountId) {
                    setErro("Erro: Conta não identificada.");
                    return;
                }

                const response = await api.get(`/category/account/${accountId}`);

                if (!response.ok) throw new Error('Falha ao carregar categorias.');

                const data = await response.json();
                setCategorias(data);
                setErro('');

            } catch (error) {
                setErro("Erro ao carregar categorias: " + error.message);
            } finally {
                setLoadingCategorias(false);
            }
        };

        fetchCategorias();
    }, [valores.type]);

    useEffect(() => {
        if (tituloParaEditar) {
            setValores({
                description: tituloParaEditar.description || '',
                emission: tituloParaEditar.emission?.split('T')[0] || '',
                maturity: tituloParaEditar.maturity?.split('T')[0] || '',
                installmentAmount: tituloParaEditar.installmentAmount || '',
                installmentCount: tituloParaEditar.installmentCount || 1,
                periodicity: tituloParaEditar.periodicity || 'MONTHLY',
                status: tituloParaEditar.status || 'PENDING',
                categoryId: tituloParaEditar.category?.id || tituloParaEditar.categoryId || '',
                type: tituloParaEditar.category?.type || tituloParaEditar.type || 'RECEIPT'
            });
        }
    }, [tituloParaEditar]);

    // Pre-fill from location.state when navigating from Checklist
    useEffect(() => {
        const state = location?.state;
        if (!state?.fromChecklist || tituloParaEditar) return;
        const today = new Date().toISOString().split('T')[0];
        setValores(prev => ({
            ...prev,
            description: state.description || prev.description,
            maturity: state.dueDate || prev.maturity,
            installmentAmount: state.approximateValue ? String(state.approximateValue) : prev.installmentAmount,
            emission: today,
        }));
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Prefill from checklist suggestion API (overwrites state pre-fill with bill history when available)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const checklistItemId = params.get('checklistItemId') || location?.state?.checklistItemId;

        const fetchSuggestion = async () => {
            try {
                if (!checklistItemId || tituloParaEditar) return;

                const response = await api.get(`/checklist/${checklistItemId}/suggestion`);

                if (!response.ok) {
                    console.warn(`Aviso: código ${response.status} ao buscar sugestão do checklist`);
                    return;
                }

                const suggestion = await response.json();

                const hasData = suggestion && (
                    suggestion.lastAmount || suggestion.lastCategoryId ||
                    suggestion.lastDescription || suggestion.approximateValue
                );

                if (hasData) {
                    const today = new Date().toISOString().split('T')[0];
                    setValores(prev => ({
                        ...prev,
                        installmentAmount: suggestion.lastAmount ?? suggestion.approximateValue ?? prev.installmentAmount,
                        categoryId: suggestion.lastCategoryId ? String(suggestion.lastCategoryId) : prev.categoryId,
                        description: suggestion.lastDescription || prev.description,
                        maturity: suggestion.lastLaunchedAt
                            ? suggestion.lastLaunchedAt.split('T')[0]
                            : (location?.state?.dueDate || today),
                        emission: today
                    }));
                    setChecklistSuggestion(suggestion);
                }
            } catch (err) {
                console.error('Erro ao buscar sugestão do checklist', err);
            }
        };

        fetchSuggestion();
    }, [tituloParaEditar]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValores(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (valores.emission && valores.maturity && valores.emission > valores.maturity) {
            setErro('A data de emissão não pode ser posterior à data de vencimento.');
            return;
        }

        try {
            const accountId = localStorage.getItem('accountId');

            if (!accountId) throw new Error('Conta não identificada. Selecione uma conta novamente.');

            const payload = {
                description: valores.description,
                emission: valores.emission,
                maturity: valores.maturity,
                installmentAmount: Number(valores.installmentAmount),
                installmentCount: Number(valores.installmentCount),
                periodicity: valores.periodicity,
                status: valores.status,
                categoryId: Number(valores.categoryId),
                accountId: Number(accountId)
            };

            const response = tituloParaEditar
                ? await api.put(`/bill/${tituloParaEditar.id}`, payload)
                : await api.post('/bill', payload);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao salvar título');
            }

            setSucesso(tituloParaEditar ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');

            if (!tituloParaEditar && markChecklist === true && location?.state?.checklistItemId) {
                const month = location.state.selectedMonth || new Date().toISOString().slice(0, 7);
                try {
                    await api.post(`/checklist/${location.state.checklistItemId}/completion`, { month });
                } catch (err) {
                    console.warn('Não foi possível marcar checklist como concluído:', err);
                }
            }

            if (!tituloParaEditar) {
                setValores({
                    description: '',
                    emission: '',
                    maturity: '',
                    installmentAmount: '',
                    installmentCount: 1,
                    periodicity: 'MONTHLY',
                    status: 'PENDING',
                    categoryId: '',
                    type: 'RECEIPT'
                });
            }

            if (onSave) onSave();

        } catch (error) {
            setErro(error.message);
        }
    };

    const categoriasFiltradas = categorias.filter(cat => {
        if (!valores.type) return true;
        return cat.type === valores.type;
    });

    const statusOptions = [
        { value: 'PENDING', label: 'Pendente' },
        ...(valores.type === 'PAYMENT' ? [{ value: 'PAID', label: 'Pago' }] : []),
        ...(valores.type === 'RECEIPT' ? [{ value: 'RECEIVED', label: 'Recebido' }] : []),
    ];

    return (
        <Card>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {location?.state?.fromChecklist && !tituloParaEditar && markChecklist === null && (
                    <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                        <p className="text-sm text-text">
                            Deseja marcar <strong>"{location.state.description}"</strong> do checklist como concluído após salvar?
                        </p>
                        <div className="mt-3 flex gap-2">
                            <Button type="button" size="sm" onClick={() => setMarkChecklist(true)}>
                                Sim, marcar como concluído
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => setMarkChecklist(false)}>
                                Não
                            </Button>
                        </div>
                    </div>
                )}
                {erro && <p className="rounded-md bg-danger/10 px-3 py-2 text-sm text-danger">{erro}</p>}
                {sucesso && <p className="rounded-md bg-success/10 px-3 py-2 text-sm text-success">{sucesso}</p>}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Select
                        label="Tipo"
                        name="type"
                        value={valores.type}
                        onChange={handleInputChange}
                        options={[
                            { value: 'RECEIPT', label: 'Recebimento' },
                            { value: 'PAYMENT', label: 'Pagamento' },
                        ]}
                    />

                    <Input
                        label="Descrição"
                        type="text"
                        name="description"
                        value={valores.description}
                        onChange={handleInputChange}
                        required
                    />

                    <Input
                        label="Valor"
                        type="number"
                        step="0.01"
                        name="installmentAmount"
                        value={valores.installmentAmount}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input
                        label="Qtd. Parcelas"
                        type="number"
                        name="installmentCount"
                        min="1"
                        value={valores.installmentCount}
                        onChange={handleInputChange}
                    />

                    <Select
                        label="Periodicidade"
                        name="periodicity"
                        value={valores.periodicity}
                        onChange={handleInputChange}
                        options={PERIODICIDADE_OPTIONS}
                    />

                    <div className="flex flex-col gap-1">
                        {loadingCategorias ? (
                            <Select label="Categoria" disabled options={[{ value: '', label: 'Carregando...' }]} />
                        ) : categoriasFiltradas.length === 0 ? (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-text">Categoria</label>
                                <div className="rounded-md border border-warning/30 bg-warning/5 p-3 text-sm">
                                    <p className="text-text">Nenhuma categoria cadastrada para este tipo.</p>
                                    <button
                                        type="button"
                                        className="mt-1 text-primary hover:underline"
                                        onClick={() => navigate('/cadastrarCategoria')}
                                    >
                                        Criar categoria agora
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <Select
                                label="Categoria"
                                name="categoryId"
                                value={valores.categoryId}
                                onChange={handleInputChange}
                                required
                                placeholder="Selecione uma categoria"
                                options={categoriasFiltradas.map(cat => ({ value: cat.id, label: cat.name }))}
                            />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Input
                        label="Emissão"
                        type="date"
                        name="emission"
                        value={valores.emission}
                        onChange={handleInputChange}
                        required
                    />

                    <Input
                        label="Vencimento"
                        type="date"
                        name="maturity"
                        value={valores.maturity}
                        onChange={handleInputChange}
                        required
                    />

                    <Select
                        label="Status"
                        name="status"
                        value={valores.status}
                        onChange={handleInputChange}
                        options={statusOptions}
                    />
                </div>

                <div className="flex gap-3">
                    <Button type="submit">
                        {tituloParaEditar ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                    {tituloParaEditar && (
                        <Button type="button" variant="outline" onClick={onCancel}>
                            Cancelar
                        </Button>
                    )}
                </div>
            </form>
        </Card>
    );
};

export default FormularioTransacao;
