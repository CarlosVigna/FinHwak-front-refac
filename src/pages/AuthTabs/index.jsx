import { useState, useEffect } from 'react';
import Login from '../Login';
import CadastroUsuario from '../CadastroUsuario';
import './authTabs.css';
import PropTypes from 'prop-types';

const AuthTabs = ({ initialTab = 'login' }) => {
  const [active, setActive] = useState(initialTab);

  useEffect(() => {
    setActive(initialTab);
  }, [initialTab]);

  return (
    <div className="auth-tabs-shell">
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
    </div>
  );
};

AuthTabs.propTypes = {
  initialTab: PropTypes.string,
};

export default AuthTabs;


