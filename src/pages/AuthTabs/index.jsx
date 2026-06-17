import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Login from '../Login/Login';
import CadastroUsuario from '../CadastroUsuario';
import PropTypes from 'prop-types';

const AuthTabs = ({ initialTab = 'login' }) => {
    const [active, setActive] = useState(initialTab);

    useEffect(() => {
        setActive(initialTab);
    }, [initialTab]);

    return (
        <div className="login-frame">

            {/* ── Lado esquerdo: hero + stats ── */}
            <div className="login-left">
                <div className="login-left-body">
                    <span className="login-tag">
                        <span className="login-tag-dot" />
                        Sistema financeiro pessoal
                    </span>
                    <h1 className="login-headline">
                        Controle total<br />do seu dinheiro
                    </h1>
                    <p className="login-sub">
                        Organize contas, receitas, despesas e relatórios em um único lugar, com visão em tempo real das suas finanças.
                    </p>
                </div>

                <div className="login-preview">
                    <img
                        src="/screenshots/dashboard_dark.png"
                        alt="FinHawk — visão do dashboard"
                        className="login-preview-img"
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                </div>
            </div>

            {/* ── Lado direito: form ── */}
            <div className="login-right">
                <Link to="/" className="login-back-home">← Voltar para o início</Link>

                <div className="login-right-brand">
                    <div className="sb-logo-mark">FH</div>
                    <span className="sb-logo-name">FinHawk</span>
                </div>

                <div className="login-tabs">
                    <button
                        className={`login-tab${active === 'login' ? ' active' : ''}`}
                        onClick={() => setActive('login')}
                    >
                        Entrar
                    </button>
                    <button
                        className={`login-tab${active === 'cadastro' ? ' active' : ''}`}
                        onClick={() => setActive('cadastro')}
                    >
                        Criar conta
                    </button>
                </div>

                <div className="login-form-area">
                    {active === 'login' ? <Login /> : <CadastroUsuario />}
                </div>
            </div>

        </div>
    );
};

AuthTabs.propTypes = {
    initialTab: PropTypes.string,
};

export default AuthTabs;
