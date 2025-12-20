import React, { useState, useEffect } from 'react';
import FormularioCategoria from '../../componentes/FormularioCategoria';
import ListaCategorias from '../ListaCategorias';
import './cadastroCategoria.css';

async function cadastrarCategoria(categoria) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/category`, {
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(categoria),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            console.error("Erro na API:", errorData);
            throw new Error(errorData.message || 'Erro ao cadastrar categoria');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Erro ao fazer a requisição:", error.message);
        throw error;
    }
}

async function buscarContas() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/account`, {
            method: "GET",
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Erro ao buscar contas');
        }

        return await response.json();
    } catch (error) {
        console.error("Erro ao buscar contas:", error);
        throw error;
    }
}

const CadastroCategoria = () => {
    const [valores, setValores] = useState({
        name: '',
        type: 'RECEIPT',
        accountId: '', 
    });

    const [contas, setContas] = useState([]); 
    const [erro, setErro] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [sucesso, setSucesso] = useState("");
    const [carregandoContas, setCarregandoContas] = useState(true);

    useEffect(() => {
        const carregarContas = async () => {
            try {
                const contasData = await buscarContas();
                setContas(contasData);
                
                if (contasData.length > 0) {
                    setValores(prev => ({
                        ...prev,
                        accountId: contasData[0].id
                    }));
                }
            } catch (error) {
                setErro("Erro ao carregar contas. Por favor, crie uma conta primeiro.");
            } finally {
                setCarregandoContas(false);
            }
        };

        carregarContas();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValores({
            ...valores,
            [name]: value
        });
    };

    const handleCadastro = async (e) => {
        e.preventDefault();

        const { name, type, accountId } = valores;

        if (!name) {
            setErro("O nome da categoria é obrigatório.");
            return;
        }

        if (!accountId) {
            setErro("Você precisa selecionar uma conta.");
            return;
        }

        const novaCategoria = { 
            name, 
            type, 
            accountId: parseInt(accountId) 
        };

        try {
            await cadastrarCategoria(novaCategoria);

            setValores({
                name: '',
                type: 'RECEIPT',
                accountId: contas.length > 0 ? contas[0].id : ''
            });
            setErro("");
            setSucesso("Categoria cadastrada com sucesso!");
            
            setRefresh(prev => !prev);
            
            setTimeout(() => {
                setSucesso("");
            }, 3000);

        } catch (error) {
            setErro(error.message || "Erro ao cadastrar Categoria.");
            setSucesso("");
        }
    };

    if (carregandoContas) {
        return <div className="loading">Carregando contas...</div>;
    }

    if (contas.length === 0) {
        return (
            <div className="erro-container">
                <h2>Nenhuma conta encontrada</h2>
                <p>Você precisa criar uma conta antes de cadastrar categorias.</p>
                <a href="/cadastro-conta" className="botao-criar-conta">Criar Conta</a>
            </div>
        );
    }

    return (
        <div className="cadastro-categoria-vertical">
            <div className="secao-superior">
                <FormularioCategoria
                    valores={valores}
                    handleInputChange={handleInputChange}
                    onSubmit={handleCadastro}
                    contas={contas} 
                    erro={erro}
                    sucesso={sucesso}
                />
            </div>
            <div className="historico-container">
                <h2 className="historico-titulo">Categorias Cadastradas</h2>
                <ListaCategorias refresh={refresh} />
            </div>
        </div>
    );
};

export default CadastroCategoria;
