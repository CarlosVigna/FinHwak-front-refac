import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/Login/AuthContext';
import { useTheme } from '../../hooks/useTheme';

function NavItem({ to, icon, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
        >
            <span className={`sb-icon sb-icon-${icon}`} />
            {label}
        </NavLink>
    );
}

function MenuHome() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const accountId   = localStorage.getItem('accountId');
    const accountName = localStorage.getItem('accountName');
    const hasAccount  = !!accountId;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoToContas = () => {
        localStorage.removeItem('accountId');
        localStorage.removeItem('accountName');
        setIsMobileOpen(false);
        navigate('/contas');
    };

    const closeOnNav = () => setIsMobileOpen(false);

    return (
        <>
            {/* Hamburger — mobile only */}
            <button
                className="hamburger"
                onClick={() => setIsMobileOpen(o => !o)}
                aria-label="Abrir menu"
            >
                {isMobileOpen ? '✕' : '☰'}
            </button>

            {/* Overlay — mobile only */}
            <div
                className={`sb-overlay${isMobileOpen ? ' active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
            />

            <aside className={`sidebar${isMobileOpen ? ' open' : ''}`}>

                {/* Topo: logo + conta ativa */}
                <div className="sb-top">
                    <div className="sb-brand">
                        <div className="sb-logo-mark">FH</div>
                        <span className="sb-logo-name">FinHawk</span>
                    </div>

                    {accountName && (
                        <div className="sb-account-pill" onClick={handleGoToContas}>
                            <span className="sb-account-dot" />
                            <span className="sb-account-name">{accountName}</span>
                            <span className="sb-account-arrow">⌄</span>
                        </div>
                    )}
                </div>

                {/* Navegação */}
                <nav className="sb-nav" onClick={closeOnNav}>
                    {hasAccount && (
                        <>
                            <div className="sb-section">Visão geral</div>
                            <NavItem to="/dashboard"          icon="blue"   label="Dashboard" />
                            <NavItem to="/cadastroTitulo"     icon="muted"  label="Lançamentos" />
                            <NavItem to="/cadastrarCategoria" icon="muted"  label="Categorias" />

                            <div className="sb-section">Relatórios</div>
                            <NavItem to="/relContasReceber"  icon="green"  label="A receber" />
                            <NavItem to="/relContasPagar"    icon="red"    label="A pagar" />
                            <NavItem to="/relRecebimentos"   icon="muted"  label="Recebidas" />
                            <NavItem to="/relPagamentos"     icon="muted"  label="Pagas" />
                            <NavItem to="/contas-pendentes"  icon="amber"  label="Pendentes" />
                            <NavItem to="/checklist-mensal"  icon="purple" label="Checklist" />
                        </>
                    )}
                </nav>

                {/* Rodapé */}
                <div className="sb-footer" onClick={closeOnNav}>
                    <button className="sb-theme-btn" onClick={toggleTheme}>
                        {theme === 'dark' ? '☀ Modo claro' : '🌙 Modo escuro'}
                    </button>
                    <NavItem to="/contas"        icon="muted" label="Contas" />
                    <NavItem to="/configuracoes" icon="muted" label="Configurações" />
                    <button className="sb-item sb-logout" onClick={handleLogout}>
                        <span className="sb-icon sb-icon-muted" />
                        Sair
                    </button>
                </div>

            </aside>
        </>
    );
}

export default MenuHome;
