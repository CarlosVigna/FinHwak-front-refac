import React, { useState, useEffect } from 'react';
import './formularioTransacao.css';

const FormularioTransacao = ({ tituloParaEditar, onSave, onCancel, tipoTransacao }) => {
    const [categorias, setCategorias] = useState([]);

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
            try {
                const token = localStorage.getItem('token');
                const accountId = localStorage.getItem('accountId');

                if (!token) {
                    setErro("Token não encontrado. Faça login novamente.");
                    return;
                }

                if (!accountId) {
                    setErro("Erro: Conta não identificada.");
                    return;
                }

                const response = await fetch(
                    `${import.meta.env.VITE_API_URL}/category/account/${accountId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );

                if (!response.ok) throw new Error('Falha ao carregar categorias.');

                const data = await response.json();
                setCategorias(data);
                setErro('');

            } catch (error) {
                setErro("Erro ao carregar categorias: " + error.message);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValores(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        try {
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('accountId');

            if (!token) throw new Error('Usuário não autenticado. Faça login novamente.');
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

            const url = tituloParaEditar
                ? `${import.meta.env.VITE_API_URL}/bill/${tituloParaEditar.id}`
                : `${import.meta.env.VITE_API_URL}/bill`;

            const response = await fetch(url, {
                method: tituloParaEditar ? 'PUT' : 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao salvar título');
            }

            setSucesso(tituloParaEditar ? 'Atualizado com sucesso!' : 'Cadastrado com sucesso!');
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
                        <option value="PAID">Pago</option>
                        <option value="RECEIVED">Recebido</option>
                    </select>
                </div>
            </div>

            <div className="botoes-formulario">
                <button type="submit">
                    {tituloParaEditar ? 'Atualizar' : 'Cadastrar'}
                </button>
                {tituloParaEditar && (
                    <button type="button" onClick={onCancel}>
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

export default FormularioTransacao;
