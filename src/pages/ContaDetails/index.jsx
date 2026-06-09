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
                <div className="account-details-actions">
                    <button onClick={() => navigate('/contas')}>Voltar</button>
                    <button className="btn-export-csv" onClick={async () => {
                        try {
                            const token = localStorage.getItem('token');
                            const response = await fetch(`${import.meta.env.VITE_API_URL}/bill/export/account/${id}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });

                            if (!response.ok) {
                                const txt = await response.text();
                                throw new Error(txt || 'Erro ao exportar CSV');
                            }

                            const blob = await response.blob();
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `finhawk_account_${id}.csv`;
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                            window.URL.revokeObjectURL(url);
                        } catch (err) {
                            alert('Erro ao exportar CSV: ' + err.message);
                        }
                    }}>Exportar CSV</button>
                </div>
            </div>

            <div className="card-detalhe">
                {account.photoUrl && (
                    <img 
                        src={account.photoUrl} 
                        alt="Foto da conta" 
                        className="account-photo"
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
