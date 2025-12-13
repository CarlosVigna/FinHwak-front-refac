import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AccountDetails = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchAccount = async () => {
            try {
                const token = localStorage.getItem('token');
                
                if (!token) {
                    setError('Usuário não autenticado.');
                    return;
                }

                const response = await fetch(`${import.meta.env.VITE_API_URL}/account/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, 
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Erro ao buscar detalhes da conta.');
                }

                const data = await response.json();
                console.log("Dados da conta:", data);
                
                setAccount(data);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAccount();
    }, [id]);

    if (loading) return <div>Carregando detalhes...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!account) return <div>Conta não encontrada.</div>;

    return (
        <div className="account-details-container">
            <div className="header-details">
                <h1>Detalhes da Conta</h1>
                <button onClick={() => navigate('/contas')}>Voltar</button>
            </div>

            <div className="card-detalhe">
                {account.photoUrl && (
                    <img 
                        src={account.photoUrl} 
                        alt="Foto da conta" 
                        className="account-photo"
                        style={{ width: '100px', height: '100px', borderRadius: '50%' }} 
                    />
                )}

                <h2>{account.name}</h2>
                
                <p><strong>ID da Conta:</strong> {account.id}</p>

                
                {account.userAccount && (
                    <p><strong>Proprietário:</strong> {account.userAccount.name || account.userAccount.email}</p>
                )}
            </div>
        </div>
    );
};

export default AccountDetails;