import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const CriarConta = () => {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

 

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        const dadosConta = {
            name: name,
            photoUrl: photoUrl
        };

        try {
            const response = await api.post('/account', dadosConta);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Erro ao criar conta.");
            }

            const data = await response.json();
            localStorage.setItem('accountId', String(data.id));
            localStorage.setItem('accountName', data.name);
            navigate('/cadastrarCategoria', { state: { fromNewAccount: true } });

        } catch (error) {
            console.error("Erro ao criar conta:", error);
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="criar-conta-container">
            <div className="fh-page-header">
                <h1 className="fh-title">Criar Nova <span>Conta</span></h1>
                <p className="fh-subtitle">Preencha os dados para adicionar uma conta financeira.</p>
            </div>
            <form onSubmit={handleSubmit}>
                
                <div className="form-group">
                    <label>Nome da Conta:</label>
                    <input
                        type="text"
                        className="form-control no-inner-shadow"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Nubank, Carteira, Banco do Brasil..."
                        required
                    />
                </div>

                <div className="form-group">
                    <label>URL da Foto (Opcional):</label>
                    <input
                        type="text"
                        className="form-control no-inner-shadow"
                        value={photoUrl}
                        onChange={(e) => setPhotoUrl(e.target.value)}
                        placeholder="Cole o link de uma imagem/logo"
                    />
                </div>


                {error && <div className="erro-mensagem">{error}</div>}
                
                <div className="botoes-container">
                    <button type="submit" className="fh-btn fh-btn-primary" disabled={isSubmitting}>
                        {isSubmitting ? 'Criando...' : 'Criar Conta'}
                    </button>
                    <button
                        type="button"
                        className="fh-btn fh-btn-secondary"
                        onClick={() => navigate('/contas')}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CriarConta;
