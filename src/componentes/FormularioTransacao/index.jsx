import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../services/api';

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
            if (!tituloParaEditar) localStorage.setItem('finhawk-first-bill', 'true');

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

    return (
        <form className="formulario-horizontal" onSubmit={handleSubmit}>
            {location?.state?.fromChecklist && !tituloParaEditar && markChecklist === null && (
                <div className="checklist-confirm-banner">
                    <p>
                        Deseja marcar <strong>"{location.state.description}"</strong> do checklist como concluído após salvar?
                    </p>
                    <div className="fh-btn-row">
                        <button
                            type="button"
                            className="fh-btn fh-btn-success fh-btn-sm"
                            onClick={() => setMarkChecklist(true)}
                        >
                            Sim, marcar como concluído
                        </button>
                        <button
                            type="button"
                            className="fh-btn fh-btn-secondary fh-btn-sm"
                            onClick={() => setMarkChecklist(false)}
                        >
                            Não
                        </button>
                    </div>
                </div>
            )}
            {erro && <div className="error-message">{erro}</div>}
            {sucesso && <div className="success-message">{sucesso}</div>}

            <div className="linha-formulario">
                <div className="campo-formulario">
                    <label>Tipo</label>
                    <select name="type" value={valores.type} onChange={handleInputChange}>
                        <option value="RECEIPT">Recebimento</option>
                        <option value="PAYMENT">Pagamento</option>
                    </select>
                </div>

                <div className="campo-formulario">
                    <label>Descrição</label>
                    <input
                        type="text"
                        name="description"
                        value={valores.description}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label>Valor</label>
                    <input
                        type="number"
                        step="0.01"
                        name="installmentAmount"
                        value={valores.installmentAmount}
                        onChange={handleInputChange}
                        required
                    />
                </div>
            </div>

            <div className="linha-formulario">
                <div className="campo-formulario">
                    <label>Qtd. Parcelas</label>
                    <input
                        type="number"
                        name="installmentCount"
                        min="1"
                        value={valores.installmentCount}
                        onChange={handleInputChange}
                    />
                </div>

                <div className="campo-formulario">
                    <label>Periodicidade</label>
                    <select
                        name="periodicity"
                        value={valores.periodicity}
                        onChange={handleInputChange}
                    >
                        <option value="MONTHLY">Mensal</option>
                        <option value="BIMONTHLY">Bimestral</option>
                        <option value="QUARTERLY">Trimestral</option>
                        <option value="SEMIANNUAL">Semestral</option>
                        <option value="ANNUAL">Anual</option>
                    </select>
                </div>

                <div className="campo-formulario">
                    <label>Categoria</label>
                    {loadingCategorias ? (
                        <select disabled><option>Carregando...</option></select>
                    ) : categoriasFiltradas.length === 0 ? (
                        <div className="aviso-sem-categoria">
                            <p>Nenhuma categoria cadastrada para este tipo.</p>
                            <button
                                type="button"
                                className="btn-link"
                                onClick={() => navigate('/cadastrarCategoria')}
                            >
                                Criar categoria agora
                            </button>
                        </div>
                    ) : (
                        <select
                            name="categoryId"
                            value={valores.categoryId}
                            onChange={handleInputChange}
                            required
                        >
                            <option value="">Selecione uma categoria</option>
                            {categoriasFiltradas.map(cat => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            <div className="linha-formulario">
                <div className="campo-formulario">
                    <label>Emissão</label>
                    <input
                        type="date"
                        name="emission"
                        value={valores.emission}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label>Vencimento</label>
                    <input
                        type="date"
                        name="maturity"
                        value={valores.maturity}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="campo-formulario">
                    <label>Status</label>
                    <select name="status" value={valores.status} onChange={handleInputChange}>
                        <option value="PENDING">Pendente</option>
                        {valores.type === 'PAYMENT' && <option value="PAID">Pago</option>}
                        {valores.type === 'RECEIPT' && <option value="RECEIVED">Recebido</option>}
                    </select>
                </div>
            </div>

            <div className="botoes-formulario">
                <button type="submit" className="fh-btn fh-btn-primary">
                    {tituloParaEditar ? 'Atualizar' : 'Cadastrar'}
                </button>
                {tituloParaEditar && (
                    <button type="button" className="fh-btn fh-btn-secondary" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

export default FormularioTransacao;
