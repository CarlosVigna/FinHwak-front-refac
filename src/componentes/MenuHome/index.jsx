import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../pages/Login/AuthContext';
import Botao from '../../componentes/Botao';
import { useState, useEffect } from 'react';

function MenuHome() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const accountId = localStorage.getItem('accountId');
    const accountName = localStorage.getItem('accountName');
    const hasActiveAccount = !!accountId;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleIrParaContas = () => {
        localStorage.removeItem('accountId');
        localStorage.removeItem('accountName');
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
        navigate('/contas');
    };

    const handleDropdownItemClick = () => {
        setIsDropdownOpen(false);
        setIsMenuOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const closeDropdown = (e) => {
        if (!e.target.closest('.dropdown')) {
            setIsDropdownOpen(false);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
        if (isDropdownOpen) setIsDropdownOpen(false);
    };

    const handleLinkClick = () => {
        setIsMenuOpen(false);
        setIsDropdownOpen(false);
    };

    useEffect(() => {
        const closeMenu = (e) => {
            if (!e.target.closest('nav') && isMenuOpen) {
                setIsMenuOpen(false);
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, [isMenuOpen]);

    useEffect(() => {
        document.addEventListener('click', closeDropdown);
        return () => document.removeEventListener('click', closeDropdown);
    }, []);

    return (
        <nav className='nav'>
            <Link to="/" className="nav-brand" onClick={handleLinkClick}>FinHawk</Link>

            <div className="nav-header">
                <button
                    className="menu-toggle"
                    onClick={toggleMenu}
                    aria-label="Menu"
                    aria-expanded={isMenuOpen}
                >
                    {isMenuOpen ? '✕' : '☰'}
                </button>
            </div>

            <div
                className={`nav-overlay ${isMenuOpen ? 'active' : ''}`}
                onClick={() => setIsMenuOpen(false)}
            />

            <ul className={`nav-list ${isMenuOpen ? 'active' : ''}`}>
                
                {isAuthenticated && (
                    <>
                        <li className={isActive('/contas') ? 'active' : ''}>
                            <button
                                type="button"
                                className="menu-link-button"
                                onClick={handleIrParaContas}
                            >
                                Contas
                            </button>
                        </li>

                        <li className={isActive('/configuracoes') ? 'active' : ''}>
                            <Link to="/configuracoes" onClick={handleLinkClick}>Configurações</Link>
                        </li>

                        {hasActiveAccount && (
                            <>
                                {accountName && (
                                    <li className="conta-ativa-indicator">
                                        <span className="conta-ativa-label">🏦 {accountName}</span>
                                    </li>
                                )}

                                <li className={isActive('/dashboard') ? 'active' : ''}>
                                    <Link to="/dashboard" onClick={handleLinkClick}>Dashboard</Link>
                                </li>

                                <li className={isActive('/cadastroTitulo') ? 'active' : ''}>
                                    <Link to="/cadastroTitulo" onClick={handleLinkClick}>Cadastro de Títulos</Link>
                                </li>

                                <li className={isActive('/contas-pendentes') ? 'active' : ''}>
                                    <Link to="/contas-pendentes" onClick={handleLinkClick}>Contas Pendentes</Link>
                                </li>

                                <li className={isActive('/cadastrarCategoria') ? 'active' : ''}>
                                    <Link to="/cadastrarCategoria" onClick={handleLinkClick}>Cadastro Categoria</Link>
                                </li>

                                <li className={isActive('/checklist-mensal') ? 'active' : ''}>
                                    <Link to="/checklist-mensal" onClick={handleLinkClick}>Checklist</Link>
                                </li>

                                <li
                                    className={`dropdown ${isActive('/rel') ? 'active' : ''} ${isDropdownOpen ? 'open' : ''}`}
                                >
                                    <Link
                                        to="#"
                                        className="dropdown-toggle"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setIsDropdownOpen(!isDropdownOpen);
                                        }}
                                        aria-expanded={isDropdownOpen}
                                        role="button"
                                    >
                                        Relatórios
                                    </Link>

                                    <ul className="dropdown-content" role="menu">
                                        <li className={isActive('/relContasReceber') ? 'active' : ''}>
                                            <Link to="/relContasReceber" onClick={handleDropdownItemClick}>
                                                Contas a Receber
                                            </Link>
                                        </li>

                                        <li className={isActive('/relContasPagar') ? 'active' : ''}>
                                            <Link to="/relContasPagar" onClick={handleDropdownItemClick}>
                                                Contas a Pagar
                                            </Link>
                                        </li>

                                        <li className={isActive('/relRecebimentos') ? 'active' : ''}>
                                            <Link to="/relRecebimentos" onClick={handleDropdownItemClick}>
                                                Recebimentos
                                            </Link>
                                        </li>

                                        <li className={isActive('/relPagamentos') ? 'active' : ''}>
                                            <Link to="/relPagamentos" onClick={handleDropdownItemClick}>
                                                Pagamentos
                                            </Link>
                                        </li>
                                    </ul>
                                </li>
                            </>
                        )}
                    </>
                )}
            </ul>

            <div className='buttons'>
                {!isAuthenticated ? (
                    <Link to='/login'>
                        <Botao texto="Login" />
                    </Link>
                ) : (
                    <Botao texto="Logout" onClick={handleLogout} />
                )}

                {!isAuthenticated && (
                    <Botao texto="Cadastrar" onClick={() => navigate('/cadastro')} />
                )}
            </div>
        </nav>
    );
}

export default MenuHome;
