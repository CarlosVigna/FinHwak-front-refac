import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../componentes/Card';
import './contas.css';

const Contas = () => {
    const [contas, setContas] = useState([]);
    const [erro, setErro] = useState(null);
    const [sucesso, setSucesso] = useState("");
    const navigate = useNavigate();

    // 1. Busca as contas (GET /account)
    useEffect(() => {
        const fetchContas = async () => {
            try {
                const token = localStorage.getItem('token');
                
                // Mudança de endpoint: /contas -> /account
                const response = await fetch(`${import.meta.env.VITE_API_URL}/account`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao carregar contas.');
                }

                const data = await response.json();
                // O data agora é uma lista de objetos com { id, name, photoUrl }
                setContas(data);
            } catch (error) {
                setErro('Erro ao carregar contas: ' + error.message);
                console.error('Erro ao buscar contas:', error);
            }
        };

        fetchContas();
    }, []);

    const handleEntrar = (idConta) => {
        console.log('Entrando na conta com ID:', idConta);
        // Salva o ID para usar nas transações
        localStorage.setItem('id', idConta); 
        navigate('/cadastroTitulo');
    };

    const handleEditar = (idConta) => {
        console.log('Editando a conta com ID:', idConta);
        navigate(`/editar-conta/${idConta}`);
    };

    const handleCriarConta = () => {
        navigate('/criar-conta');
    };

    // 2. Exclusão (DELETE /account/{id})
    const handleExcluir = async (idConta) => {
        const userConfirmed = window.confirm("ATENÇÃO: Excluir esta conta também removerá todos os títulos associados a ela. Deseja continuar?");
        if (!userConfirmed) return;

        setErro("");
        setSucesso("");

        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/${idConta}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

          
            if (response.status === 204) {
                setContas(prevContas => prevContas.filter(conta => conta.id !== idConta));
                setSucesso('Conta e seus títulos foram excluídos com sucesso');
                return; 
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Erro ao excluir conta.');
            }

        } catch (error) {
            setErro(error.message);
        } finally {
            setTimeout(() => {
                setErro("");
                setSucesso("");
            }, 3000);
        }
    };

    return (
        <div className="contas-container">
            <h1 className="titulo-contas">Minhas Contas</h1>

            {erro && <div className="erro-mensagem">{erro}</div>}
            {sucesso && <div className="sucesso-mensagem" style={{color: 'green', textAlign:'center', marginBottom: '10px'}}>{sucesso}</div>}
            
            <div className="cards-container">
                {contas.length > 0 ? (
                    contas.map(conta => (
                        <Card
                            key={conta.id}
                            conta={conta}
                            onEntrar={handleEntrar}
                            onEditar={handleEditar}
                            onExcluir={handleExcluir}
                        />
                    ))
                ) : (
                    <div>
                        <p>Nenhuma conta encontrada.</p>
                    </div>
                )}
            </div>

            <div className="botao-criar-conta-container">
                <button 
                    className="botao-nova-conta"
                    onClick={handleCriarConta}
                >
                    Adicionar Nova Conta
                </button>
            </div>
        </div>
    );
};

export default Contas;