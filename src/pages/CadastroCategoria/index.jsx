import React, { useState } from 'react';
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

const CadastroCategoria = () => {
    const [valores, setValores] = useState({
        name: '',
        type: 'RECEIPT', 
    });

    const [erro, setErro] = useState("");
    const [refresh, setRefresh] = useState(false);
    const [sucesso, setSucesso] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValores({
            ...valores,
            [name]: value
        });
    };

    const handleCadastro = async (e) => {
        e.preventDefault();

        const { name, type } = valores;

        if (!name) {
            setErro("O nome da categoria é obrigatório.");
            return;
        }

        const novaCategoria = { name, type };

        try {
            await cadastrarCategoria(novaCategoria);

            setValores({
                name: '',
                type: 'RECEIPT'
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

    const camposCadastro = [
        { 
            label: "Nome:", 
            placeholder: "Digite o nome da categoria", 
            type: "text", 
            name: "name"  
        },
        {
            label: "Tipo:",
            type: "select",
            name: "type", 
            options: [
                { value: "RECEIPT", label: "Recebimentos" }, 
                { value: "PAYMENT", label: "Pagamentos" }
            ]
        }
    ];

    return (
        <div className="cadastro-categoria-vertical">
            <div className="secao-superior">
                <FormularioCategoria
                    valores={valores}
                    handleInputChange={handleInputChange}
                    onSubmit={handleCadastro}
                    campos={camposCadastro} 
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