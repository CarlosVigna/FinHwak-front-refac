import { useState, useEffect } from 'react';
import Login from '../Login/Login';
import CadastroUsuario from '../CadastroUsuario';
import PropTypes from 'prop-types';

const STATS = [
    { label: 'Dashboard em tempo real', value: 'R$ 3.290', delta: 'resultado do mês' },
    { label: 'Checklist mensal',        value: '7/9',      delta: 'itens concluídos' },
    { label: 'Vencimentos controlados', value: '2',        delta: 'títulos pendentes' },
    { label: 'Multi-conta',             value: '3',        delta: 'contas ativas' },
];

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

                <div className="login-stats">
                    {STATS.map((s) => (
                        <div className="login-stat" key={s.label}>
                            <div className="login-stat-label">{s.label}</div>
                            <div className="login-stat-value">{s.value}</div>
                            <div className="login-stat-delta">{s.delta}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Lado direito: form ── */}
            <div className="login-right">
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
