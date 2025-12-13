// Função para deletar
const handleDelete = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir este lançamento?")) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            // Remove da lista visualmente sem precisar recarregar tudo
            setTitulos(prev => prev.filter(titulo => titulo.id !== id));
        } else {
            alert("Erro ao excluir lançamento.");
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
    }
};

const fetchTitulos = async () => {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setError('Usuário não autenticado.');
            return;
        }

        // Endpoint novo: /bill (Traz tudo do usuário)
        const url = `${import.meta.env.VITE_API_URL}/bill`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar lançamentos');
        }

        let data = await response.json();

        // --- FILTRAGEM NO FRONTEND ---

        // 1. Filtrar por Tipo (Recebimento/Pagamento)
        // O botão do front manda 'recebimentos' ou 'pagamentos'
        // O Back retorna category.type = 'receipt' ou 'payment'
        if (tipoTransacao && tipoTransacao !== 'todos') {
            data = data.filter(titulo => {
                // Proteção caso category seja nulo
                const tipoCategoria = titulo.category?.type?.toLowerCase(); 
                
                if (tipoTransacao === 'recebimentos') return tipoCategoria === 'receipt';
                if (tipoTransacao === 'pagamentos') return tipoCategoria === 'payment';
                return true;
            });
        }

        // 2. Filtrar por Data (Maturity = Vencimento)
        if (filtroData.dataInicio || filtroData.dataFim) {
            data = data.filter(titulo => {
                if (!titulo.maturity) return false;

                // O Java manda '2025-01-01', o JS entende bem
                const dataVencimento = new Date(titulo.maturity); 
                // Zerar horas para comparar apenas datas
                dataVencimento.setHours(0,0,0,0);

                const dataInicio = filtroData.dataInicio ? new Date(filtroData.dataInicio) : null;
                if(dataInicio) dataInicio.setHours(0,0,0,0); // Ajuste de fuso horário simples

                const dataFim = filtroData.dataFim ? new Date(filtroData.dataFim) : null;
                if(dataFim) dataFim.setHours(23,59,59,999);

                if (dataInicio && dataFim) {
                    return dataVencimento >= dataInicio && dataVencimento <= dataFim;
                } else if (dataInicio) {
                    return dataVencimento >= dataInicio;
                } else if (dataFim) {
                    return dataVencimento <= dataFim;
                }
                return true;
            });
        }

        setTitulos(data);
        setError(null);
    } catch (error) {
        setError(error.message);
        console.error('Erro:', error);
    }
};

useEffect(() => {
    fetchTitulos();
}, [refresh, tipoTransacao, filtroData.dataInicio, filtroData.dataFim]);

// Formatadores
const formatarData = (dataISO) => {
    if (!dataISO) return '-';
    // dataISO vem como '2025-12-31'
    const [ano, mes, dia] = dataISO.split('-');
    return `${dia}/${mes}/${ano}`;
};

const formatarValor = (valor) => {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
};

const traduzirStatus = (status) => {
    switch (status) {
        case 'PENDING': return 'Pendente';
        case 'PAID': return 'Pago';
        case 'RECEIVED': return 'Recebido';
        default: return status;
    }
};

const getStatusClass = (status) => {
    switch (status) {
        case 'PAID':
        case 'RECEIVED': return 'status-pago';
        case 'PENDING': return 'status-pendente';
        default: return '';
    }
};

return (
   <div className="lista-titulo-container">
            {error && <div className="mensagem-erro"><FaExclamationCircle /> {error}</div>}

            {titulos.length === 0 && !error ? (
                <div className="lista-vazia">
                    <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
                </div>
            ) : (
                <div className="tabela-responsiva">
                    <table className="tabela-titulos">
                        <thead>
                            <tr>
                                <th>Descrição</th>
                                <th>Categoria</th>
                                <th>Vencimento</th>
                                <th>Valor</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {titulos.map((titulo) => {
                                // Define cor do valor baseado no tipo da categoria
                                const isDespesa = titulo.category?.type?.toLowerCase() === 'payment';
                                const classeValor = isDespesa ? 'valor-saida' : 'valor-entrada';
                                
                                return (
                                    <tr key={titulo.id}>
                                        <td data-label="Descrição">{titulo.description}</td>
                                        
                                        <td data-label="Categoria">
                                            {titulo.category ? titulo.category.name : '-'}
                                        </td>
                                        
                                        <td data-label="Vencimento">
                                            {formatarData(titulo.maturity)}
                                        </td>
                                        
                                        <td data-label="Valor" className={classeValor}>
                                            {formatarValor(titulo.value)}
                                        </td>
                                        
                                        <td data-label="Status">
                                            <span className={`badge-status ${getStatusClass(titulo.status)}`}>
                                                {titulo.status === 'PAID' || titulo.status === 'RECEIVED' ? <FaCheckCircle /> : 
                                                 titulo.status === 'PENDING' ? <FaClock /> : null}
                                                {' '}
                                                {traduzirStatus(titulo.status)}
                                            </span>
                                        </td>
                                        
                                        <td data-label="Ações" className="coluna-acoes">
                                            <button 
                                                className="btn-acao btn-editar" 
                                                onClick={() => onEdit(titulo)}
                                                title="Editar"
                                            >
                                                <FaEdit />
                                            </button>
                                            <button 
                                                className="btn-acao btn-excluir" 
                                                onClick={() => handleDelete(titulo.id)}
                                                title="Excluir"
                                            >
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
        </div>
    );
;

export default ListaTitulo;