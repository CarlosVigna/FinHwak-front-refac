import React, { useState, useEffect } from 'react';
import './formularioTransacao.css';

const FormularioTransacao = ({ tituloParaEditar, onSave, onCancel }) => {
    const [categorias, setCategorias] = useState([]);
    
    const [valores, setValores] = useState({
        description: '',
        value: '', 
        emission: '',
        maturity: '',
        categoryId: '',
        status: 'PENDING',    
        type: 'receipt',      
        fixo: false,
        installmentAmount: 1,
        parcelNumber: 1,
        periodicity: 'Monthly' 
    });

    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) throw new Error('Falha ao carregar categorias.');
                const data = await response.json();
                setCategorias(data);
            } catch (error) {
                console.error("Erro ao buscar categorias:", error);
                setErro("Erro ao carregar categorias.");
            }
        };
        fetchCategorias();
    }, []);

    useEffect(() => {
        if (tituloParaEditar) {
            setValores({
                description: tituloParaEditar.description || '',
                value: tituloParaEditar.value || '',
                emission: tituloParaEditar.emission ? tituloParaEditar.emission.split('T')[0] : '',
                maturity: tituloParaEditar.maturity ? tituloParaEditar.maturity.split('T')[0] : '',
                categoryId: tituloParaEditar.category?.id || '',
                status: tituloParaEditar.status || 'PENDING',
                type: tituloParaEditar.category?.type?.toLowerCase() || 'receipt',
                installmentAmount: tituloParaEditar.installmentAmount || 1,
                parcelNumber: tituloParaEditar.parcelNumber || 1,
                periodicity: tituloParaEditar.periodicity || 'Monthly', 
                fixo: false 
            });
        }
    }, [tituloParaEditar]);

    const handleInputChange = (event) => {
        const { name, value, type, checked } = event.target;
        setValores(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        try {
            const token = localStorage.getItem('token');
            const accountId = localStorage.getItem('usuarioId') || localStorage.getItem('id'); 

            if (!token || !accountId) {
                throw new Error('Usuário não autenticado.');
            }

            const dadosParaEnviar = {
                description: valores.description,
                value: parseFloat(valores.value), 
                maturity: valores.maturity,
                emission: valores.emission,
                installmentAmount: parseInt(valores.installmentAmount),
                parcelNumber: parseInt(valores.parcelNumber),
                periodicity: valores.periodicity, 
                status: valores.status,           
                categoryId: parseInt(valores.categoryId),
                accountId: parseInt(accountId)
            };

            const url = tituloParaEditar
                ? `${import.meta.env.VITE_API_URL}/bill/${tituloParaEditar.id}`
                : `${import.meta.env.VITE_API_URL}/bill`;

            const response = await fetch(url, {
                method: tituloParaEditar ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosParaEnviar)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao salvar lançamento.');
            }

            const data = await response.json();

            setSucesso(tituloParaEditar ? "Atualizado com sucesso!" : "Cadastrado com sucesso!");
            
            if (!tituloParaEditar) {
                setValores(prev => ({
                    ...prev,
                    description: '',
                    value: '',
                    emission: '',
                    maturity: '',
                    status: 'PENDING',
                    installmentAmount: 1
                }));
            }

            if (onSave) onSave(data);

        } catch (error) {
            console.error("Erro ao enviar dados:", error);
            setErro(error.message);
        }
    };

    const categoriasFiltradas = categorias.filter(cat => {
        if (!valores.type) return true;
        return cat.type && cat.type.toLowerCase() === valores.type.toLowerCase();
    });

    return (
        <form className="formulario-horizontal" onSubmit={handleSubmit}>
            {erro && <div className="error-message">{erro}</div>}
            {sucesso && <div className="success-message">{sucesso}</div>}

            <div className="linha-formulario">
                <div className="campo-formulario tipo-transacao">
                    <label htmlFor="type">Tipo de Transação</label>
                    <select
                        id="type"
                        name="type"
                        value={valores.type}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="receipt">Recebimento</option>
                        <option value="payment">Pagamento</option>
                    </select>
                </div>

                <div className="campo-formulario descricao">
                    <label htmlFor="description">Descrição</label>
                    <input
                        type="text"
                        id="description"
                        name="description"
                        value={valores.description}
                        onChange={handleInputChange}
                        placeholder="Digite a descrição"
                        required
                    />
                </div>
                
                <div className="campo-formulario parcela">
                    <label htmlFor="parcelNumber">Parcela</label>
                    <input
                        type="number"
                        id="parcelNumber"
                        name="parcelNumber"
                        value={valores.parcelNumber}
                        readOnly
                    />
                </div>

                <div className="campo-formulario valor">
                    <label htmlFor="value">Valor R$</label>
                    <input
                        type="number"
                        id="value"
                        name="value"
                        value={valores.value}
                        onChange={handleInputChange}
                        placeholder="0,00"
                        step="0.01"
                        required
                    />
                </div>
            </div>

            <div className="linha-formulario">
                <div className="campo-formulario fixo">
                    <label htmlFor="fixo">Fixo</label>
                    <input type="checkbox"
                        id="fixo"
                        name='fixo'
                        checked={valores.fixo}
                        onChange={handleInputChange} />
                </div>

                <div className="campo-formulario qntParcelas">
                    <label htmlFor="installmentAmount">Qnt. Parcelas</label>
                    <input
                        type="number"
                        id="installmentAmount"
                        name="installmentAmount"
                        value={valores.installmentAmount}
                        onChange={handleInputChange}
                        disabled={valores.fixo}
                        min="1"
                    />
                </div>

                <div className="campo-formulario periodicidade">
                    <label htmlFor="periodicity">Periodicidade</label>
                    <select
                        id="periodicity"
                        name="periodicity"
                        value={valores.periodicity}
                        onChange={handleInputChange}
                        disabled={!valores.fixo}
                    >
                        <option value="Monthly">MENSAL</option>
                        <option value="Bimonthly">BIMESTRAL</option>
                        <option value="Quarterly">TRIMESTRAL</option>
                        <option value="Semiannual">SEMESTRAL</option>
                        <option value="Annual">ANUAL</option>
                    </select>
                </div>
            </div>

            <div className="linha-formulario">
                <div className="campo-formulario categoria">
                    <label htmlFor="categoryId">Categoria</label>
                    <select
                        id="categoryId"
                        name="categoryId"
                        value={valores.categoryId}
                        onChange={handleInputChange}
                        required
                    >
                        <option value="">Selecione uma categoria</option>
                        {categoriasFiltradas.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option> 
                        ))}
                    </select>
                </div>

                <div className="campo-formulario datas">
                    <label htmlFor="emission">Data de Emissão</label>
                    <input
                        type="date"
                        id="emission"
                        name="emission"
                        value={valores.emission}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="campo-formulario datas">
                    <label htmlFor="maturity">Data de Vencimento</label>
                    <input
                        type="date"
                        id="maturity"
                        name="maturity"
                        value={valores.maturity}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="campo-formulario status">
                    <label htmlFor="status">Status</label>
                    <select
                        id="status"
                        name="status"
                        value={valores.status}
                        onChange={handleInputChange}
                    >
                        <option value="PENDING">Pendente</option>
                        <option value="RECEIVED">Recebido</option>
                        <option value="PAID">Pago</option>
                    </select>
                </div>
            </div>

            <div className="botoes-formulario">
                <button type="submit" className="botao-salvar">
                    {tituloParaEditar ? 'Atualizar' : 'Cadastrar'}
                </button>
                {tituloParaEditar && (
                    <button
                        type="button"
                        className="botao-cancelar"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>
                )}
            </div>
        </form>
    );
};

export default FormularioTransacao;