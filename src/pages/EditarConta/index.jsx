import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './editarConta.css';

const EditarConta = () => {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    
    const [erro, setErro] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchConta = async () => {
            try {
                const token = localStorage.getItem('token');
                
                const response = await fetch(`${import.meta.env.VITE_API_URL}/account/${id}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error("Erro ao carregar dados da conta");
                }

                const data = await response.json();
                
                setName(data.name || '');
                setPhotoUrl(data.photoUrl || '');

            } catch (error) {
                setErro(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchConta();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro(null);

        const dadosAtualizados = {
            name: name,
            photoUrl: photoUrl
        };

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/account/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dadosAtualizados)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao atualizar conta");
            }

            navigate('/contas');
        } catch (error) {
            setErro(error.message);
        }
    };

    if (loading) {
        return <div className="loading">Carregando dados da conta...</div>;
    }

    return (
        <div className="editar-conta-container">
            <h1>Editar Conta</h1>

            {erro && <div className="error-message">{erro}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="name">Nome da Conta:</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Nubank, Carteira..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="photoUrl">URL da Foto:</label>
                    <input
                        type="text"
                        id="photoUrl"
                        name="photoUrl"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="Insira a nova URL da foto"
                    />
                </div>


                <div className="botoes-container">
                    <button type="submit" className="botao-salvar">Salvar Alterações</button>
                    <button 
                        type="button" 
                        className="botao-cancelar"
                        onClick={() => navigate('/contas')}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditarConta;