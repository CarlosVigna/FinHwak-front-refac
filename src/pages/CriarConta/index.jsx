import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

const CriarConta = () => {
    const [name, setName] = useState('');
    const [photoUrl, setPhotoUrl] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState(null);

 

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            await response.json();
            navigate('/contas');

        } catch (error) {
            console.error("Erro ao criar conta:", error);
            setError(error.message);
        }
    };

    return (
        <div className="criar-conta-container">
            <h1>Criar Nova Conta</h1>
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
                    <button type="submit" className="botao-salvar">Criar Conta</button>
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

export default CriarConta;
