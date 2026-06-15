import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/Login/AuthContext';
import { useTheme } from '../../hooks/useTheme';
import { useAccount } from '../../contexts/AccountContext';

function NavItem({ to, icon, label, locked, onLockedClick }) {
    if (locked) {
        return (
            <button
                className="sb-item sb-item--locked"
                onClick={onLockedClick}
                title="Selecione uma conta primeiro"
            >
                <span className={`sb-icon sb-icon-${icon}`} />
                {label}
            </button>
        );
    }
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

    const { accountId, accountName, clearAccount } = useAccount();
    const hasAccount = !!accountId;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleGoToContas = () => {
        clearAccount();
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
                        <div className="sb-logo-mark">
                        <img src="/icone.svg" alt="FH" className="sb-logo-img" />
                    </div>
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
                    <div className="sb-section">Visão geral</div>
                    <NavItem to="/dashboard"          icon="blue"   label="Dashboard"   locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/cadastroTitulo"     icon="muted"  label="Lançamentos" locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/cadastrarCategoria" icon="muted"  label="Categorias"  locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/contas-pendentes"   icon="amber"  label="Pendentes"   locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/checklist-mensal"   icon="purple" label="Checklist"   locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />

                    <div className="sb-section">Relatórios</div>
                    <NavItem to="/relContasReceber"  icon="green"  label="A receber"  locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/relContasPagar"    icon="red"    label="A pagar"    locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/relRecebimentos"   icon="muted"  label="Recebidas"  locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
                    <NavItem to="/relPagamentos"     icon="muted"  label="Pagas"      locked={!hasAccount} onLockedClick={() => { setIsMobileOpen(false); navigate('/contas'); }} />
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
