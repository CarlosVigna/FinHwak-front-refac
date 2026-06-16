import { useState } from 'react';
import { Link } from 'react-router-dom';

const EsqueciSenha = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [erro, setErro] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setErro('Informe o e-mail cadastrado.');
            return;
        }

        setLoading(true);
        setErro('');

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim() }),
            });

            if (!response.ok) {
                throw new Error('Erro ao enviar. Tente novamente.');
            }

            setSent(true);
        } catch (err) {
            setErro(err.message || 'Erro ao enviar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

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
                        {sent ? (
                            <div>
                                <div className="success-message">
                                    Se o e-mail informado estiver cadastrado, você receberá um link em breve.
                                </div>
                                <div className="auth-extra-links">
                                    <Link to="/login" className="btn-link">Voltar para o login</Link>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit}>
                                <h2 style={{ margin: '0 0 8px' }}>Recuperar senha</h2>
                                <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px', fontSize: '0.875rem' }}>
                                    Informe o e-mail cadastrado e enviaremos um link para redefinir sua senha.
                                </p>

                                <div className="campo-formulario">
                                    <label>E-mail</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Digite seu e-mail"
                                        disabled={loading}
                                        autoComplete="email"
                                    />
                                </div>

                                {erro && <div className="error-message">{erro}</div>}

                                <div className="botoes-formulario" style={{ marginTop: '20px' }}>
                                    <button type="submit" className="fh-btn fh-btn-primary" disabled={loading}>
                                        {loading ? 'Enviando...' : 'Enviar link de recuperação'}
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

export default EsqueciSenha;
