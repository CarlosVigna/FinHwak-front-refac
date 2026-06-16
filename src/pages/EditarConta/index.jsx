import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

const EditarConta = () => {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const [erro, setErro] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchConta = async () => {
            try {
                const response = await api.get(`/account/${id}`);

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
        if (isSaving) return;

        setIsSaving(true);
        setErro(null);

        const dadosAtualizados = {
            name: name,
            photoUrl: photoUrl
        };

        try {
            const response = await api.put(`/account/${id}`, dadosAtualizados);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao atualizar conta");
            }

            navigate('/contas');
        } catch (error) {
            setErro(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="loading">Carregando dados da conta...</div>;
    }

    return (
        <div className="editar-conta-container">
            <div className="fh-page-header">
                <h1 className="fh-title">Editar <span>Conta</span></h1>
                <p className="fh-subtitle">Atualize os dados da conta selecionada.</p>
            </div>

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
                    <button type="submit" className="fh-btn fh-btn-primary" disabled={isSaving}>
                        {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                    <button
                        type="button"
                        className="fh-btn fh-btn-secondary"
                        onClick={() => navigate('/contas')}
                        disabled={isSaving}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditarConta;
