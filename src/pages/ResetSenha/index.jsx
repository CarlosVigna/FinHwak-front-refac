import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';

const ResetSenha = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState('');

    useEffect(() => {
        if (!token) {
            navigate('/esqueci-senha', { replace: true });
        }
    }, [token, navigate]);

    useEffect(() => {
        if (sucesso) {
            const timer = setTimeout(() => navigate('/login'), 2000);
            return () => clearTimeout(timer);
        }
    }, [sucesso, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');

        if (novaSenha !== confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }
        if (novaSenha.length < 6) {
            setErro('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, newPassword: novaSenha }),
            });

            if (response.ok) {
                setSucesso(true);
                return;
            }

            if (response.status === 400) {
                const data = await response.json().catch(() => null);
                setErro(data?.message || 'Link inválido ou expirado. Solicite um novo link de recuperação.');
                return;
            }

            throw new Error('Erro ao redefinir senha. Tente novamente.');
        } catch (err) {
            if (!sucesso) {
                setErro(err.message || 'Erro ao redefinir senha. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!token) return null;

    return (
        <div className="auth-page">
            <section className="auth-brand">
                <div className="auth-brand-content">
                    <h1 className="auth-brand-title">
                        Fin<span>Hawk</span>
                    </h1>
                    <p className="auth-brand-subtitle">
                        Controle financeiro inteligente para organizar contas, receitas, despesas e relatorios em um unico lugar.
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature">Dashboard financeiro</div>
                        <div className="auth-feature">Controle de contas</div>
                        <div className="auth-feature">Relatorios e indicadores</div>
                        <div className="auth-feature">Ambiente seguro</div>
                    </div>
                </div>
            </section>

            <section className="auth-card-container">
                <div className="auth-tabs-card">
                    <div className="auth-header">
                        <h1 className="brand">FinHawk</h1>
                    </div>

                    <div className="auth-content">
                        {sucesso ? (
                            <div>
                                <div className="success-message">
                                    Senha redefinida com sucesso! Redirecionando para o login...
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h2 style={{ margin: '0 0 8px' }}>Redefinir senha</h2>
                                <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', fontSize: '0.875rem' }}>
                                    Escolha uma nova senha para sua conta.
                                </p>

                                <div className="campo-formulario">
                                    <label>Nova Senha</label>
                                    <input
                                        type="password"
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                        placeholder="Mínimo 6 caracteres"
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>

                                <div className="campo-formulario">
                                    <label>Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        value={confirmarSenha}
                                        onChange={(e) => setConfirmarSenha(e.target.value)}
                                        placeholder="Repita a nova senha"
                                        disabled={loading}
                                        autoComplete="new-password"
                                    />
                                </div>

                                {erro && (
                                    <div className="error-message">
                                        {erro}
                                        {erro.includes('inválido ou expirado') && (
                                            <> — <Link to="/esqueci-senha" className="btn-link">Solicitar novo link</Link></>
                                        )}
                                    </div>
                                )}

                                <div className="botoes-formulario" style={{ marginTop: '20px' }}>
                                    <button type="submit" className="fh-btn fh-btn-primary" disabled={loading}>
                                        {loading ? 'Redefinindo...' : 'Redefinir Senha'}
                                    </button>
                                </div>

                                <div className="auth-extra-links">
                                    <Link to="/login" className="btn-link">Voltar para o login</Link>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ResetSenha;
