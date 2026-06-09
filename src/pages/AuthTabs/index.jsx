import { useState, useEffect } from 'react';
import Login from '../Login/Login';
import CadastroUsuario from '../CadastroUsuario';
import PropTypes from 'prop-types';

const AuthTabs = ({ initialTab = 'login' }) => {
  const [active, setActive] = useState(initialTab);

  useEffect(() => {
    setActive(initialTab);
  }, [initialTab]);

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
            <div className="tabs">
              <button className={`tab ${active === 'login' ? 'active' : ''}`} onClick={() => setActive('login')}>Login</button>
              <button className={`tab ${active === 'cadastro' ? 'active' : ''}`} onClick={() => setActive('cadastro')}>Cadastro</button>
            </div>
          </div>

          <div className="auth-content">
            {active === 'login' ? <Login /> : <CadastroUsuario />}
          </div>
        </div>
      </section>
    </div>
  );
};

AuthTabs.propTypes = {
  initialTab: PropTypes.string,
};

export default AuthTabs;
